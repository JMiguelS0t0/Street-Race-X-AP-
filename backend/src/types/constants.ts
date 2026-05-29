export const ChallengeStatus = {
  PENDIENTE: 'pendiente',
  ACEPTADO: 'aceptado',
  RECHAZADO: 'rechazado',
  CANCELADO: 'cancelado',
  EN_CURSO: 'en_curso',
  COMPLETADO: 'completado',
} as const;

export type ChallengeStatusType = typeof ChallengeStatus[keyof typeof ChallengeStatus];

export const RaceType = {
  CUARTO_MILLA: 'Cuarto de Milla',
  CARRERA_VUELTAS: 'Carrera por Vueltas',
  DERRAPE: 'Derrape',
} as const;

export type RaceTypeType = typeof RaceType[keyof typeof RaceType];

export const UserRole = {
  PILOTO: 'piloto',
  ADMINISTRADOR: 'administrador',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const UserRank = {
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
  S: 'S',
} as const;

export type UserRankType = typeof UserRank[keyof typeof UserRank];
