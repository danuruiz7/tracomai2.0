import { getSession } from '@/actions/auth/getSession';
import { saveFile } from '@/actions/files/saveFile';
import { fileEmpty } from '@/interface/inferface';
import { factarasOpenai } from '@/lib/openai';
import { convertPdfBufferToImage } from '@/lib/pdftopng';
import { totalTokens } from '@/lib/tiktoken';
import { NextResponse } from 'next/server';
import PdfParse from 'pdf-parse';

export async function POST(req: Request) {
  // Obtener el FormData del cuerpo de la solicitud
  const formData = await req.formData();
  const user = await getSession();
  const files: File[] = []; // Array de archivos
  let extractedTexts: string = ''; // Texto extraído
  const fileEmpty: fileEmpty[] = []; // Archivos vacíos
  const arrayTotalOpenai: any[] = []; // Array de objetos que devuelve OpenAI

  if (!user) {
    return NextResponse.json({
      message: 'No se ha iniciado sesión',
      error: true,
    });
  }

  console.log('FormData', formData);
  // Recorrer los archivos subidos
  for (const [key, value] of formData.entries()) {
    // agregamos los archivos subidos a el array de files
    if (value instanceof File) {
      files.push(value);
      //console.log('Archivo cargado:', value.name); // mostramos el nombre del archivo
    }
  }

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileSaved = await saveFile(file, user.id.toString());

      let data = await PdfParse(buffer);

      // Verificar si existen algunas palabras en el texto
      if (
        data.text.toLowerCase().includes('vodafone') ||
        data.text.toLowerCase().includes('endesa') ||
        data.text.toLowerCase().includes('sabadell')
      ) {
        data = await PdfParse(buffer, {
          max: 1, // Extraemos datos de la primera página
        });
      }
      const numeroArchivo = '\nFactura-' + (i + 1) + '->\n'; //para dividir la factura

      if (!data.text.replace(/\s+/g, '')) {
        extractedTexts += numeroArchivo;
        extractedTexts += await convertPdfBufferToImage(buffer);
      } else {
        // Concatenar el texto sin espacios en blanco
        extractedTexts += numeroArchivo;
        extractedTexts += data.text.replace(/\s+/g, '');
      }

      const tokens = await totalTokens(extractedTexts, 'gpt-4o');
      console.log(`Total de tokens: ${tokens}`);

      const arrayOpenai = await factarasOpenai(extractedTexts);
      if (arrayOpenai.length === 0) {
        fileEmpty.push({
          fileName: file.name,
          fileUrl: fileSaved.filename,
        });
        console.log('FILEEMPTY', fileEmpty);
        console.log('FILEEMPTY.length', fileEmpty.length);
      }

      const arrayOpenaiWithUrl = arrayOpenai.map((item: any) => ({
        ...item,
        file_url: fileSaved.filename, // Nueva propiedad con la URL del archivo
      }));
      console.log('EL Array Openai', arrayOpenai);
      console.log('EL Array arrayOpenaiWithUrl', arrayOpenaiWithUrl);
      // console.log('Nombre Archivo: ', file.name);

      arrayTotalOpenai.push(...arrayOpenaiWithUrl);
      console.log('ELArrayOpenaiTOTAL', arrayTotalOpenai.length);
      extractedTexts = ''; // Reiniciar para el siguiente lote de archivos
    }

    return NextResponse.json({
      message: `Archivos procesados exitosamente ${arrayTotalOpenai.length} de ${files.length}`,
      arrayTotalOpenai,
      fileEmpty,
    });
  } catch (error) {
    console.error('Error al procesar los archivos:', error);
    return NextResponse.json({
      message: 'Error al procesar los archivos',
      error: true,
    });
  }
}
