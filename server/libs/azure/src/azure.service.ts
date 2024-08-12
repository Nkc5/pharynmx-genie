import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class AzureService {
  private blobServiceClient: BlobServiceClient;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
  }

  async textToSpeech(text: string, voice: string, locale: string) {
    
    return new Promise((resolve, reject) => {
      let SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="__LOCALE__">
            <voice name="__VOICE__">`;
      //   __TEXT__
      // </voice>
      // </speak>`;
      let ssml = SSML.replace('__VOICE__', voice);
      console.log('text', text);
      console.log('voice', voice);
      console.log('locale', locale);

      ssml = ssml.replace('en-GB', locale);
      if (voice === 'en-NZ-MitchellNeural')
        ssml += `
      <prosody pitch="-10%">
          <emphasis level="strong">
              ${text}
          </emphasis>
      </prosody>`;
      else if(voice === 'en-IN-PrabhatNeural'){      
      ssml += `
      <prosody pitch="5%">
          <emphasis level="strong">
              ${text}
          </emphasis>
      </prosody>`;
      }
      else
        ssml += `
      ${text}`;

      ssml += `
        </voice>
        </speak>`;

      // console.log(ssml);

      // ssml = ssml.replace('__TEXT__', text);
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        this.configService.get<string>('AZURE_KEY'),
        this.configService.get<string>('AZURE_REGION'),
      );
      speechConfig.speechSynthesisOutputFormat = 6; // mp3

      let audioConfig = null;
      // console.log(path.dirname(__dirname));
      // console.log(this.configService.get<string>('NODE_ENV'));

      const dir =
        this.configService.get<string>('NODE_ENV') === 'development'
          ? path.dirname(__dirname)
          : __dirname;
      if (!fs.existsSync(`${dir}/public/speech`)) {
        // Directory does not exist, so create it
        if (!fs.existsSync(`${dir}/public`)) fs.mkdirSync(`${dir}/public/`);
        fs.mkdirSync(`${dir}/public/speech`);
      }
      // if (filename) {
      let randomString = Math.random().toString(36).slice(2, 7);
      let filename = `${dir}/public/speech/speech-${randomString}.wav`;
      audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
      // }

      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

      // Subscribes to viseme received event
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          resolve({ filename: `/speech/speech-${randomString}.wav` });
        },
        (error) => {
          synthesizer.close();
          reject(error);
        },
      );
    });
  }

  async uploadFile(blobName: string, fileBase64: Buffer): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.configService.get<string>('AZURE_STORAGE_NAME'),
      );
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Convert base64 string to Buffer
      // const fileBuffer = Buffer.from(fileBase64, 'base64');

      await blockBlobClient.uploadData(fileBase64);

      return blockBlobClient.name;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteFile(blobName: string, type: string) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.configService.get<string>('AZURE_STORAGE_NAME'),
      );
      if (type === 'folder') {
        const blobs = containerClient.listBlobsFlat({
          prefix: blobName,
        });
        for await (const blob of blobs) {
          console.log(blob.name);
          const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
          await blockBlobClient.delete();
        }
      }
      if (type === 'file') {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async getFile(fileName: string) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.configService.get<string>('AZURE_STORAGE_NAME'),
      );
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // Download blob content
      const downloadBlockBlobResponse = await blockBlobClient.download(0);

      const downloadedBuffer = await this.streamToBuffer(
        downloadBlockBlobResponse.readableStreamBody,
      );
      return Buffer.from(downloadedBuffer as string)
        .toString('base64')
        .trim();
    } catch (error) {
      console.error('Error downloading blob:', error);
      return error;
    }
  }

  // Helper function to convert stream to buffer
  async streamToBuffer(readableStream: NodeJS.ReadableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }
}
