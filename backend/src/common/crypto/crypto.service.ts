

export abstract class CryptoService {
    abstract hash(value: string): Promise<string>;
    abstract compare(value: string, hash: string): Promise<string>;
}
