import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto, RegisterUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import { IUser } from "./user.interface";
import aqp from "api-query-params";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
  };

  isValidPassword = (myPlaintextPassword: string, hash: string): boolean => {
    return bcrypt.compareSync(myPlaintextPassword, hash);
  };

  create = async (createUserDto: CreateUserDto, userDecorator: IUser) => {
    const { name, email, password, age, gender, address, role, company } =
      createUserDto;
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    }

    const hashPassword = this.getHashPassword(password);

    const newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: userDecorator._id,
        email: userDecorator.email,
      },
    });
    return newUser;
  };

  findAll = async (page: number, limit: number, qs: string) => {
    const { filter, sort, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    const offset = (page - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select("-password")
      .populate(population)
      .exec();

    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  };

  findOne = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found User";
    }
    return await this.userModel.findById(id).select("-password");
  };

  update = async (updateUserDto: UpdateUserDto, userDecorator: IUser) => {
    const updatedUser = await this.userModel.updateOne(
      {
        _id: updateUserDto._id,
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: userDecorator._id,
          email: userDecorator.email,
        },
      },
    );
    return updatedUser;
  };

  remove = async (id: string, userDecorator: IUser) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found User";
    }
    await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: userDecorator._id,
          email: userDecorator.email,
        },
      },
    );
    return this.userModel.softDelete({ _id: id });
  };

  findOneByEmail(username: string) {
    return this.userModel.findOne({
      email: username,
    });
  }

  register = async (registerUserDto: RegisterUserDto) => {
    const { name, email, password, age, gender, address } = registerUserDto;

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    }

    const hashPassword = this.getHashPassword(password);
    const newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: "USER",
    });
    return newRegister;
  };

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };
}
