import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAI } from 'openai';

@Injectable()
export class AiInterviewService {
  private client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  constructor(private prisma: PrismaService) {}

  private checkRateLimitError(completion: any) {
    const msg = completion?.error?.message?.toLowerCase() || '';
    if (msg.includes('rate limit') || completion?.error?.code === 429) {
      throw new BadRequestException(
        'Limit penggunaan AI sudah habis. Silakan coba lagi besok atau upgrade paket.',
      );
    }
  }

  private validateAiResponse(completion: any, context = 'AI') {
    this.checkRateLimitError(completion);
    const raw = completion?.choices?.[0]?.message?.content?.trim();
    if (!raw)
      throw new BadRequestException(`${context} tidak memberikan respons.`);
    return raw;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\\boxed\s*{/, '')
      .replace(/\\end{boxed}/, '')
      .replace(/[{}\[\]]/g, '')
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .replace(/^"(.*)"$/, '$1')
      .trim();
  }

  async getQuestionsToAnswer(interviewId: string) {
    const interview = await this.prisma.aiInterview.findUnique({
      where: { id: interviewId },
      include: { questions: true },
    });

    if (!interview) {
      throw new NotFoundException('Interview tidak ditemukan.');
    }

    return interview.questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer ?? null,
    }));
  }

  async getInterviewDetail(applicationId: string) {
    const interview = await this.prisma.aiInterview.findUnique({
      where: { application_id: applicationId },
      include: { questions: { include: { feedback: true } } },
    });

    if (!interview) {
      throw new NotFoundException(
        'Interview tidak ditemukan untuk aplikasi ini.',
      );
    }

    return {
      application_id: interview.application_id,
      feedback: interview.feedback,
      created_at: interview.created_at,
      updated_at: interview.updated_at,
      questions: interview.questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        feedback: q.feedback?.feedback || null,
      })),
    };
  }

  async testAskQuestion(question: string): Promise<string> {
    try {
      const completion: any = await this.client.chat.completions.create({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [{ role: 'user', content: question }],
      });

      const raw = this.validateAiResponse(completion, 'AI');
      return raw;
    } catch (err) {
      this.handleAiError(err);
    }
  }

  async generateInterview(applicationId: string) {
    const existing = await this.prisma.aiInterview.findUnique({
      where: { application_id: applicationId },
    });

    if (existing) {
      throw new ConflictException(
        'Interview sudah pernah dibuat untuk aplikasi ini.',
      );
    }

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application tidak ditemukan.');
    }

    const topic = application.job.short_description;
    const questions = await this.generateQuestions(topic);

    return this.prisma.aiInterview.create({
      data: {
        application: { connect: { id: applicationId } },
        questions: {
          create: questions.map((q) => ({ question: q })),
        },
      },
      include: { questions: true },
    });
  }

  async submitAnswers(
    interviewId: string,
    answers: { questionId?: string; answer?: string }[],
  ) {
    await Promise.all(
      answers.map((a) =>
        this.prisma.aiInterviewQuestion.update({
          where: { id: a.questionId },
          data: { answer: a.answer },
        }),
      ),
    );

    const questions = await this.prisma.aiInterviewQuestion.findMany({
      where: { aiInterview_id: interviewId },
    });

    const feedbacks = await this.evaluateAnswersPerQuestion(
      questions.map((q) => ({ question: q.question, answer: q.answer! })),
    );

    await Promise.all(
      questions.map((q, i) =>
        this.prisma.aiInterviewFeedback.upsert({
          where: { question_id: q.id },
          update: { feedback: feedbacks[i] },
          create: {
            question_id: q.id,
            feedback: feedbacks[i],
          },
        }),
      ),
    );

    const finalFeedback = await this.evaluateFinalFeedback(
      questions.map((q) => ({ question: q.question, answer: q.answer! })),
    );

    await this.prisma.aiInterview.update({
      where: { id: interviewId },
      data: { feedback: finalFeedback },
    });

    return {
      message: 'Berhasil menyimpan jawaban dan feedback.',
      feedbacks,
      finalFeedback,
    };
  }

  private async generateQuestions(topic: string): Promise<string[]> {
    const prompt = `
      Buatkan 5 pertanyaan interview untuk topik: "${topic}".
      Jawaban hanya berupa 5 pertanyaan, masing-masing satu baris, TANPA angka, bullet, tanda kurung, JSON, atau format LaTeX.
      Contoh output:
      Apa motivasi Anda melamar pekerjaan ini?
      Apa tantangan utama seorang Back End Developer?
      ...
      `;

    try {
      const completion: any = await this.client.chat.completions.create({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = this.validateAiResponse(completion, 'generateQuestions');

      const cleaned = content
        .replace(/\\boxed\s*{/, '')
        .replace(/\\end{boxed}/, '')
        .replace(/[{}\[\]]/g, '')
        .replace(/^\d+\.\s*/gm, '')
        .split('\n')
        .map((q) => q.trim())
        .filter((q) => q.length > 0 && q.endsWith('?'));

      if (cleaned.length !== 5) {
        throw new BadRequestException(
          `AI menghasilkan ${cleaned.length} pertanyaan, bukan 5.`,
        );
      }

      return cleaned;
    } catch (err) {
      this.handleAiError(err);
    }
  }

  private async evaluateAnswersPerQuestion(
    qas: { question: string; answer: string }[],
  ): Promise<string[]> {
    return Promise.all(
      qas.map(async ({ question, answer }, i) => {
        const prompt = `Pertanyaan: ${question}\nJawaban: ${answer}\n\nBerikan masukan singkat dan profesional dalam Bahasa Indonesia saja. Jangan gunakan Bahasa Inggris, LaTeX, atau format \\boxed. Hindari format markdown atau kode seperti \`\`\``;

        try {
          const completion: any = await this.client.chat.completions.create({
            model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
            messages: [{ role: 'user', content: prompt }],
          });

          const raw = this.validateAiResponse(completion, `feedback ${i + 1}`);
          return this.cleanText(raw);
        } catch (err) {
          this.handleAiError(err);
        }
      }),
    );
  }

  private async evaluateFinalFeedback(
    qas: { question: string; answer: string }[],
  ): Promise<string> {
    const prompt = `
  Berikut adalah jawaban dari 5 pertanyaan interview:
  
  ${qas.map((qa, i) => `Pertanyaan ${i + 1}: ${qa.question}\nJawaban: ${qa.answer}`).join('\n\n')}
  
  Berikan penilaian akhir secara singkat dan profesional terhadap jawaban-jawaban tersebut, maksimal 3 kalimat, dalam Bahasa Indonesia. Jangan gunakan markdown, LaTeX, \\boxed, atau simbol aneh.
  `;

    try {
      const completion: any = await this.client.chat.completions.create({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [{ role: 'user', content: prompt }],
      });

      const raw = this.validateAiResponse(completion, 'final feedback');
      return this.cleanText(raw);
    } catch (err) {
      this.handleAiError(err);
    }
  }

  private handleAiError(err: any) {
    const errorMessage =
      err?.error?.message || err?.message || 'Tidak diketahui';

    if (
      err?.error?.code === 429 ||
      errorMessage.toLowerCase().includes('rate limit') ||
      errorMessage.toLowerCase().includes('quota')
    ) {
      throw new BadRequestException(
        'Limit penggunaan AI sudah habis. Silakan coba lagi besok atau upgrade paket.',
      );
    }

    console.error('[OpenAI error]', err);
    throw new BadRequestException('Terjadi kesalahan pada AI: ' + errorMessage);
  }
}
