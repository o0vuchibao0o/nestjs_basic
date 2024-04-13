import { Injectable } from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { Company, CompanyDocument } from "./schemas/company.schema";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { IUser } from "src/users/user.interface";
import aqp from "api-query-params";
import { UserDecorator } from "src/decorator/customize";

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    @UserDecorator() userDecorator: IUser,
  ) {
    return await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: userDecorator._id,
        email: userDecorator.email,
      },
    });
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, skip, sort, projection, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    const offset = (+page - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    @UserDecorator() userDecorator: IUser,
  ) {
    return await this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: {
          _id: userDecorator._id,
          email: userDecorator.email,
        },
      },
    );
  }

  async remove(id: string, @UserDecorator() userDecorator: IUser) {
    await this.companyModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: userDecorator._id,
          email: userDecorator.email,
        },
      },
    );
    return await this.companyModel.softDelete({ _id: id });
  }
}
