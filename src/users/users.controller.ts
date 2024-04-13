import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  PublicDecorator,
  ResponseMessage,
  UserDecorator,
} from "src/decorator/customize";
import { IUser } from "./user.interface";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage("Create a new user")
  async create(
    @Body() createUserDto: CreateUserDto,
    @UserDecorator() userDecorator: IUser,
  ) {
    const newUser = await this.usersService.create(
      createUserDto,
      userDecorator,
    );
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  @Get()
  @ResponseMessage("Fetch user with paginate")
  findAll(
    @Query("page") page: string,
    @Query("limit") limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+page, +limit, qs);
  }

  @PublicDecorator()
  @Get(":id")
  @ResponseMessage("Fetch user by id")
  async findOne(@Param("id") id: string) {
    return await this.usersService.findOne(id);
  }

  @ResponseMessage("Update a User")
  // @Patch(":id")
  @Patch()
  update(
    @Body() updateUserDto: UpdateUserDto,
    @UserDecorator() userDecorator: IUser,
  ) {
    const updatedUser = this.usersService.update(updateUserDto, userDecorator);
    return updatedUser;
  }

  @Delete(":id")
  @ResponseMessage("Delete a User")
  remove(@Param("id") id: string, @UserDecorator() userDecorator: IUser) {
    return this.usersService.remove(id, userDecorator);
  }
}
