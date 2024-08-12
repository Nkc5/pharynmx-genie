
import {Module} from '@nestjs/common';
import { OauthController } from './Oauth.controller';


@Module({
    imports: [],
    controllers:[OauthController],
    providers:[]
})

export class OauthModule{}

