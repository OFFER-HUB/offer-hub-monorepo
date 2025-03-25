import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DisputesService } from "./disputes.service";
import { DisputesController } from "./dsiputes.controller";
import { DisputeEntity } from "./disputes.entity";
import { Transaction } from "../transactions/entity";
import { User } from "../users/entity";

@Module({
  imports: [TypeOrmModule.forFeature([DisputeEntity, Transaction, User])],
  providers: [DisputesService],
  controllers: [DisputesController],
  exports: [DisputesService],
})
export class DisputesModule {}
