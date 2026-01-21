import { Module } from "@nestjs/common";
import { CryptoService } from "./crypto.service";
import { BcryptCryptoService } from "./bcrypt.crypto";

@Module({
    providers: [
        {
            provide: CryptoService,
            useClass: BcryptCryptoService,
        },
    ],
    exports: [CryptoService],
})
export class CryptoModule {}
