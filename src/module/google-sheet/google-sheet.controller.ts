import { Controller, Post, Body } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheet.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Post('create-spreadsheet')
  async createSpreadsheet(
    @Body() createSpreadsheetDto: { title: string; data: any },
  ) {
    const { title, data } = createSpreadsheetDto;
    const spreadsheetId = await this.googleSheetsService.createSpreadsheet(
      title,
      data,
    );
    return spreadsheetId;
  }

  @Post('create-sheet')
  async createSheet(
    @Body() createSheetDto: { spreadsheetId: string; sheetTitle: string },
  ) {
    const { spreadsheetId, sheetTitle } = createSheetDto;
    await this.googleSheetsService.createSheet(spreadsheetId, sheetTitle);
  }

  @Post('append-data')
  async appendData(
    @Body()
    appendDataDto: {
      spreadsheetId: string;
      sheetTitle: string;
      data: any;
    },
  ) {
    const { spreadsheetId, sheetTitle, data } = appendDataDto;
    await this.googleSheetsService.appendData(spreadsheetId, sheetTitle, data);
  }

  @Post('share-spreadsheet')
  async shareSpreadsheet(
    @Body() shareSpreadsheetDto: { spreadsheetId: string; email: string },
  ) {
    const { spreadsheetId, email } = shareSpreadsheetDto;
    await this.googleSheetsService.shareSpreadsheet(spreadsheetId, email);
  }

  @Post('set-spreadsheet-public')
  async setSpreadsheetPublic(
    @Body() setSpreadsheetPublicDto: { spreadsheetId: string },
  ) {
    const { spreadsheetId } = setSpreadsheetPublicDto;
    await this.googleSheetsService.setSpreadsheetPublic(spreadsheetId);
  }
}
