import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Auth MS running on http://localhost:${port}`);
}

bootstrap().catch(console.error);
