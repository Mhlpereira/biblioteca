import { IsBoolean, IsOptional, IsString } from "class-validator";


export class FindBooksQueryDto{

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsBoolean()
    @IsOptional()
    onlyAvailable?: boolean;
}