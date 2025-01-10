import { Test, TestingModule } from '@nestjs/testing';
import { SecureChatGateway } from './secure-chat.gateway';

describe('SecureChatGateway', () => {
  let gateway: SecureChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureChatGateway],
    }).compile();

    gateway = module.get<SecureChatGateway>(SecureChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
