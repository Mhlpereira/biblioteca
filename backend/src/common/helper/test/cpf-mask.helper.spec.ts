import { maskCpf } from "../cpf-mask.helper";

describe("maskCpf", () => {
    it("should mask cpf correctly", () => {
        const cpf = "12345678901";
        const masked = maskCpf(cpf);

        expect(masked).toBe("123.***.***-01");
    });

    it("should return masked format for invalid cpf length", () => {
        const cpf = "123456789";
        const masked = maskCpf(cpf);

        expect(masked).toBe("***.***.***-**");
    });

    it("should return masked format for empty cpf", () => {
        const cpf = "";
        const masked = maskCpf(cpf);

        expect(masked).toBe("***.***.***-**");
    });

    it("should return masked format for null cpf", () => {
        const cpf = null as any;
        const masked = maskCpf(cpf);

        expect(masked).toBe("***.***.***-**");
    });

    it("should handle cpf with non-numeric characters", () => {
        const cpf = "abc45678901";
        const masked = maskCpf(cpf);

        expect(masked).not.toBe("123.***.***-01");
    });
});
