import { Controller, Post, Body } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheet.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('google-sheets')
@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Post('create-spreadsheet')
  @ApiOperation({ summary: 'Create a new Google Spreadsheet' })
  @ApiResponse({
    status: 201,
    description: 'Spreadsheet created successfully.',
  })
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
  @ApiOperation({ summary: 'Create a new sheet in an existing spreadsheet' })
  async createSheet(
    @Body() createSheetDto: { spreadsheetId: string; sheetTitle: string },
  ) {
    const { spreadsheetId, sheetTitle } = createSheetDto;
    await this.googleSheetsService.createSheet(spreadsheetId, sheetTitle);
  }

  @Post('append-data')
  @ApiOperation({ summary: 'Append data to a sheet' })
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
  @ApiOperation({ summary: 'Share a spreadsheet with a user' })
  async shareSpreadsheet(
    @Body() shareSpreadsheetDto: { spreadsheetId: string; email: string },
  ) {
    const { spreadsheetId, email } = shareSpreadsheetDto;
    await this.googleSheetsService.shareSpreadsheet(spreadsheetId, email);
  }

  @Post('set-spreadsheet-public')
  @ApiOperation({ summary: 'Set a spreadsheet to be publicly accessible' })
  async setSpreadsheetPublic(
    @Body() setSpreadsheetPublicDto: { spreadsheetId: string },
  ) {
    const { spreadsheetId } = setSpreadsheetPublicDto;
    await this.googleSheetsService.setSpreadsheetPublic(spreadsheetId);
  }
}
