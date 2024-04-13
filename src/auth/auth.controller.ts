import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PublicDecorator, ResponseMessage } from "src/decorator/customize";
import { LocalAuthGuard } from "./local-auth.guard";
import { RegisterUserDto } from "src/users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicDecorator()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ResponseMessage("User login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @PublicDecorator()
  @ResponseMessage("Register a new user")
  @Post("register")
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
}
