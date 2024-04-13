import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { IUser } from "src/users/user.interface";
import { RegisterUserDto } from "src/users/dto/create-user.dto";
import { ConfigService } from "@nestjs/config";
import ms from "ms";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  validateUser = async (username: string, pass: string): Promise<any> => {
    const user = await this.usersService.findOneByEmail(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  };

  login = async (user: IUser) => {
    const { _id, name, email, role } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role,
    };

    const refresh_token = this.createRefreshToken(payload);
    //update user with refresh token

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  };

  register = async (registerUserDto: RegisterUserDto) => {
    const newUser = await this.usersService.register(registerUserDto);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  };

  createRefreshToken = (payload) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn:
        ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000,
    });
    return refresh_token;
  };
}
