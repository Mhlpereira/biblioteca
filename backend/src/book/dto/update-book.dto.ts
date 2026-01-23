import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './book-create.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {

    @IsOptional()
    @IsString()
    title?: string | undefined;

    @IsOptional()
    @IsString()
    author?: string | undefined;
}
