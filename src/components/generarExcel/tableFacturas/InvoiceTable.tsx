'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/my_utils"
import { ChevronDown, ChevronUp, X } from "lucide-react"

import React, { useCallback, useState } from 'react'

type Invoice = {
  [key: string]: string | number
}

type ColumnOrder = {
  key: string
  name: string
  order: string
}

// const initialInvoicesDefault: Invoice[] = [
//   {
//     invoice_number: '99',
//     date: '09/07/2024',
//     supplier_nif: 'F79496337',
//     supplier_name: 'C.B. AGUSTIN RUIZ FERNANDEZ DE MESA Y CARMEN RUIZ Y GARCIA DURAN',
//     address: 'PASEO DE LA CASTELLA, Nº150, 4ºDCHA.',
//     postal_code: '28046',
//     city: 'MADRID',
//     description: 'FACTURA Nº99 C.B. AGUSTIN RUIZ FERNANDEZ DE MESA',
//     taxable_base: 2700.80,
//     vat_percentage: 21,
//     vat_monto: 2754.82,
//     withholding_percentage: 50,
//     monto_withholding: 2754.82,
//     total_invoice: 2754.82
//   },
//   {
//     invoice_number: 'A-V2024-00004533694',
//     date: '30/09/2024',
//     supplier_nif: 'A61703534',
//     supplier_name: 'MERCADONA, S.A.',
//     address: 'C/ VALENCIA 5',
//     postal_code: '46016',
//     city: 'TAVERNES BLANQUES',
//     description: 'FACTURA Nº A-V2024-00004533694 MERCADONA, S.A.',
//     taxable_base: 4.21,
//     vat_percentage: 21,
//     vat_monto: 2754.82,
//     withholding_percentage: 50,
//     monto_withholding: 2754.82,
//     total_invoice: 2754.82
//   },
// ]

interface Props {
  initialInvoices?: Invoice[]
}

const initialColumnOrder: ColumnOrder[] = [
  { key: 'number_row', name: 'Nº', order: '-' },
  { key: 'invoice_number', name: 'Número Factura', order: 'A' },
  { key: 'date', name: 'Fecha Expedición', order: 'B' },
  { key: 'supplier_nif', name: 'NIF Proveedor', order: 'C' },
  { key: 'supplier_name', name: 'Nombre Proveedor', order: 'D' },
  { key: 'address', name: 'Dirección', order: 'E' },
  { key: 'postal_code', name: 'Código Postal', order: 'F' },
  { key: 'city', name: 'Localidad', order: 'G' },
  { key: 'description', name: 'Concepto', order: 'H' },
  { key: 'taxable_base', name: 'Base Imponible', order: 'I' },
  { key: 'vat_percentage', name: '%IVA', order: 'J' },
  { key: 'vat_monto', name: 'Monto IVA ', order: 'K' },
  { key: 'withholding_percentage', name: '%Retención', order: 'L' },
  { key: 'monto_withholding', name: 'Monto Retención', order: 'M' },
  { key: 'total_invoice', name: 'Total Factura', order: 'N' },
]

