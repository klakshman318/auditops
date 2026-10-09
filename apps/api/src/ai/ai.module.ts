import { Module } from '@nestjs/common';
import { AiExplainerService } from './ai-explainer/ai-explainer.service';

@Module({
  providers: [AiExplainerService],
  exports: [AiExplainerService],
})
export class AiModule {}
