"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterOutputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const cpf_mask_helper_1 = require("../../common/helper/cpf-mask.helper");
class RegisterOutputDto {
    id;
    cpf;
    name;
    lastName;
    createdAt;
    updatedAt;
    constructor(client) {
        this.id = client.id;
        this.cpf = (0, cpf_mask_helper_1.maskCpf)(client.cpf);
        this.name = client.name;
        this.lastName = client.lastName;
        this.createdAt = client.createdAt;
        this.updatedAt = client.updatedAt;
    }
}
exports.RegisterOutputDto = RegisterOutputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "01HXXXXXXXXXXXXXXXXXXXXX" }),
    __metadata("design:type", String)
], RegisterOutputDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "123.***.***-01" }),
    __metadata("design:type", String)
], RegisterOutputDto.prototype, "cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "João" }),
    __metadata("design:type", String)
], RegisterOutputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Silva" }),
    __metadata("design:type", String)
], RegisterOutputDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2023-01-01T00:00:00.000Z" }),
    __metadata("design:type", Date)
], RegisterOutputDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2023-01-01T00:00:00.000Z" }),
    __metadata("design:type", Date)
], RegisterOutputDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=output-register.dto.js.map