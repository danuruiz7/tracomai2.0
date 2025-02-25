"use server"

import db from "@/lib/db"
import { getSession } from "../auth/getSession"
import type { RowDataPacket } from "mysql2/promise"

interface User {
  id: number
  email: string
  name: string
  subscription: number
}

interface PromptRecord {
  id: number
  tms: string
  descripcion: string
}

// Interfaz para los resultados de MySQL
interface PromptRow extends RowDataPacket {
  rowid: number
  tms: string
  descripcion: string
}

export async function getUserSubscription(): Promise<number> {
  try {
    const user = await getSession()
    return user.subscription
  } catch (error) {
    console.error("Error al obtener la suscripción:", error)
    throw error
  }
}

export async function getTotalRequest(): Promise<number> {
  try {
    const user = await getSession()

    const [results] = await db.query(
      `SELECT SUM(peticion) as total
       FROM activity 
       WHERE fk_user = ? 
       AND MONTH(tms) = MONTH(CURRENT_DATE())
       AND YEAR(tms) = YEAR(CURRENT_DATE())
       AND peticion IS NOT NULL`,
      [user.id],
    )

    const total = Array.isArray(results) ? (results[0] as { total: number }).total : 0

    return total
  } catch (error) {
    console.error("Error al obtener el total de peticiones:", error)
    throw error
  }
}

export async function getAvailableRequest(): Promise<number> {
  const subscription = await getUserSubscription()
  const totalRequest = await getTotalRequest()

  return subscription - totalRequest
}

export async function getRecordPrompts(page = 1,limit = 5): Promise<{ records: PromptRecord[]; total: number }> {
  try {
    const user = await getSession()
    //const limit = 5
    const offset = (page - 1) * limit

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
      [user.id, limit, offset],
    )

    // Consulta para obtener el total de registros
    const [totalCount] = await db.query<(RowDataPacket & { total: number })[]>(
      "SELECT COUNT(*) as total FROM prompts WHERE fk_user = ?",
      [user.id],
    )

    const total = totalCount[0]?.total ?? 0

    // Convertir los resultados al formato PromptRecord
    const formattedRecords: PromptRecord[] = records.map((record) => ({
      id: record.rowid, // Cambiado de id a rowid
      tms: record.tms,
      descripcion: record.descripcion,
    }))

    return {
      records: formattedRecords,
      total,
    }
  } catch (error) {
    console.error("Error al obtener los registros de los prompts", error)
    throw error
  }
}

export async function savePrompt(descripcion: string): Promise<void> {
  try {
    const user = await getSession()

    await db.query("INSERT INTO prompts (fk_user, tms, descripcion) VALUES (?, NOW(), ?)", [user.id, descripcion])
  } catch (error) {
    console.error("Error al guardar el prompt:", error)
    throw new Error("No se pudo guardar el registro")
  }
}

export async function deletePrompt(id: number): Promise<void> {
  try {
    const user = await getSession()

    await db.query(
      "DELETE FROM prompts WHERE rowid = ? AND fk_user = ?", // Cambiado de id a rowid
      [id, user.id],
    )
  } catch (error) {
    console.error("Error al eliminar el prompt:", error)
    throw new Error("No se pudo eliminar el registro")
  }
}

