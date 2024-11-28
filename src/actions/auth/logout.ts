import { cookies } from 'next/headers';

export const logout = async () => {
  'use server';
  (await cookies()).delete('token');
};
