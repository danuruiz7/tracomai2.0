import { exec } from 'child_process'; // para ejecutar comandos en el sistema operativo funcionara en el servidor para poder usar pdftoppm
import fs from 'fs';
import os from 'os';
import path from 'path';
import pdfPoppler from 'pdf-poppler'; // para convertir pdf a imágenes en windows
import Tesseract from 'tesseract.js';
import { promisify } from 'util'; // para convertir callbacks a funciones que devuelvan promesas

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const execAsync = promisify(exec);

/**
 * Verifica si `pdftoppm` está disponible en el entorno actual.
 * @returns `true` si está disponible, `false` en caso contrario.
 */
const isPdftoppmAvailable = async (): Promise<boolean> => {
  try {
    await execAsync('pdftoppm -v'); // Verificar versión
    return true;
  } catch {
    return false;
  }
};

/**
 * Convierte un buffer de PDF a imágenes y extrae texto usando Tesseract.js.
 * Detecta si se ejecuta en local o servidor y selecciona la herramienta adecuada.
 *
 * @param pdfBuffer Buffer del archivo PDF
 * @returns Texto extraído del PDF
 */
export const convertPdfBufferToImage = async (
  pdfBuffer: Buffer
): Promise<string> => {
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `tempPdf_${Date.now()}.pdf`);
  const outputPrefix = path.join(tempDir, `page_${Date.now()}`);
  await writeFile(tempPdfPath, pdfBuffer);

  let imagePaths: string[] = [];

  try {
    if (await isPdftoppmAvailable()) {
      // Usar pdftoppm si está disponible
      await execAsync(`pdftoppm -png ${tempPdfPath} ${outputPrefix}`);
      imagePaths = fs
        .readdirSync(tempDir)
        .filter((file) => file.startsWith(path.basename(outputPrefix)))
        .map((file) => path.join(tempDir, file));
    } else {
      // Usar pdf-poppler como alternativa
      const options = {
        format: 'png',
        out_dir: tempDir,
        out_prefix: path.basename(outputPrefix), // Solo el prefijo, no la ruta completa
        page: null,
      };
      await pdfPoppler.convert(tempPdfPath, options);
      imagePaths = fs
        .readdirSync(tempDir)
        .filter((file) => file.startsWith(path.basename(outputPrefix)))
        .map((file) => path.join(tempDir, file));
    }

    // Leer cada imagen y extraer texto
    const imageBuffers = await Promise.all(
      imagePaths.map(async (imagePath) => {
        const imageBuffer = await fs.promises.readFile(imagePath);
        await unlink(imagePath); // Eliminar la imagen tras leerla
        return imageBuffer;
      })
    );

    let text = '';
    for (const imageBuffer of imageBuffers) {
      const {
        data: { text: extractedText },
      } = await Tesseract.recognize(imageBuffer, 'spa'); // Cambiar idioma si es necesario
      text += extractedText + '\n';
    }
    return text; // Quitar espacios extra
  } finally {
    await unlink(tempPdfPath); // Eliminar archivo temporal
  }
};
