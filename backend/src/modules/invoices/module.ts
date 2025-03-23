import { Module } from '@nestjs/common';
import { InvoiceService } from './service';
import { PdfModule } from '../pdf/module';
import { TransactionsModule } from '../transactions/module';
import { UsersModule } from '../users/module';
import { ProjectsModule } from '../projects/module';

@Module({
  imports: [
    PdfModule,
    TransactionsModule,
    UsersModule,
    ProjectsModule,
  ],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
