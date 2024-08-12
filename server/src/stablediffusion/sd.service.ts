import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SDService {
  constructor(private readonly configService: ConfigService) {}
  getAssets(type: string) {
    if (this.configService.get<string>('NODE_ENV')) {
      return {
        'anime_lightning.safetensors': 'c82d8d53-3753-4885-ac7a-baa1cb761d6f',
        'real_vis_lightning.safetensors':
          '136bdda3-e40e-4279-bad6-1ebbf51d6d1a',
        'cartoon_lightning.safetensors': '53579de3-cb9e-402d-abeb-a106aee1d52c',
        'anything_xl.safetensors': '7be7152c-b53b-4b10-bf7b-e95ff5998af9',
        'realvisxl.safetensors':
          '22d49be8-88e6-42cc-a1e9-c910d15c1a73',
        'cartoon_xl.safetensors': '90397e20-7aca-42b7-9999-a6416ae08bf5',
      };
    } else {
      return {
        'cartoon_lightning.safetensors': 'c7d44145-5bae-446c-9c68-36362cc29b4b',
        'real_vis_lightning.safetensors':
          'a6ab358f-2667-46f4-8e69-016ddf8eea00',
        'anime_lightning.safetensors': 'fa14ac45-31b7-4bfe-bf6a-615bf8314c82',
        'anything_xl.safetensors': '8d6874c8-219b-45b2-9cd4-f492dded0481',
        'realvisxl.safetensors':
          'e53efaf8-d4b4-426c-8e04-305637c6a31e',
        'cartoon_xl.safetensors': 'd46819d7-09a4-43b8-91c1-912d41582427',
      };
    }
  }
  getModels(){
    return {
      'Realistic(Rapid)': {
        positive: '',
        model: 'real_vis_lightning.safetensors',
        height: 512,
        width: 512,
        negative: 'distorted face, improper face, distorted mouth',
        steps: 8,
        cfg: 2,
        seed: -1,
        img_no: 4,
        method: 'euler_ancestral',
      },
      'Cartoon(Rapid)': {
        positive: '',
        model: 'cartoon_lightning.safetensors',
        height: 512,
        width: 512,
        negative: 'distorted face, improper face, distorted mouth',
        steps: 8,
        cfg: 2,
        seed: -1,
        img_no: 4,
        method: 'dpmpp_sde_gpu',
      },
      'Anime(Rapid)': {
        positive: '',
        model: 'anime_lightning.safetensors',
        height: 512,
        width: 512,
        negative: 'distorted face, improper face, distorted mouth',
        steps: 8,
        cfg: 2,
        seed: -1,
        img_no: 4,
        method: 'euler_ancestral',
      },
      Realistic: {
        positive: '',
        model: 'realvisxl.safetensors',
        height: 512,
        width: 512,
        negative: 'distorted face, improper face, distorted mouth',
        steps: 30,
        cfg: 7,
        seed: -1,
        img_no: 4,
        method: 'euler_ancestral',
      },
      Cartoon: {
        positive: '',
        model: 'cartoon_xl.safetensors',
        height: 512,
        width: 512,
        negative: 'distorted face, improper face, distorted mouth',
        steps: 30,
        cfg: 7,
        seed: -1,
        img_no: 4,
        method: 'euler_ancestral',
      },
      Anime: {
        positive: '',
        model: 'anything_xl.safetensors',
        height: 512,
        width: 512,
        negative: 'distorted face, improper face, distorted mouth',
        steps: 30,
        cfg: 7,
        seed: -1,
        img_no: 4,
        method: 'euler_ancestral',
      },
    };
  }
}
