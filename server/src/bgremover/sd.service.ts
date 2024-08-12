import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SDService {
  constructor(private readonly configService: ConfigService) {}
  getAssets(type: string) {
    if (this.configService.get<string>('NODE_ENV')) {
      return {
        'anime_lightning.safetensors': '8f89dd02-3fd2-4613-ac2f-19e8991f59c9',
        'real_vis_lightning.safetensors':
          'a55eb390-6674-41f8-850e-9fc59cbef9a1',
        'cartoon_lightning.safetensors': '620590a8-7f32-4e4a-bfd2-1afcff8a199f',
      };
    } else {
      return {
        'cartoon_lightning.safetensors': '9c0ba879-36fe-4d36-b4db-c7918166ac84',
        'real_vis_lightning.safetensors':
          'ddb3c50e-c561-457b-84d8-c2bca82dd05d',
        'anime_lightning.safetensors': '47993fcd-4831-49da-8342-0535407d2bf3',
      };
    }
  }
}
