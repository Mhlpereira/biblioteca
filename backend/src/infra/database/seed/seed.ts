import { DataSource } from "typeorm";
import { ulid } from "ulid";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { Role } from "../../../auth/enum/role.enum";
import { BookCopy } from "../../../book-copy/entities/book-copy.entity";
import { BookCopyStatus } from "../../../book-copy/enum/book-status.enum";
import { Book } from "../../../book/entities/book.entity";
import { Client } from "../../../client/entities/client.entity";
import { REAL_BOOKS } from './data';

dotenv.config(); 


async function seed() {
    console.log("🌱 Iniciando Seed...");

    const dataSource = new DataSource({
        type: "postgres", 
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "library_db",
        entities: [Client, Book, BookCopy], 
        synchronize: false, 
    });

    await dataSource.initialize();
    console.log("🔌 Conectado ao banco de dados!");

    const clientRepo = dataSource.getRepository(Client);
    const bookRepo = dataSource.getRepository(Book);
    const copyRepo = dataSource.getRepository(BookCopy);

    const passwordHash = await bcrypt.hash("123456", 10);

    const admin = clientRepo.create({
        id: ulid(),
        cpf: "00000000000",
        name: "Admin",
        lastName: "System",
        password: passwordHash,
        role: Role.ADMIN, 
        active: true,
    });

    const user = clientRepo.create({
        id: ulid(),
        cpf: "11111111111",
        name: "Dev",
        lastName: "Junior",
        password: passwordHash,
        role: Role.USER,
        active: true,
    });

    if (!(await clientRepo.findOneBy({ cpf: admin.cpf }))) await clientRepo.save(admin);
    if (!(await clientRepo.findOneBy({ cpf: user.cpf }))) await clientRepo.save(user);

    console.log("👤 Usuários criados: admin (CPF 000...00) e user (CPF 111...11) | Senha: 123456");

    for (const bookData of REAL_BOOKS) {
        let book = await bookRepo.findOneBy({ title: bookData.title });

        if (!book) {
            book = bookRepo.create({
                id: ulid(),
                title: bookData.title,
                author: bookData.author,
                imageUrl: bookData.imageUrl,
                active: true,
            });
            await bookRepo.save(book);
            console.log(`📚 Livro criado: ${book.title}`);

            const copies: BookCopy[] = [];
            for (let i = 0; i < 3; i++) {
                copies.push(
                    copyRepo.create({
                        id: ulid(),
                        book: book,
                        status: BookCopyStatus.AVAILABLE, 
                    })
                );
            }
            await copyRepo.save(copies);
            console.log(`   ↳ 3 Cópias adicionadas.`);
        }
    }

    await dataSource.destroy();
    console.log("✅ Seed finalizado com sucesso!");
}

seed().catch(error => {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
});
