import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  console.log(`Tenant MS running on http://localhost:${port}`);
}

bootstrap().catch(console.error);
