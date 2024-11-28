'use server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Guarda un archivo en la carpeta 'filestorage/[userId]/[filename]' y retorna su URL relativa.
 *
 * @param file - Archivo a guardar (instancia de File)
 * @param userId - ID del usuario para crear su carpeta específica
 * @returns {Promise<{ fileUrl: string; filename: string }>} - URL relativa y nombre del archivo
 */
export async function saveFile(
  file: File,
  userId: string
): Promise<{
  fileUrl: string;
  filename: string;
}> {
  if (!file || !userId) {
    throw new Error('Archivo o userId no proporcionados');
  }

  // Directorio base donde se guardarán los archivos
  const baseDir = path.join(process.cwd(), 'filestorage');
  // Asegurarse de que la carpeta base existe
  await ensureDirectoryExists(baseDir);
  // Directorio del usuario
  const userDir = path.join(baseDir, userId);
  // Asegurarse de que la carpeta del usuario existe
  await ensureDirectoryExists(userDir);
  // Generar un nombre de archivo seguro
  const sanitizedFileName = sanitizeFileName(file.name);
  const filePath = path.join(userDir, sanitizedFileName);
  // Guardar el archivo
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  // Crear la URL relativa
  const fileUrl = path.join('filestorage', userId, sanitizedFileName);
  return {
    fileUrl,
    filename: sanitizedFileName,
  };
}

/**
 * Asegura que un directorio existe, si no, lo crea.
 *
 * @param dir - Ruta del directorio
 */
async function ensureDirectoryExists(dir: string): Promise<void> {
  try {
    await fs.access(dir); // Verificar si existe
  } catch {
    await fs.mkdir(dir, { recursive: true }); // Crear si no existe
  }
}

/**
 * Sanitiza el nombre del archivo reemplazando espacios y caracteres no válidos.
 *
 * @param filename - Nombre del archivo original
 * @returns {string} - Nombre de archivo sanitizado
 */
function sanitizeFileName(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_'); // Reemplazar caracteres no válidos
}
