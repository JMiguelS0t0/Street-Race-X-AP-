import { processChallengeCompletion } from '../challenge.service';
import { prismaMock } from '../../utils/prisma-mock';

describe('Challenge Service', () => {
  describe('processChallengeCompletion', () => {
    it('should throw an error if challengeId is missing', async () => {
      
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

    it('Reglas 13, 15, 16: should automatically promote to next rank after 2 consecutive wins and reset counter', async () => {
      (prismaMock.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return await callback(prismaMock);
      });

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'win1',
        rango: 'D',
        retos_consecutivos: 1
      });

      const input = {
        challengeId: 'c1',
        ganadorId: 'win1',
        perdedorId: 'lose1',
        retadorUsername: 'u1',
        retadoUsername: 'u2',
        isRetadorWinner: true,
      };

      await processChallengeCompletion(input);

      expect(prismaMock.rankHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ user_id: 'win1', rango_anterior: 'D', rango_nuevo: 'C' })
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'win1' },
        data: expect.objectContaining({ rango: 'C', retos_consecutivos: 0 })
      });
    });

    it('Regla 17: should not promote if user is already Rank S, but should increment wins', async () => {
      (prismaMock.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return await callback(prismaMock);
      });

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'win1',
        rango: 'S',
        retos_consecutivos: 1
      });

      const input = {
        challengeId: 'c1',
        ganadorId: 'win1',
        perdedorId: 'lose1',
        retadorUsername: 'u1',
        retadoUsername: 'u2',
        isRetadorWinner: true,
      };

      jest.clearAllMocks(); // Clear to isolate rankHistory.create calls
      await processChallengeCompletion(input);

      expect(prismaMock.rankHistory.create).not.toHaveBeenCalled();

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'win1' },
        data: expect.objectContaining({ retos_consecutivos: 2 })
      });
    });

    it('Regla 18: should not demote loser rank on defeat', async () => {
      (prismaMock.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return await callback(prismaMock);
      });

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'win1',
        rango: 'D',
        retos_consecutivos: 0
      });

      const input = {
        challengeId: 'c1',
        ganadorId: 'win1',
        perdedorId: 'lose1',
        retadorUsername: 'u1',
        retadoUsername: 'u2',
        isRetadorWinner: true,
      };

      await processChallengeCompletion(input);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'lose1' },
        data: expect.not.objectContaining({ rango: expect.anything() })
      });
    });
  });
});
