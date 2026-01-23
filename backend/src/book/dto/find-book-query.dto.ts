import { IsOptional, IsString } from "class-validator";


export class FindBooksQueryDto{

    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    author: string;


}