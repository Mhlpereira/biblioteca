import { ApiProperty } from '@nestjs/swagger';

export class BookCopyOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty()
  bookTitle: string;
}