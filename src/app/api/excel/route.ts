import ExcelJS from 'exceljs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { formData } = await req.json();
    console.log(formData);
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Facturas');

    // Agregar las cabeceras al archivo Excel
    const headers = formData.map((col: any) => col.label);
    const headerRow = worksheet.addRow(headers);

    // Aplicar estilo a las cabeceras (color de fondo naranja claro)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCC99' }, // Color de fondo (naranja claro)
      };
      cell.font = {
        bold: true, // Hacer el texto en negrita
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Alinear texto en el centro
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Establecer el ancho de las columnas según la longitud de los datos
    worksheet.columns = [
      { width: 20 }, // Número Factura
      { width: 15 }, // Fecha Expedición
      { width: 20 }, // NIF Proveedor
      { width: 40 }, // Nombre Proveedor
      { width: 50 }, // Dirección
      { width: 15 }, // Código Postal
      { width: 15 }, // Localidad
      { width: 50 }, // Concepto
      { width: 15 }, // Base Imponible
      { width: 10 }, // % IVA
      { width: 15 }, // Cuota IVA
      { width: 15 }, // % Retención
      { width: 15 }, // Retención
      { width: 15 }, // Total Factura
    ];

    // Obtener el número de filas (asumimos que todas las columnas tienen el mismo número de filas)
    const numRows = formData[0].valoresColumna.length;

    // Agregar los datos fila por fila
    for (let i = 0; i < numRows; i++) {
      const rowData = formData.map((col: any) => col.valoresColumna[i]);
      const row = worksheet.addRow(rowData);

      // Aplicar alineación y formato a las filas de datos
      row.eachCell((cell, colNumber) => {
        // Alinear texto a la derecha para números y a la izquierda para texto
        if (colNumber >= 9 && colNumber <= 14) {
          cell.alignment = { horizontal: 'right' }; // Alinear números a la derecha

          // Formato numérico con coma para decimales
          cell.numFmt = '#.##0,00'; // Usar coma como separador de decimales
        } else {
          cell.alignment = { horizontal: 'left' }; // Alinear texto a la izquierda
        }
        // Agregar bordes a las celdas
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    // Escribir el archivo en un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Retornar el archivo Excel como respuesta
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="facturas.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error procesando el Excel:', error);

    return NextResponse.json(
      { message: 'Ocurrió un error al procesar el archivo Excel' },
      { status: 500 }
    );
  }
}