export default function InvoiceTable({ initialInvoices }: Props) {
  if (!initialInvoices) {
    initialInvoices = []
  }

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [columnOrder, setColumnOrder] = useState<ColumnOrder[]>(initialColumnOrder)
  const [activePdfIndex, setActivePdfIndex] = useState<number | null>(null);

  const handleInputChange = useCallback((index: number, key: string, value: string | number) => {
    setInvoices(prevInvoices => {
      const updatedInvoices = [...prevInvoices]
      updatedInvoices[index] = { ...updatedInvoices[index], [key]: value }
      return updatedInvoices
    })
  }, [])

  const handleColumnOrderChange = useCallback((key: string, newOrder: string) => {
    setColumnOrder(prevOrder => {
      const updatedOrder = prevOrder.map(col =>
        col.key === key ? { ...col, order: newOrder.toUpperCase() } : col
      )
      return updatedOrder.sort((a, b) => a.order.localeCompare(b.order))
    })
  }, [])

  const handleColumnNameChange = useCallback((key: string, newName: string) => {
    setColumnOrder(prevOrder => {
      return prevOrder.map(col =>
        col.key === key ? { ...col, name: newName } : col
      )
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Preparar los datos formateados que se enviarán
    const formData = columnOrder.filter(column => column.key !== 'number_row').map(column => {
      return {
        label: column.name,
        valoresColumna: invoices.map(invoice => {
          // Si la columna es "Monto IVA", retornar un valor vacío o eliminarlo
          if (column.key === 'vat_monto') {
            return String(formatCurrency(Number(invoice.taxable_base) * (Number(invoice.vat_percentage) / 100)))
          }
          if (column.key === 'monto_withholding') {
            return String(formatCurrency(Number(invoice.taxable_base) * (Number(invoice.withholding_percentage) / 100)))
          }
          return String(invoice[column.key]); // Para otras columnas, retornar el valor correspondiente
        }),
      };
    });

    console.log(formData)

    try {
      // Enviar la solicitud a la API para generar el archivo Excel
      const response = await fetch('/api/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error('Error al generar el archivo Excel');
      }

      // Convertir la respuesta en un blob para manejar el archivo
      const blob = await response.blob();

      // Crear una URL para descargar el archivo
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal para iniciar la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Factura.xlsx';
      document.body.appendChild(a);
      a.click();

      // Eliminar el enlace temporal después de la descarga
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error durante la generación del archivo Excel:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden mt-10">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100">
              {columnOrder.map(({ key, name, order }) => (
                <TableHead key={key} className="p-1 border-b border-gray-200">
                  <div className="flex flex-col space-y-2">
                    {key === "number_row" ? (
                      <span className="font-semibold text-sm text-gray-700">{name}</span>
                    ) : (
                      <>
                        <Input
                          value={order}
                          onChange={(e) => handleColumnOrderChange(key, e.target.value)}
                          className="text-xs border-gray-300 rounded"
                          maxLength={3}
                          placeholder="Order"
                        />
                        <Input
                          value={name}
                          onChange={(e) => handleColumnNameChange(key, e.target.value)}
                          className="font-semibold text-sm border-gray-300 rounded"
                          placeholder="Column Name"
                        />
                      </>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, index) => (
              <React.Fragment key={index}>
                <TableRow className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {columnOrder.map(({ key }) => (
                    <TableCell key={key} className="p-1 border-b border-gray-200">
                      {key === "number_row" ? (
                        <Button
                          type="button"
                          variant={activePdfIndex === index ? "secondary" : "outline"}
                          className="w-full"
                          onClick={() => setActivePdfIndex((prevIndex) => (prevIndex === index ? null : index))}
                        >
                          {index + 1} {activePdfIndex ? (<ChevronUp className='size-4' />) : (<ChevronDown className='size-4' />)}
                        </Button>
                      ) : (
                        <Input
                          type={typeof invoice[key] === "number" ? "number" : "text"}
                          value={invoice[key]}
                          onChange={(e) => handleInputChange(index, key, e.target.value)}
                          className="w-full text-xs border-gray-300 rounded"
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {/* La row que muesta el pdf  */}
                {activePdfIndex === index && (
                  <TableRow>
                    <TableCell colSpan={columnOrder.length} className="p-0 border-b border-gray-200">
                      <div className="w-full flex flex-col">
                        <div className="flex justify-between items-center bg-gray-100 p-1">
                          <span className="font-semibold text-sm text-gray-700">
                            {`${String(invoice.file_url ?? "#")}`}
                          </span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setActivePdfIndex(null)}
                            className="border border-transparent transition-all hover:border-red-500 hover:bg-white hover:text-red-500 hover:shadow-md hover:shadow-gray-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <iframe
                          src={`/api/file?name=${String(invoice.file_url ?? "#")}`}
                          width="100%"
                          height="600px"
                          title="PDF Viewer"
                          className="border-t border-gray-200"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out">
          Crear Excel
        </Button>
      </div>
    </form>
  )

}