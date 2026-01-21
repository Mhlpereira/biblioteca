import { CryptoService } from "./crypto.service";
export declare class BcryptCryptoService implements CryptoService {
    hash(value: string): Promise<string>;
    compare(value: string, hash: string): Promise<string>;
}
