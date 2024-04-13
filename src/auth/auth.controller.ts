import { Controller, Post, UseGuards, Body, Res, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PublicDecorator, ResponseMessage } from "src/decorator/customize";
import { LocalAuthGuard } from "./local-auth.guard";
import { RegisterUserDto } from "src/users/dto/create-user.dto";
import { Response } from "express";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicDecorator()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ResponseMessage("User login")
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @PublicDecorator()
  @ResponseMessage("Register a new user")
  @Post("register")
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
}
