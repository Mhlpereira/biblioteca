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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const validar_cpf_1 = require("validar-cpf");
const crypto_service_1 = require("../common/crypto/crypto.service");
const typeorm_1 = require("@nestjs/typeorm");
const client_entity_1 = require("./entities/client.entity");
const typeorm_2 = require("typeorm");
let ClientService = class ClientService {
    clientRepository;
    cryptoService;
    constructor(clientRepository, cryptoService) {
        this.clientRepository = clientRepository;
        this.cryptoService = cryptoService;
    }
    async createClient(createClientDto) {
        if (!(0, validar_cpf_1.default)(createClientDto.cpf)) {
            throw new common_1.BadRequestException("Cpf inválido");
        }
        const existingClient = await this.clientRepository.findOneBy({ cpf: createClientDto.cpf });
        if (existingClient) {
            throw new common_1.BadRequestException("CPF já cadastrado");
        }
        const client = this.clientRepository.create({
            id: ulid(),
            cpf: createClientDto.cpf,
            name: createClientDto.name,
            lastName: createClientDto.lastName,
            password: createClientDto.password,
        });
        return this.clientRepository.save(client);
    }
    findAll() {
        return `This action returns all client`;
    }
    findOne(id) {
        return `This action returns a #${id} client`;
    }
    update(id, updateClientDto) {
        return `This action updates a #${id} client`;
    }
    remove(id) {
        return `This action removes a #${id} client`;
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        crypto_service_1.CryptoService])
], ClientService);
function ulid() {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=client.service.js.map