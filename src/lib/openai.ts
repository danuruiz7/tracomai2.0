import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResultArray {
  invoice_number?: string | null; // Número de factura
  date?: string | null; // Fecha en formato 'YYYY-MM-DD'
  supplier_nif?: string | null; // NIF o CIF del proveedor
  supplier_name?: string | null; // Nombre del proveedor
  address?: string | null; // Dirección del proveedor
  postal_code?: string | null; // Código postal
  city?: string | null; // Ciudad
  description?: string | null; // Descripción de los servicios o productos
  taxable_base?: number | null; // Base imponible
  vat_percentage?: number | null; // Porcentaje de IVA
  withholding_percentage?: number | null; // Porcentaje de retención
  total_invoice?: number | null; // Importe total de la factura
}

export const factarasOpenai = async (text: string) => {
  const prompt = `Extract the invoice data from the following text. 
  Ignore the company details related to "FISCONSULTING GESTION EMPRESARIAL SL" and "C/ PRINCIPE DE VERGARA, 55 3 D."—these are the details of the recipient, not the sender. 
  Additionally, ignore any number that starts with "ES" followed by digits (e.g., "ES8500815519070001309431") as these are bank account numbers. 
  Return only the invoice details of the company sending the invoice.
   Ensure the output is in valid JSON format, with no extra text. 
   The JSON should contain an array with the following fields for each invoice: 
    invoice_number,
    date, 
    supplier_nif,
    supplier_name, 
    address, 
    postal_code, 
    city, 
    description, 
    taxable_base, 
    vat_percentage, 
    vat_monto,
    withholding_percentage, 
    monto_withholding,
    and total_invoice. No other text should be returned. Example format:

[
    {
        "invoice_number": "INV12345",
        "date": "2024-10-21",
        "supplier_nif": "B12345678",
        "supplier_name": "Supplier Name Ltd.",
        "address": "123 Main St",
        "postal_code": "28001",
        "city": "Madrid",
        "description": "Office supplies",
        "taxable_base": 1000.00,
        "vat_percentage": 21,
        "vat_monto": 210.00,
        "withholding_percentage": 0,
        "monto_withholding" 0,
        "total_invoice": 1210.00
    }
]
  Cosas a tener en cuenta:
  - el supplier_nif (CIF o NIF) siempre debe estar en mayúsculas Una letra inicial (según la naturaleza jurídica) + 7 números + código de control (número o letra)
  - para facturas de CURENERGÍA COMERCIALIZADOR DE ÚLTIMO RECURSO S.A.U asegurate que el cif este completo con el formato correspondiente
  - para facturas de ASOCIACIÓN ESPAÑOLA DE CONSULTORES DE EMPRESA - AECEM verifica bien los montos SINIVABASE----IVA------Rec.Equivalencia--TOTALEUROSImporteImponible%Importe%Importe5.61 31.30 21 6.57 43.48
  `;
  if (!text) {
    return [];
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: text }, //aqui va el texto que se extrae de las facturas
    ],
    temperature: 0, // La temperature a 0 para que no genere respuestas aleatorias
  });

  const json = completion.choices[0].message.content;

  if (json) {
    const cleanedJson = json.replace(/```json|```/g, '').trim();
    try {
      const resultArray: ResultArray[] = JSON.parse(cleanedJson);
      return resultArray.map((item: ResultArray) => {
        return {
          ...item,
          supplier_nif: item.supplier_nif
            ? item.supplier_nif.replace(/CIF|-/gi, '').toUpperCase() // Elimina "CIF" y "-" (sin importar mayúsculas o minúsculas)
            : null, // Si no hay NIF, permanece como null
        };
      });
    } catch (error) {
      console.error('Error al analizar la respuesta de OpenAI:', error);
      return []; // Retorna un array vacío en caso de error
    }
  }
  return [];
};
