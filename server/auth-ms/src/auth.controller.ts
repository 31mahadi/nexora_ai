import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private auth: AuthService) {}

  @Post("session")
  async createSession(
    @Body("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) throw new UnauthorizedException("Missing refresh_token");
    const result = await this.auth.createSession(refreshToken);
    if (!result) throw new UnauthorizedException("Invalid refresh token");
    res.setHeader("Set-Cookie", result.setCookie);
    return { user: result.user };
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.[this.auth.getSessionCookieName()];
    if (!sessionId) throw new UnauthorizedException("No session");
    const result = await this.auth.refreshSession(sessionId);
    if (!result) throw new UnauthorizedException("Invalid session");
    if (result.setCookie) res.setHeader("Set-Cookie", result.setCookie);
    return { user: result.user };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.[this.auth.getSessionCookieName()];
    if (sessionId) await this.auth.logout(sessionId);
    res.setHeader("Set-Cookie", `${this.auth.getSessionCookieName()}=; Path=/; Max-Age=0`);
    return { success: true };
  }

  @Get("me")
  async me(@Req() req: Request) {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const sessionId = req.cookies?.[this.auth.getSessionCookieName()];

    if (bearer) {
      const user = await this.auth.validateToken(bearer);
      if (user) return { user };
    }

    if (sessionId) {
      const data = await this.auth.getSession(sessionId);
      if (data)
        return {
          user: { id: data.userId, email: "", tenantId: data.tenantId, role: data.role },
        };
    }

    throw new UnauthorizedException("Not authenticated");
  }
}
