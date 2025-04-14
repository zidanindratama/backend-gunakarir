import { SetMetadata } from '@nestjs/common';
import { BYPASS_APPROVAL_KEY } from '../constants/data.constant';

export const BypassApproval = () => SetMetadata(BYPASS_APPROVAL_KEY, true);
