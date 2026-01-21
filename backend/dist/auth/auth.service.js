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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const client_service_1 = require("../client/client.service");
const crypto_service_1 = require("../common/crypto/crypto.service");
let AuthService = class AuthService {
    clientService;
    cryptoService;
    constructor(clientService, cryptoService) {
        this.clientService = clientService;
        this.cryptoService = cryptoService;
    }
    async createClient(registerDto) {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new common_1.BadRequestException("As senhas não coincidem");
        }
        const hashedPassword = await this.cryptoService.hash(registerDto.password);
        const client = await this.clientService.create({
            cpf: registerDto.cpf,
            name: registerDto.name,
            lastName: registerDto.lastName,
            password: hashedPassword,
        });
        return {
            id: client.id,
            cpf: client.cpf,
            name: client.name,
            lastName: client.lastName,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        };
    }
    findAll() {
        return `This action returns all auth`;
    }
    findOne(id) {
        return `This action returns a #${id} auth`;
    }
    update(id, updateAuthDto) {
        return `This action updates a #${id} auth`;
    }
    remove(id) {
        return `This action removes a #${id} auth`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_service_1.ClientService,
        crypto_service_1.CryptoService])
], AuthService);
//# sourceMappingURL=auth.service.js.map