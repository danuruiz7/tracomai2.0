"use client";
import { Card, CardContent } from "@/components/ui/card";
import { PDFDocument } from "pdf-lib";
import { useCallback, useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import PageSelector from "./mini-components/PageSelector";
import PdfUpload from "./mini-components/PdfUpload";
import PdfViewer from "./mini-components/PdfViewer";
import SelectedGroups from "./mini-components/SelectedGroups";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface Range {
  start: number | null;
  end: number | null;
}

export const PdfPreview = () => {
  const [file, setFile] = useState<File | null>(null);//Archivo PDF que se va a procesar
  const [fileUrl, setFileUrl] = useState<string | null>(null);//URL del archivo PDF que se va a mostrar
  const [numPagesOrigin, setNumPages] = useState<number | null>(null);//Numero Total de Páginas del PDF
  const [paginasOrigin, setPaginasOrigin] = useState<number[]>([]);//Array con las pagina de PDF original[1,2,3....,50,51,52...]
  const [selectedGroups, setSelectedGroups] = useState<number[][]>([]);//Grupos de páginas que se van a procesar
  const [isProcessing, setIsProcessing] = useState<boolean>(false); //Indica si se está procesando el archivo PDF
  const [range, setRange] = useState<Range>({ start: 0, end: 0, });  //Intervalo de páginas que se van a procesar
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
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const newUrl = URL.createObjectURL(blob);

      //Actualizamos la URL del PDF Editado
      setFileUrl(newUrl);

      const paginasDisponible = paginasOrigin.filter((pageNumber) => !selectedGroups.flat().includes(pageNumber))

      setRange({ start: paginasDisponible[0], end: paginasDisponible[0] });
    } catch (error) {
      alert("Error mientres se cargaba el preview");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedGroups, paginasOrigin]);


  // useEffect hook para actualizar la vista previa del PDF cuando cambian los grupos seleccionados
  useEffect(() => {
    if (file) {
      updatePdfPreview();
    }
  }, [file, selectedGroups, updatePdfPreview]);

  const handleFileChange = async (filePDF: File) => {

    if (filePDF && filePDF.type === "application/pdf") {

      const arrayBuffer = await filePDF.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setFile(filePDF);
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
      alert("Por favor, suba un archivo PDF y defina al menos un grupo");
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
        link.download = `Pagina_${group[0]}_a_${group[group.length - 1]}.pdf`;
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
        <PdfUpload onFileChange={handleFileChange} />
      )}

      {fileUrl && numPagesOrigin && (
        <div className="flex flex-col lg:flex-row gap-6">
          <PdfViewer fileUrl={fileUrl} />

          <Card className="w-full lg:w-1/3 flex flex-col h-[calc(100vh-2rem)]">
            <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden py-4">

              <PageSelector
                paginasOrigin={paginasOrigin}
                selectedGroups={selectedGroups}
                range={range}
                onRangeChange={handleRangeChange}
                onSaveGroup={handleSaveGroup}
                handleRangeChange={handleRangeChange}
              />

              <SelectedGroups
                selectedGroups={selectedGroups}
                onDeleteGroup={handleDeleteGroup}
                isProcessing={isProcessing}
                numPdfGenerado={numPdfGenerado}
                onGeneratePdfs={handleGeneratePdfs}
              />

            </CardContent>
          </Card>
        </div>
      )}
    </div >
  );
};
