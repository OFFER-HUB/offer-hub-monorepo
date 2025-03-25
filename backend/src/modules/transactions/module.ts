import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionsController } from "./controller";
import { TransactionsService } from "./service";
import { Transaction } from "./entity";
import { User } from "../users/entity";
import { Project } from "../projects/entity";
import { InvoiceModule } from "../invoices/module";
import { DisputeEntity } from "../disputes/disputes.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Project, DisputeEntity]),
    forwardRef(() => InvoiceModule)
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}