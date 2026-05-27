import { processChallengeCompletion } from '../challenge.service';
import { prismaMock } from '../../utils/prisma-mock';

describe('Challenge Service', () => {
  describe('processChallengeCompletion', () => {
    it('should throw an error if challengeId is missing', async () => {
      // 🔴 RED: This test will fail initially because the service doesn't throw this error yet.
      const input = {
        challengeId: '',
        ganadorId: 'win1',
        perdedorId: 'lose1',
        retadorUsername: 'user1',
        retadoUsername: 'user2',
        isRetadorWinner: true,
      };

      await expect(processChallengeCompletion(input)).rejects.toThrow('challengeId is required');
    });
  });
});
