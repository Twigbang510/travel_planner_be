import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheet.service';
import { GoogleSheetsController } from './google-sheet.controller';
import { AppConfigService } from '../config/app-config.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [GoogleSheetsController],
  providers: [GoogleSheetsService],
  exports: [GoogleSheetsService],
})
export class GoogleSheetModule {}
