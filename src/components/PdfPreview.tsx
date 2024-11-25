"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface Range {
  start: number | null;
  end: number | null;
}

export const PdfPreview = () => {
  //Archivo PDF que se va a procesar
  const [file, setFile] = useState<File | null>(null);
  //URL del archivo PDF que se va a mostrar
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  //Número de páginas del archivo PDF Original
  const [numPagesOrigin, setNumPages] = useState<number | null>(null);//Numero Total de Páginas del PDF
  const [paginasOrigin, setPaginasOrigin] = useState<number[]>([]);//Array con las pagina de PDF original[1,2,3....,50,51,52...]
  //Número de páginas del archivo PDF Provisional
  const [paginasEdited, setPaginasEdited] = useState<number[]>([]);//Array con las pagina de PDF provisional
  //Grupos de páginas que se van a procesar
  const [selectedGroups, setSelectedGroups] = useState<number[][]>([]);
  //Indica si se está procesando el archivo PDF
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  //Intervalo de páginas que se van a procesar
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });

  const [numPdfGenerado, setNumPdfGenerado] = useState<number>(0)



  // Función que actualiza el PDF previsualizado
  const updatePdfPreview = useCallback(async () => {
    if (!file) {
      alert("Por favor cargue un pdf");
      return;
    }

    setIsProcessing(true);

    try {
      // Carga el archivo PDF Original en memoria
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPagesOriginal = pdfDoc.getPageCount();

      // Todas las páginas que se deben excluir
      const pagesToExclude = new Set<number>();
      selectedGroups.forEach((group) => {
        group.forEach((page) => pagesToExclude.add(page));
      });

      // Crea un nuevo PDF excluyendo las páginas seleccionadas
      const newPdf = await PDFDocument.create();
      for (let i = 0; i < totalPagesOriginal; i++) {
        if (!pagesToExclude.has(i + 1)) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
        }
      }

      // Guarda el nuevo PDF y genera una URL de blob
      const pdfBytes = await newPdf.save();
      const totalPaginasEdited = newPdf.getPageCount();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const newUrl = URL.createObjectURL(blob);


      // numero total de pagina de pdf provisional
      setPaginasEdited(Array.from({ length: totalPaginasEdited }, (_, i) => i + 1)); //array de pagina de pdf provisional

      //Actualizamos la URL del PDF Editado
      setFileUrl(newUrl);

      const paginasDisponible = paginasOrigin.filter((pageNumber) => !selectedGroups.flat().includes(pageNumber))

      // console.log(paginasOrigin)
      // console.log(paginasEdited)

      setRange({ start: paginasDisponible[0], end: paginasDisponible[0] });
    } catch (error) {
      alert("Error mientres se cargaba el preview");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedGroups]);


  // useEffect hook para actualizar la vista previa del PDF cuando cambian los grupos seleccionados
  useEffect(() => {
    if (file) {
      updatePdfPreview();
    }
  }, [file, selectedGroups, updatePdfPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    if (uploadedFile && uploadedFile.type === "application/pdf") {

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setFile(uploadedFile);
      setFileUrl(url);

      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);

      const listPagina = Array.from({ length: pdf.numPages }, (_, i) => i + 1)

      setPaginasOrigin(listPagina);
      setRange({ start: listPagina[0], end: listPagina[0] });

    } else {
      alert("Por Favor, Suba un archivo pdf");
    }
  };


  const handleRangeChange = (
    type: "start" | "end",
    value: string | undefined
  ) => {
    if (value === undefined) {
      setRange((prev) => ({ ...prev, [type]: null }));
    } else {
      const numericValue = parseInt(value, 10);
      setRange((prev) => ({
        ...prev,
        [type]: isNaN(numericValue) ? null : numericValue,
      }));
    }
  };

  const handleSaveGroup = async () => {
    const { start, end } = range;

    if (!start || !end || start > end || start < 1 || end > (numPagesOrigin || 0)) {
      alert("Por favor, defina un intervalo válido.");
      return;
    }

    const group = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setSelectedGroups((prev) => [...prev, group]);
    setRange({ start: 0, end: 0 });
  };

  const handleDeleteGroup = async (index: number) => {
    setSelectedGroups((prev) => prev.filter((_, i) => i !== index));
    setRange({ start: 0, end: 0 }); // Reset the range
  };

  const handleGeneratePdfs = async () => {
    if (!file || selectedGroups.length === 0) {
      alert("Please upload a PDF file and define at least one group.");
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      for (let i = 0; i < selectedGroups.length; i++) {

        const group = selectedGroups[i];
        const newPdf = await PDFDocument.create();
        for (const pageIndex of group) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex - 1]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `Group_${group.join("_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setNumPdfGenerado(i + 1)
        // Agregar un pequeño retraso para garantizar que todos los enlaces se procesen correctamente
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      alert("Un error ha ocurrido al generar el PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {!fileUrl && !numPagesOrigin && (

        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sube PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Haz clic para seleccionar un archivo PDF o arrastra y suelta aquí
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

      )}

      {fileUrl && numPagesOrigin && (
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="w-full lg:w-2/3 h-[calc(100vh-2rem)]">
            <CardContent className="h-full p-4">
              <iframe
                src={fileUrl}
                className="w-full h-full rounded"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            </CardContent>
          </Card>

          <Card className="w-full lg:w-1/3 flex flex-col h-[calc(100vh-2rem)]">
            <CardHeader>
              <CardTitle>Seleciona Paginas para Crear Grupo:</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden">
              <div className="flex gap-4">
                <Select
                  value={range.start?.toString()}

                  onValueChange={(value) => handleRangeChange("start", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={range.start?.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {paginasOrigin
                      .filter(
                        (pageNumber) =>
                          !selectedGroups.flat().includes(pageNumber)
                      )
                      .map((pageNumber, index) => (
                        <SelectItem
                          key={pageNumber}
                          value={pageNumber.toString()}
                        >
                          {`Página ${pageNumber} - (${index + 1})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={range.end?.toString()}
                  onValueChange={(value) => handleRangeChange("end", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={range.end?.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {paginasOrigin.filter(
                      (pageNumber) =>
                        !selectedGroups.flat().includes(pageNumber)
                    ).map((pageNumber, index) => (
                      <SelectItem
                        key={pageNumber}
                        value={pageNumber.toString()}
                      >
                        {`Página ${pageNumber} - (${index + 1})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveGroup} className="w-full">
                Salvar Grupo
              </Button>

              <div className="flex-grow flex flex-col min-h-0">
                <h3 className="text-base font-semibold mb-2">
                  Grupos Selecionados:
                </h3>
                {selectedGroups.length > 0 ? (
                  <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <ul className="space-y-2">
                      {selectedGroups.map((group, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-md"
                        >
                          <span className="flex items-center flex-grow mr-2 min-w-0">
                            <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              Nuevo PDF {index + 1}: Páginas {group[0]} a {group[group.length - 1]}
                            </span>
                          </span>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteGroup(index)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No hay grupos definidos aún.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleGeneratePdfs}
                disabled={isProcessing || selectedGroups.length === 0}
                className="w-full mt-4 flex-shrink-0"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    PDF Generados {numPdfGenerado} de {selectedGroups.length}
                  </>
                ) : (
                  "Generar PDFs"
                )}
              </Button>

            </CardContent>
          </Card>
        </div>
      )}
    </div >
  );
};
