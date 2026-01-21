import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { BcryptCryptoService } from "../bcrypt.crypto";

jest.mock("bcrypt"); 

describe("BcryptCryptoService", () => {
    let service: BcryptCryptoService;

    beforeEach(() => {
        service = new BcryptCryptoService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should hash a value", async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

        const result = await service.hash("password");

        expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
        expect(result).toBe("hashed");
    });

    it("should compare a value with a hash", async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await service.compare("password", "hash");

        expect(bcrypt.compare).toHaveBeenCalledWith("password", "hash");
        expect(result).toBe(true);
    });

    it("should throw if bcrypt fails", async () => {
        (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("error"));

        await expect(service.hash("password")).rejects.toThrow("error");
    });
});
