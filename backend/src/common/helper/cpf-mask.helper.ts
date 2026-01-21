export function maskCpf(cpf: string): string {
    if (!cpf || !/^\d{11}$/.test(cpf)) {
        return "***.***.***-**";
    }

    return cpf.replace(/^(\d{3})\d{3}\d{3}(\d{2})$/, "$1.***.***-$2");
}
