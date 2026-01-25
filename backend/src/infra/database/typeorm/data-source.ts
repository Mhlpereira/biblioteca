import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306", 10),
  username: process.env.DATABASE_USER || "user",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "biblioteca",
  entities: ["src/**/*.entity.ts", "dist/**/*.entity.js"],
  migrations: ["src/infra/database/typeorm/migrations/*{.ts,.js}"],
  synchronize: false,
  logging: process.env.NODE_ENV !== "production",
  namingStrategy: new SnakeNamingStrategy(),
});

export default dataSource;
