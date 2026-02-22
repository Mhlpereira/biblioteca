import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "./common/filter/http-exception.filter";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.useLogger(app.get(Logger));

    app.useGlobalFilters(new AllExceptionsFilter());

    app.enableCors({
        origin: true,
        credentials: true,
        allowedHeaders: "Content-Type, Accept, Authorization",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    const config = new DocumentBuilder()
        .setTitle("Biblioteca API")
        .setDescription("API de gerenciamento de biblioteca")
        .setVersion("1.0")
        .addTag("biblioteca")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port, "0.0.0.0");
    console.log(`Listening on http://0.0.0.0:${port}`);
}
bootstrap();
