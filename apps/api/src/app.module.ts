import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScansModule } from './scans/scans.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScansModule,
    AiModule,
  ],
})
export class AppModule { }