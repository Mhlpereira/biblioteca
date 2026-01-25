import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "../../auth/enum/role.enum";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class FindClientDto extends PaginationDto {
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
