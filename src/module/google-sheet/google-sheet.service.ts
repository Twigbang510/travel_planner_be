import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { AppConfigService } from '../config/app-config.service';
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
    const dataAppend = {
      data: data.dataValues,
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
      await this.appendData(
        spreadDetail.spreadsheetId,
        spreadDetail.speadTitle,
        dataAppend,
      );
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

  async appendData(spreadsheetId: string, sheetTitle: string, data: any) {
    console.log('Append DAta', data);
    const rows = [
      ['startDate', data.data.startDate],
      ['endDate', data.data.endDate],
      [],
      [
        'Address',
        'name',
        'Index of Date',
        'Average Time',
        'From Time',
        'Next Time',
        'Position',
        'Date',
      ],
    ];

    data.data.planPlaceDetails.forEach((detail) => {
      rows.push([
        detail.place.formatted_address,
        detail.place.name,
        detail.indexOfDate,
        detail.averageTime,
        detail.fromTime,
        detail.nextTime,
        detail.position,
        detail.currentDate,
      ]);
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
}
