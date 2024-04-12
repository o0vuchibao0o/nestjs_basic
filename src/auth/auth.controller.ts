import { Controller, Get, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "src/decorator/customize";
import { LocalAuthGuard } from "./local-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
