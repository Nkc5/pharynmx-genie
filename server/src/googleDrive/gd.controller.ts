// const { google } = require("googleapis");
// const fs = require('fs');

import { google } from 'googleapis';
import fs from 'fs';
import { Controller, Post, Body, Res } from '@nestjs/common';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';

@Controller('gd')
export class GDcontroller {
  private drive: any;
  private oauth2client;

  constructor() {
    this.initializeGD();
  }

  initializeGD() {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } =
      process.env;
    this.oauth2client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI,
    );
  }

  @Post('upload')
  async uploadImage(@Body() body: any, @Res() res) {
    const { fileBase64, access_token } = body;

    // console.log("body", body);

    if (access_token) {
      this.oauth2client.setCredentials({ access_token: access_token });
      this.drive = google.drive({
        version: 'v3',
        auth: this.oauth2client,
      });
    }
    else{
      return res.send({error: "no access token found in backend"})
    }

    try {
      // Remove any extra data prefix (optional)
      const base64Data = fileBase64.replace(/^data:image\/png;base64,/, '');

      // convert base64 to binary buffer
      const decodedData = Buffer.from(base64Data, 'base64');

      // Convert Buffer to a readable stream
      const stream = Readable.from(decodedData);
      // console.log('stream', stream);

      const random = crypto.randomUUID();

      let resp = await this.drive.files.create({
        requestBody: {
          name: `${random}.png`,
          mimeType: 'image/png',
        },
        media: {
          mimeType: 'image/png',
          body: stream,
        },
      });

      // console.log('resp', resp.data);
      const fileId = resp.data.id;

      // Using the below lines you can generate a public download link and view link. webContentLink is the download link. webViewLink is the online view link.

      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      let result = await this.drive.files.get({
        fileId,
        fields: 'webContentLink, webViewLink',
      });

      // console.log('result', result.data);

      return res.send(result.data);

      return result.data.webViewLink;
    } catch (error) {
      console.log('err', error.message);
      return error.message;
    }
  }

  async bufferToStream(buffer) {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // Signify end of file
    return readable;
  }
}
