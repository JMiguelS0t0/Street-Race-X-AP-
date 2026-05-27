import jwt from 'jsonwebtoken';

interface TokenUser {
  id: string;
  username: string;
  rol: string;
}

export const generateToken = (user: TokenUser): string => {
  return jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

export const excludePassword = <T extends { password_hash: string }>(user: T): Omit<T, 'password_hash'> => {
  const { password_hash: _, ...rest } = user;
  return rest;
};
