import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AVService {
  constructor(private readonly configService: ConfigService) {}
  getPoses() {
    if (!this.configService.get<string>('NODE_ENV')) {
      return {
        'Pose 1': {
          webp: 'avatar_gen/static/poses/88cc320c-d1d0-4672-a64a-260655be701c',
          png: 'avatar_gen/static/poses/96f8b7ad-f60d-43fe-b4e1-964041b9d629',
        },
        'Pose 2': {
          webp: 'avatar_gen/static/poses/299b546c-c839-40aa-bc5d-c73f3430a3fa',
          png: 'avatar_gen/static/poses/880a763d-9128-47d3-94ca-1ef9ae11ca80',
        },
        'Pose 3': {
          webp: 'avatar_gen/static/poses/e2beb6fb-4768-49ad-a9c0-2ff7a0f97dfc',
          png: 'avatar_gen/static/poses/cdc49b15-849a-4ce9-9545-c15f12b04af7',
        },
        'Pose 4': {
          webp: 'avatar_gen/static/poses/f38e103c-a9ac-47c9-832e-eeff3ee3d6c5',
          png: 'avatar_gen/static/poses/81f2e9ac-3619-4740-9d3b-d01ebee51b2b',
        },
        'Pose 5': {
          webp: 'avatar_gen/static/poses/bde6519a-aac9-4ffe-ad6e-a59093d4ea35',
          png: 'avatar_gen/static/poses/c5b6e74e-8ae2-4e9c-be33-b2eb799f16ed',
        },
      };
    } else {
      return {
        'Pose 1': {
          webp: 'avatar_gen/static/poses/0eb7c481-a3c6-4a2a-98b8-24be927fc245',
          png: 'avatar_gen/static/poses/90df5485-67ab-46ad-b67f-bf24cbcf81c0',
        },
        'Pose 2': {
          webp: 'avatar_gen/static/poses/a00bef64-46be-4a21-8b40-abba969c1b40',
          png: 'avatar_gen/static/poses/c24d15b4-1c79-446a-a118-b196916b758e',
        },
        'Pose 3': {
          webp: 'avatar_gen/static/poses/f3726c25-6644-47fc-8e23-696c069dab91',
          png: 'avatar_gen/static/poses/090a45f2-7b56-42d4-b038-7c1658c1cb4d',
        },
        'Pose 4': {
          webp: 'avatar_gen/static/poses/1e788b96-7a6e-4746-ab91-9641a1bbdf3c',
          png: 'avatar_gen/static/poses/7df3d37d-eb6c-4c14-882d-02167bbea8ce',
        },
        'Pose 5': {
          webp: 'avatar_gen/static/poses/c67bd7ef-a79d-4fc5-b532-08095bbd1835',
          png: 'avatar_gen/static/poses/be7b869a-4f27-41ba-a532-b4d4f4d76663',
        },
      };
    }
  }
}
