import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionModule } from "./session/session.module";

function validateEnv(env: Record<string, unknown>) {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "REDIS_URL"] as const;
  const missing = required.filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim().length === 0;
  });
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return env;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env", "../../.env.local", "../../.env"],
      validate: validateEnv,
    }),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
