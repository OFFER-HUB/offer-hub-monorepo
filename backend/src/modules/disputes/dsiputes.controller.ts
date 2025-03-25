import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from "@nestjs/common";
import { DisputesService } from "./disputes.service";
import { CreateDisputeDto, UpdateDisputeDto } from "./disputes.dto";
import { DisputeEntity } from "./disputes.entity";

@Controller("disputes")
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post("create")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createDispute(@Body() dto: CreateDisputeDto): Promise<DisputeEntity> {
    return this.disputesService.createDispute(dto);
  }

  @Get()
  async getAllDisputes(): Promise<DisputeEntity[]> {
    return this.disputesService.getAllDisputes();
  }

  @Get(":id")
  async getDisputeById(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<DisputeEntity> {
    return this.disputesService.getDisputeById(id);
  }

  @Put(":id/resolve")
  async updateDispute(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: UpdateDisputeDto
  ): Promise<DisputeEntity> {
    return this.disputesService.updateDispute(id, dto);
  }

  @Delete(":id")
  async deleteDispute(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.disputesService.deleteDispute(id);
  }
}
