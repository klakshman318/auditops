import { Test, TestingModule } from '@nestjs/testing';
import { AiExplainerService } from './ai-explainer.service';

describe('AiExplainerService', () => {
  let service: AiExplainerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiExplainerService],
    }).compile();

    service = module.get<AiExplainerService>(AiExplainerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
