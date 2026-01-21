"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptCryptoService = void 0;
const bcrypt = require("bcrypt");
class BcryptCryptoService {
    hash(value) {
        return bcrypt.hash(value, 10);
    }
    compare(value, hash) {
        return bcrypt.compare(value, hash);
    }
}
exports.BcryptCryptoService = BcryptCryptoService;
//# sourceMappingURL=bcrypt.crypto.js.map