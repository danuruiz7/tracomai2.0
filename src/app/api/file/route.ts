import { getSession } from '@/actions/auth/getSession';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  // Obtener el parámetro 'name' de la consulta
  const url = new URL(req.url);
  const name = url.searchParams.get('name');
  const user = await getSession();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  console.log('user', user);

  console.log('name', name);
  if (!name) {
    return new Response('No file name provided', { status: 400 });
  }

  const filePath = path.resolve('filestorage', user.id.toString(), name);
  console.log('filePath', filePath);
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${name}"`,
      },
    });
  } catch (error) {
    return new Response('File not found', { status: 404 });
  }
}
