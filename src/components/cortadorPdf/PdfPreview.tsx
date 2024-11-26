"use client";

import { Card, CardContent } from "@/components/cortadorPdf/ui/card";
import { useEffect } from "react";
import { usePdfProcesador } from "./hook/usePdfProcesador";
import PageSelector from "./mini-components/PageSelector";
import PdfUpload from "./mini-components/PdfUpload";
import PdfViewer from "./mini-components/PdfViewer";
import SelectedGroups from "./mini-components/SelectedGroups";

export const PdfPreview = () => {
  const {
    file,
    fileUrl,
    range,
    numPagesOrigin,
    paginasOrigin,
    selectedGroups,
    isProcessing,
    numPdfGenerado,
    handleFileChange,
    handleRangeChange,
    handleSaveGroup,
    handleDeleteGroup,
    handleGeneratePdfs,
    updatePdfPreview,
  } = usePdfProcesador();

  // useEffect hook para actualizar la vista previa del PDF cuando cambian los grupos seleccionados
  useEffect(() => {
    if (file) {
      updatePdfPreview();
    }
  }, [file, selectedGroups, updatePdfPreview]);

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
