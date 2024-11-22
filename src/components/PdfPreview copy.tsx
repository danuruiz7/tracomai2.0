"use client";

import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

export const PdfPreview = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<number[][]>([]);
  const [usedPages, setUsedPages] = useState<Set<number>>(new Set());
  const [range, setRange] = useState<{
    start: number | null;
    end: number | null;
  }>({
    start: null,
    end: null,
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
    } else {
      alert("Please upload a valid PDF file.");
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

  const handleSaveGroup = () => {
    const { start, end } = range;

    if (!start || !end || start > end || start < 1 || end > (numPages || 0)) {
      alert("Please define a valid range.");
      return;
    }

    const group = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setSelectedGroups((prev) => [...prev, group]);
    setUsedPages((prev) => {
      const newSet = new Set(prev);
      group.forEach((page) => newSet.add(page));
      return newSet;
    });
    setRange({ start: null, end: null });
  };

  const handleDeleteGroup = (index: number) => {
    setSelectedGroups((prev) => prev.filter((_, i) => i !== index));
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

      for (const group of selectedGroups) {
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
        link.click();
      }
    } catch (error) {
      alert("An error occurred while processing the PDF.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAvailablePages = () => {
    return Array.from({ length: numPages || 0 }, (_, i) => i + 1).filter(
      (page) => !usedPages.has(page) // Excluir páginas usadas
    );
  };

  return (
    <div className="w-full space-y-4">
      {!fileUrl && !numPages && (
        <div className="w-full flex justify-center">
          <Card className="w-1/2 shadow-lg">
            <CardHeader>
              <CardTitle>Sube PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mb-4"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {fileUrl && numPages && (
        <div className="w-full flex gap-4 px-40">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>PDF Vista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px] overflow-auto border border-gray-200 rounded-lg">
                <iframe
                  src={`${fileUrl}`}
                  className="w-full h-[600px]"
                  title="PDF Preview"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seleciona Paginas:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select
                  value={range.start?.toString() || undefined}
                  onValueChange={(value) => handleRangeChange("start", value)}
                >
                  <SelectTrigger className="w-[140px] text-sm">
                    <SelectValue placeholder="Inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePages().map((pageNumber) => (
                      <SelectItem
                        key={pageNumber}
                        value={pageNumber.toString()}
                      >
                        Página {pageNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={range.end?.toString() || undefined}
                  onValueChange={(value) => handleRangeChange("end", value)}
                >
                  <SelectTrigger className="w-[140px] text-sm">
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePages().map((pageNumber) => (
                      <SelectItem
                        key={pageNumber}
                        value={pageNumber.toString()}
                      >
                        Página {pageNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={handleSaveGroup} className="w-full">
                Salvar Grupo
              </Button>

              <div>
                <h3 className="text-base font-semibold mb-2">
                  Grupos Selecionados:
                </h3>
                {selectedGroups.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedGroups.map((group, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded text-sm"
                      >
                        <span>
                          Nuevo PDF {index + 1}: Pages {group.join(", ")}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGroup(index)}
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
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
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Generar PDFs"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
