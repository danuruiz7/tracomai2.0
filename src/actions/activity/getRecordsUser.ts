'use server';

import db from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';
import { getSession } from '../auth/getSession';

interface PromptRecord {
  id: number;
  tms: string;
  descripcion: string;
}

// Interfaz para los resultados de MySQL
interface PromptRow extends RowDataPacket {
  rowid: number;
  tms: string;
  descripcion: string;
}

export async function getUserSubscription(): Promise<number> {
  try {
    const user = await getSession();
    // console.log(user);
    // Verifica que el usuario y su rowid estén definidos
    if (!user || !user.rowid) {
      throw new Error('El usuario no tiene un rowid definido.');
    }

    // Ejecuta la consulta usando un parámetro para evitar inyecciones SQL
    const [rows] = await db.query(
      `SELECT susbscription FROM users s WHERE s.rowid = ?`,
      [user.rowid]
    );

    // Aserción de tipo: convertimos rows a un arreglo de RowDataPacket
    const results = rows as RowDataPacket[];

    // Si se encontró un registro, convertimos el valor de 'susbscription' a número
    if (results.length > 0 && results[0].susbscription !== undefined) {
      const subscriptionValue = results[0].susbscription;
      return Number(subscriptionValue) || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error al obtener la suscripción:', error);
    throw error;
  }
}

export async function getTotalRequest(): Promise<number> {
  try {
    const user = await getSession();

    const [results] = await db.query(
      `SELECT SUM(peticion) as total
       FROM activity 
       WHERE fk_user = ? 
       AND MONTH(tms) = MONTH(CURRENT_DATE())
       AND YEAR(tms) = YEAR(CURRENT_DATE())
       AND peticion IS NOT NULL`,
      [user.rowid]
    );

    const total = Array.isArray(results)
      ? (results[0] as { total: number }).total
      : 0;

    return total;
  } catch (error) {
    console.error('Error al obtener el total de peticiones:', error);
    throw error;
  }
}

export async function getAvailableRequest(): Promise<number> {
  const subscription = await getUserSubscription();
  const totalRequest = await getTotalRequest();

  return subscription - totalRequest;
}

export async function getRecordPrompts(
  page = 1,
  limit = 5
): Promise<{ records: PromptRecord[]; total: number }> {
  try {
    const user = await getSession();
    //const limit = 5
    const offset = (page - 1) * limit;

    // Consulta para obtener los registros con paginación
    const [records] = await db.query<PromptRow[]>(
      `SELECT 
        rowid,
        DATE_FORMAT(tms, '%Y-%m-%d %H:%i:%s') as tms,
        descripcion 
       FROM prompts 
       WHERE fk_user = ? 
       ORDER BY tms DESC 
       LIMIT ? OFFSET ?`,
      [user.rowid, limit, offset]
    );

    // Consulta para obtener el total de registros
    const [totalCount] = await db.query<(RowDataPacket & { total: number })[]>(
      'SELECT COUNT(*) as total FROM prompts WHERE fk_user = ?',
      [user.rowid]
    );

    const total = totalCount[0]?.total ?? 0;

    // Convertir los resultados al formato PromptRecord
    const formattedRecords: PromptRecord[] = records.map((record) => ({
      id: record.rowid, // Cambiado de id a rowid
      tms: record.tms,
      descripcion: record.descripcion,
    }));

    return {
      records: formattedRecords,
      total,
    };
  } catch (error) {
    console.error('Error al obtener los registros de los prompts', error);
    throw error;
  }
}

export async function savePrompt(descripcion: string): Promise<void> {
  try {
    const user = await getSession();

    await db.query(
      'INSERT INTO prompts (fk_user, tms, descripcion) VALUES (?, NOW(), ?)',
      [user.rowid, descripcion]
    );
  } catch (error) {
    console.error('Error al guardar el prompt:', error);
    throw new Error('No se pudo guardar el registro');
  }
}

export async function deletePrompt(id: number): Promise<void> {
  try {
    const user = await getSession();

    await db.query(
      'DELETE FROM prompts WHERE rowid = ? AND fk_user = ?', // Cambiado de id a rowid
      [id, user.rowid]
    );
  } catch (error) {
    console.error('Error al eliminar el prompt:', error);
    throw new Error('No se pudo eliminar el registro');
  }
}
