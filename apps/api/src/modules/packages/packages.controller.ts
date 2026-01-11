import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PackagesService } from "./packages.service";
import { CreatePackageDto, UpdatePackageDto } from "./dto/package.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("packages")
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreatePackageDto
  ) {
    return this.packagesService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.packagesService.findAll(req.user.id);
  }

  @Get("active")
  async findActive(@Request() req: { user: { id: string } }) {
    return this.packagesService.findActive(req.user.id);
  }

  @Get(":id")
  async findById(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ) {
    return this.packagesService.findById(req.user.id, id);
  }

  @Put(":id")
  async update(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdatePackageDto
  ) {
    return this.packagesService.update(req.user.id, id, dto);
  }

  @Delete(":id")
  async delete(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ) {
    return this.packagesService.delete(req.user.id, id);
  }
}
