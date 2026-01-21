import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useLogger(app.get(Logger));

    const config = new DocumentBuilder()
        .setTitle("Biblioteca API")
        .setDescription("API de gerenciamento de biblioteca")
        .setVersion("1.0")
        .addTag("biblioteca")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
