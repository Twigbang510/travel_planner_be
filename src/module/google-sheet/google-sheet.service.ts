import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { AppConfigService } from '../config/app-config.service';
import { formatDateReadable } from 'src/utils/helpers';

@Injectable()
export class GoogleSheetsService {
  private sheets: any;
  private drive: any;

  constructor(private readonly configService: AppConfigService) {
    const keyFilePath = this.configService.googleCredentials;
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ];

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: scopes,
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async createSpreadsheet(title: string, data: any): Promise<any> {
    const request = {
      resource: {
        properties: {
          title: title,
        },
      },
    };

    try {
      const response = await this.sheets.spreadsheets.create(request);
      console.log(`Spreadsheet created:`, response.data);
      const spreadDetail = {
        speadTitle: response.data.properties.title,
        spreadsheetId: response.data.spreadsheetId,
        spreadsheetUrl: response.data.spreadsheetUrl,
      };
      await this.setSpreadsheetPublic(spreadDetail.spreadsheetId);
      const numRows = await this.appendData(
        spreadDetail.spreadsheetId,
        spreadDetail.speadTitle,
        data,
      );
      await this.formatSheet(spreadDetail.spreadsheetId, numRows);
      return spreadDetail;
    } catch (err) {
      console.error('Error creating spreadsheet:', err);
      throw err;
    }
  }

  async createSheet(spreadsheetId: string, sheetTitle: string) {
    const request = {
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
              },
            },
          },
        ],
      },
    };

    try {
      const response = await this.sheets.spreadsheets.batchUpdate(request);
      console.log(`Sheet ${sheetTitle} created:`, response.data);
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    }
  }

  async appendData(spreadsheetId: string, sheetTitle: string, data: any): Promise<number> {
    console.log('Append DAta', data);
    const rows = [
      ['Start Date', formatDateReadable(data.date_range[0])],
      ['End Date', formatDateReadable(data.date_range[1])],
      ['City', data.city],
      [],
      ['Date', 'Position', 'Address', 'name', 'Average Time', 'From Time', 'Next Time'],
    ];

    const mergeRequests = [];

    Object.keys(data.placeList).forEach((date) => {
      const dateRows = data.placeList[date].map((detail, index) => [
        index === 0 ? formatDateReadable(date) : '',
        detail.position,
        detail.details.formatted_address,
        detail.details.name,
        detail.visitTime,
        detail.fromTime,
        detail.nextTime,
      ]);
      rows.push(...dateRows);

      if (dateRows.length > 1) {
        mergeRequests.push({
          mergeCells: {
            range: {
              sheetId: 0,
              startRowIndex: rows.length - dateRows.length,
              endRowIndex: rows.length,
              startColumnIndex: 0,
              endColumnIndex: 1,
            },
            mergeType: 'MERGE_ALL',
          },
        });
      }
    });

    const request = {
      spreadsheetId,
      range: `A1`,
      valueInputOption: 'RAW',
      resource: {
        values: rows,
      },
    };

    try {
      const response = await this.sheets.spreadsheets.values.append(request);
      console.log(`Data appended to sheet ${sheetTitle}:`, response.data);
    } catch (error) {
      console.error('Error appending data:', error);
      throw error;
    }

    if (mergeRequests.length > 0) {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: mergeRequests,
        },
      });
    }

    return rows.length;
  }
  async shareSpreadsheet(spreadsheetId: string, email: string) {
    const request = {
      fileId: spreadsheetId,
      resource: {
        role: 'writer',
        type: 'user',
        emailAddress: email,
      },
    };

    try {
      const response = await this.drive.permissions.create(request);
      console.log(`Spreadsheet shared with ${email}:`, response.data);
    } catch (error) {
      console.error('Error sharing spreadsheet:', error);
      throw error;
    }
  }

  async setSpreadsheetPublic(spreadsheetId: string) {
    const request = {
      fileId: spreadsheetId,
      resource: {
        role: 'writer',
        type: 'anyone',
      },
    };

    try {
      const response = await this.drive.permissions.create(request);
      console.log(`Spreadsheet set to public:`, response.data);
    } catch (error) {
      console.error('Error setting spreadsheet to public:', error);
      throw error;
    }
  }

  async formatSheet(spreadsheetId: string, numRows: number) {
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 5,
            startColumnIndex: 0,
            endColumnIndex: 7,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.8,
                green: 0.8,
                blue: 0.8,
              },
              horizontalAlignment: 'CENTER',
              textFormat: {
                fontSize: 12,
                bold: true,
              },
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 4,
            endRowIndex: numRows,
            startColumnIndex: 1,
            endColumnIndex: 2,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER',
            },
          },
          fields: 'userEnteredFormat(horizontalAlignment)',
        },
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 7,
          },
        },
      },
    ];

    const request = {
      spreadsheetId,
      resource: {
        requests,
      },
    };

    try {
      const response = await this.sheets.spreadsheets.batchUpdate(request);
      console.log('Sheet formatted:', response.data);
    } catch (error) {
      console.error('Error formatting sheet:', error);
      throw error;
    }
  }
}
