'use client';

import { useAuth } from '@/context/AuthContext';
import { uploadResponse } from '@/interface/inferface';
import { Trash2Icon, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import InvoiceTable from '../tableFacturas/InvoiceTable';

const FormFactura = () => {

  const [files, setFiles] = useState<File[]>([]); // Archivos seleccionados
  const [error, setError] = useState<string | null>(null); // Estado de error
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [uploadResponse, setUploadResponse] = useState<uploadResponse | null>(null); // Para almacenar la respuesta de la subida

  const { dataAI } = useAuth();

  useEffect(() => {
    if (dataAI) {
      setUploadResponse(dataAI);
    }
  }, [dataAI]);


  // Manejar la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    const validFiles: File[] = [];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Tipos permitidos

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024) { // Límite de 5MB
          validFiles.push(file);
        } else {
          setError(`El archivo ${file.name} no es válido o excede el tamaño permitido.`);
        }
      }
    }
    setFiles(validFiles);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Reiniciar el estado de error

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]); // Agregar archivos al FormData
    }

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        body: formData, // Enviar los datos como FormData
      });

      if (!response.ok) {
        throw new Error(`Error al subir archivos: ${response.statusText}`);
      }

      const data = await response.json(); // Obtener la respuesta JSON
      setUploadResponse(data); // Guardar la respuesta de la subida
      console.log('Archivos subidos exitosamente:', data);
    } catch (error) {
      console.error('Error al subir archivos:', error);
      setError('Error al subir los archivos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }


  return (
    <div className='mx-auto mt-8'>
      {!uploadResponse && (
        <form
          className='max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden'
          onSubmit={handleSubmit}
        >
          <div className='p-6'>
            <h2 className='text-2xl font-semibold text-gray-700 mb-4'>Subir Archivos</h2>
            <div className='relative border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all duration-300 ease-in-out hover:border-blue-500'>
              <input
                type="file"
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                multiple
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              />
              <div className='text-center'>
                <Upload className='mx-auto h-12 w-12 text-gray-400' />
                <p className='mt-1 text-sm text-gray-600'>
                  Arrastra y suelta archivos aquí, o haz clic para seleccionar
                </p>
                <p className='mt-1 text-xs text-gray-500'>
                  PDF, JPG, JPEG, PNG (Máx. 10MB por archivo)
                </p>
                {
                  files.length > 0 &&
                  <p className='mt-1 text-xs text-gray-500'>Archivos seleccionados: {files.length}</p>
                }
              </div>
            </div>

            {files.length > 0 && (
              <div className='mt-4 max-h-[400px] overflow-y-auto'>
                <ul className=' space-y-2'>
                  {files.map((file, index) => (
                    <li key={index} className='flex items-center justify-between py-2 px-3 bg-gray-100 rounded-md'>
                      <span className='text-sm text-gray-700 truncate'>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className='border border-transparent transition-all hover:border-red-500 hover:bg-red-500 hover:text-white hover:rounded p-1'
                      >
                        <Trash2Icon
                          size={16}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
          </div>

          <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
            <button
              type="submit"
              disabled={isLoading || files.length === 0}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${isLoading || files.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {isLoading ? 'Cargando...' : 'Subir Archivos'}
            </button>
          </div>
        </form>
      )}


      {/* <InvoiceTable /> */}
      {uploadResponse && (
        <>
          <h3 className='text-xl font-bold mb-4'>Respuesta de la subida: {uploadResponse.message}</h3>
          <div>
            {
              uploadResponse.fileEmpty.length > 0 &&
              <div className='text-red-600 flex gap-4 mt-2'>
                {uploadResponse.fileEmpty.map((file, index) => (
                  <a href={`api/file?name=${file.fileUrl ?? "#"}`} className='bg-red-500 text-white rounded py-1 px-2 shadow border border-transparent hover:bg-white hover:text-red-500 hover:border-red-500 ' target="_blank" rel="noopener noreferrer" key={index}>
                    {file.fileName}
                  </a>
                ))}
              </div>
            }
          </div>
          <InvoiceTable initialInvoices={uploadResponse.arrayTotalOpenai} />
        </>
      )}
    </div>
  );
};

export default FormFactura;
