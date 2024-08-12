import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VRService {
  constructor(private readonly configService: ConfigService) {}
  getAssets(type: string) {
    if (this.configService.get<string>('NODE_ENV')) {
      if (type === 'images') {
        return {
          BritishMale: 'd31f289e-2982-4d6a-bc87-406a635155d5',
          Indian_Male: 'b59a8d6f-15df-4c77-998c-cca4711f71aa',
          NewZealandMale: 'cb94bd2a-fb24-45ac-bd16-f81b98516eea',
          SingaporeMale: '2373372a-630e-4811-b5f9-d316f4d84f63',
          HongkongFemale: 'a592b22d-b4f5-4b79-acc9-6f53044bc3e8',
          NewzealandFemale: '343430fb-c54d-43b2-8a98-c3d6a3413fdf',
          HongkongMale: '84a7903f-57fd-4a9f-bc3c-e22f8db0f8d3',
          SingaporeFemale: '7bfee24f-de96-4439-a5b9-13d2659ead80',
          PhillipinesFemale: '1ddf44c1-2014-4230-9ff7-b8a9b74f50ad',
          PhillipinesMale: 'be178330-dc47-436e-be76-af9f028fbf14',
          IndianFemale: '586d7e41-ee2f-43d3-8941-c2670aa239f5',
          BritishFemale: '83cf87e9-9cfb-419b-9ed5-4bbfe075a83d',
          USAMale: '6bc107a9-e508-4807-992b-0d88e05ddbda',
          USAFemale: 'c96441a7-fb3e-4f6c-a10e-6acdc451187b',
        };
      }
      if (type === 'videos') {
        return {
          BritishFemale: '1a79da7c-36a5-42c4-940a-68755dc7e9a1',
          HongkongFemale: '33622c23-aa24-4537-9e32-c1db0befb708',
          SingaporeFemale: '6509eedd-7905-4524-b142-5187d85feae3',
          PhillipinesMale: '1c895700-c5ca-4f26-b7aa-5287461e2815',
          BritishMale: '19f3fd15-0516-42f1-9292-4e067f42d936',
          PhillipinesFemale: '5199f302-f816-40ca-a69e-33bf5f38723f',
          HongkongMale: 'e4bbd9a3-8389-4e65-ac61-c367f665b901',
          SingaporeMale: 'd3d6af0a-4f9f-4853-bf82-aa41cbf0e236',
          NewzealandFemale: '310737e8-0a06-4b2f-94bf-bad4dbcad2ea',
          NewZealandMale: '5a9484ed-3dd6-40e8-9caa-01339e8325da',
          Indian_Male: '15175593-ba54-4d79-8899-e834dfab3029',
          IndianFemale: '1647c157-eec0-4560-b2fd-8b681ae1c6f2',
          USAFemale: '573e14d8-1df3-4c61-9b4f-1427b44fc837',
          USAMale: '58e657fb-10ee-45f9-ae77-da3da6ed1e35',
        };
      }
      if (type === 'audios') {
        return {
          'mei-YanNeural-en-HK': '67df1fae-81bb-4e2f-b44d-610b972bbd1b',
          'haris-WayneNeural-en-SG': '9c246d74-df5a-418e-b06a-6e5c42ddb8ae',
          'arjun-PrabhatNeural-en-IN': 'd88b60ac-f9e7-4339-bc66-d4b4c731bd62',
          'siti-LunaNeural-en-SG': '4beba336-e0cf-47a6-b3b9-c93a5bc65c17',
          'levi-MitchellNeural-en-NZ': '24d4cd09-6d07-4660-b195-f2387fe6625e',
          'ross-AndrewNeural-en-US': '47cee5fd-7e48-40b7-a71d-e6dec12ec9f5',
          'emily-SoniaNeural-en-GB': '1764c857-3207-4f91-8e6f-7c2971a52749',
          'kai-SamNeural-en-HK': '224a2f5d-3db4-4e38-b192-19c9b1500e5a',
          'sophie-MollyNeural-en-NZ': '74693195-d565-4ae7-ba47-bd85be90996c',
          'oliver-RyanNeural-en-GB': 'dc7060ea-f70e-4d43-89ff-7d0ce6cc9647',
          'andres-JamesNeural-en-PH': 'de7848ed-62df-4f24-8f96-5e15d585cc62',
          'priya-NeerjaNeural-en-IN': '526e21e8-fe26-4694-8323-2081a98ebea0',
          'sofia-RosaNeural-en-PH': '44928f81-5437-4c48-8aad-5e6f6fc882e1',
          'rachel-AvaNeural-en-US': '2489ca9f-abcc-431f-9102-b08d9bb23d46',
        };
      }
    } else {
      if (type === 'images') {
        return {
          NewzealandFemale: '8e31a1ff-0ed4-43b3-8c60-f27f14bf9da6',
          SingaporeMale: '35ebbf61-ee39-4720-8adb-d891b58cb623',
          BritishFemale: 'ae5d858d-2c24-4f4d-ab3c-63f1f791cc6e',
          USAMale: '1c7bc1cb-fad6-4150-90db-3625a26abdde',
          NewZealandMale: 'e75b16fb-ae0a-4f71-8c28-db33f280c936',
          Indian_Male: '3233d3b4-c70f-40d7-afaa-2acffc169d07',
          BritishMale: '9ecc96b2-f0d8-4adc-873b-c37cea572858',
          PhillipinesFemale: '5981824c-f94c-475c-9268-4b0c160453b4',
          HongkongFemale: '815b2a59-7117-4461-aa02-32901dbfeecf',
          USAFemale: 'e2d6b334-0897-4c4f-9b0c-8a31ceb083de',
          HongkongMale: 'f7431d64-114f-4334-aeb9-881e4a064229',
          IndianFemale: '2767a162-c28a-4db5-b7e7-84bd17a8d11e',
          PhillipinesMale: 'e6c2ed6a-260e-4a0b-a855-6ce77fbcc062',
          SingaporeFemale: '837ef74f-37a9-4e72-814a-cc48a671f7ba',
        };
      }
      if (type === 'videos') {
        return {
          BritishFemale: '1911f2c7-481a-4b38-af6f-1bd5a79818d8',
          HongkongFemale: '3e31f7b5-2103-45d5-b990-4013d6df0557',
          SingaporeFemale: 'fa474a31-558b-4b03-abb4-55e7e9c405f8',
          PhillipinesMale: '21b3d00a-354e-4b0b-b929-8a01304591fa',
          BritishMale: '0ffef9e0-db8a-4e47-bde5-1666d567af0b',
          PhillipinesFemale: 'c1d36948-9fec-4123-812b-050663483f10',
          HongkongMale: 'ea60a49f-b5ab-42bc-ba02-b8d193043e3d',
          SingaporeMale: '96ce6579-475b-4a9f-a411-1aa0f21e3fb7',
          NewzealandFemale: '00841477-fab2-4341-837c-f3dcff1a1321',
          NewZealandMale: '0ab0fdc8-47e5-4c26-99dc-d0f67c4923e6',
          Indian_Male: '74f4e3ed-1e31-43b5-8b5e-f0a691114c97',
          IndianFemale: '910ec9c7-369a-4993-8644-0ded87907c14',
          USAFemale: '83ae4173-31ee-45a2-b51b-cadb63179d37',
          USAMale: '78cdc7d4-46d5-4d74-88d3-da5dc0b5bdbc'
        };
      }
      if (type === 'audios') {
        return {
          'mei-YanNeural-en-HK': '96e6869d-7392-4a16-8ebc-56b03c336ff1',
          'rachel-AvaNeural-en-US': 'd9cb907b-e83a-41d0-82d0-054a10641612',
          'haris-WayneNeural-en-SG': '27b9c19e-243b-4e5b-adfa-7bc726fe3657',
          'arjun-PrabhatNeural-en-IN': 'dfde23e7-61df-480d-9164-cecea1df9353',
          'siti-LunaNeural-en-SG': '93542163-ac14-4358-bf90-f95ad902a066',
          'levi-MitchellNeural-en-NZ': '37715fa7-a900-47ff-82c6-951e2795a600',
          'ross-AndrewNeural-en-US': '88ca1d9e-bb40-4348-8383-e00dbe7d956f',
          'emily-SoniaNeural-en-GB': '5b23fae6-f4b3-42bb-b58b-53ebef69f9b6',
          'kai-SamNeural-en-HK': 'c1d2a30f-e957-4a91-834a-249224193283',
          'sophie-MollyNeural-en-NZ': 'ae1ed540-d83b-4953-936c-3de25290085c',
          'oliver-RyanNeural-en-GB': '7ba984fc-2f84-42ed-90db-09138e2ebffc',
          'andres-JamesNeural-en-PH': '97553205-7946-4785-a8e6-b0f998f1019b',
          'priya-NeerjaNeural-en-IN': '5a9ec40e-3407-4b81-b4ce-8aa8f7e1c826',
          'sofia-RosaNeural-en-PH': '6a67d1c1-fba7-4592-8913-fc6a0c01b490',
        };
      }
    }
    throw new HttpException('Invalid type', HttpStatus.BAD_REQUEST);
  }
}
