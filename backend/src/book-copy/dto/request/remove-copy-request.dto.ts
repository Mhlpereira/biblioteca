import { IsNotEmpty, IsString } from "class-validator";

export class RemoveCopyDto {
    @IsString()
    @IsNotEmpty()
    copyId: string;
}
