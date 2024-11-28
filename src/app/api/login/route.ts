import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Verificar que el email y la contraseña están presentes
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Faltan credenciales' },
        { status: 400 }
      );
    }

    // console.log('Email:', email);
    // console.log('Contraseña:', password);

    // Buscar el usuario en la base de datos
    const result = await db.query('SELECT * FROM users where email = ?', [
      email,
    ]);
    const users = result[0] as User[];
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar la contraseña
    const isPasswordValid = user.password_hash === password;
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        'La clave JWT_SECRET no está definida en las variables de entorno.'
      );
    }

    const expirationTime = 3600; // 1 hora de expiración para la cookie y el token

    // Generar un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: expirationTime,
      }
    );

    // Configurar el token como cookie
    const response = NextResponse.json({ message: 'Inicio de sesión exitoso' });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: expirationTime,
    });

    return response;
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
