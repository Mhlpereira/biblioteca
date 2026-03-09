import { SetMetadata } from '@nestjs/common';

export const PERMIT_ALL_KEY = 'isPublic';

export const Public = () => SetMetadata(PERMIT_ALL_KEY, true);