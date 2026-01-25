import { IsBoolean, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";


export class FindBooksQueryDto extends PaginationDto{

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