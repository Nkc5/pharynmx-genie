
import {Module} from '@nestjs/common';
import { GDcontroller } from './gd.controller';


@Module({
    imports:[],
    controllers:[GDcontroller],
    providers:[]
})

export class GDmodule {}