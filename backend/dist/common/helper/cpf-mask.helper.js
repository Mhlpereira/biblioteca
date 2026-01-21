"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskCpf = maskCpf;
function maskCpf(cpf) {
    if (!cpf || !/^\d{11}$/.test(cpf)) {
        return "***.***.***-**";
    }
    return cpf.replace(/^(\d{3})\d{3}\d{3}(\d{2})$/, "$1.***.***-$2");
}
//# sourceMappingURL=cpf-mask.helper.js.map