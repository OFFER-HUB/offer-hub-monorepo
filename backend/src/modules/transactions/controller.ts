import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
} from "@nestjs/common";
import { TransactionsService } from "./service";
import { CreateTransactionDto, UpdateTransactionDto } from "./dto";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  @Get("/:transaction_id")
  async findOne(@Param("transaction_id") transaction_id: string) {
    return this.transactionsService.findById(transaction_id);
  }

  @Patch("/:transaction_id")
  async update(
    @Param("transaction_id") transaction_id: string,
    @Body() dto: UpdateTransactionDto
  ) {
    return this.transactionsService.update(transaction_id, dto);
  }

  @Delete("/:transaction_id")
  async delete(@Param("transaction_id") transaction_id: string) {
    return this.transactionsService.delete(transaction_id);
  }

  @Post("/:transaction_id/release-funds")
  async releaseFunds(@Param("transaction_id") transaction_id: string) {
    return this.transactionsService.releaseFunds(transaction_id);
  }
}
