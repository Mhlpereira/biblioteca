import { IsOptional, IsString, IsBoolean, IsEnum } from "class-validator";
import { Role } from "../../auth/enum/role.enum";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class FindClientResponseDto extends PaginationDto {
    @IsOptional()
    @IsString()
    cpf?: string;
    @IsOptional()
    @IsString()
    name?: string;
    @IsOptional()
    @IsString()
    lastName?: string;
    @IsOptional()
    @IsBoolean()
    active?: boolean;
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}