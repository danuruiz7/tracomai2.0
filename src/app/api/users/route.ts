// app/api/users/route.ts
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Realizar consulta a la base de datos
    const [rows] = await db.query('SELECT * FROM users');

    // Retornar usuarios en formato JSON
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}
