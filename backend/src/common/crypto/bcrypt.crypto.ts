import { CryptoService } from "./crypto.service";
import * as bcrypt from "bcrypt";

export class BcryptCryptoService implements CryptoService {
    hash(value: string): Promise<string> {
        return bcrypt.hash(value, 10);
    }
    compare(value: string, hash: string): Promise<string> {
        return bcrypt.compare(value, hash);
    }
}
