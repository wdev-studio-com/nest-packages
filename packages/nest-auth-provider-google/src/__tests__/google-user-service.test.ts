import { describe, it, expect } from 'bun:test';
import { GoogleUserService } from '../services/google-user-service';

describe('GoogleUserService', () => {
  it('should throw on network error', async () => {
    const service = new GoogleUserService();
    try {
      await service.getUser('invalid-token');
      expect.unreachable();
    } catch (e: any) {
      expect(e.message).toContain('Google userinfo failed');
    }
  });
});
