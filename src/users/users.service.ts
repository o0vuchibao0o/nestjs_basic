import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
  };

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    const user = await this.userModel.create({
      email: createUserDto.email,
      password: hashPassword,
      name: createUserDto.name,
    });
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found User";
    }
    return this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found User";
    }
    return await this.userModel.updateOne({ _id: id }, { ...updateUserDto });
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found User";
    }
    return this.userModel.softDelete({ _id: id });
  }

  findOneByEmail(username: string) {
    return this.userModel.findOne({
      email: username,
    });
  }

  isValidPassword(myPlaintextPassword: string, hash: string): boolean {
    return bcrypt.compareSync(myPlaintextPassword, hash);
  }
}
