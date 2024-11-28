import { Button } from "@/components/ui/button";
import { Bot, FileText, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";

interface SelectedGroupsProps {
  selectedGroups: number[][];
  onDeleteGroup: (index: number) => void;
  isProcessing: boolean;
  numPdfGenerado: number;
  onGeneratePdfs: () => void;
  sendToOpenai: () => void;
}

const SelectedGroups = ({ selectedGroups, onDeleteGroup, isProcessing, numPdfGenerado, onGeneratePdfs, sendToOpenai }: SelectedGroupsProps) => {




  return (
    <div className="flex-grow flex flex-col min-h-0">
      <h3 className="text-base font-semibold mb-2">Grupos Seleccionados:</h3>
      {selectedGroups.length > 0 ? (
        <>
          {/* Contenedor con scroll dinámico */}
          <div className="flex-grow overflow-y-auto h-[300px]">
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
                    onClick={() => onDeleteGroup(index)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          {/* Botón para generar pdfs */}
          <Button
            size="sm"
            onClick={onGeneratePdfs}
            disabled={isProcessing || selectedGroups.length === 0}
            className="w-full mt-4 flex-shrink-0  select-none bg-red-500 border border-transparent transition-all  hover:text-red-500 hover:bg-white hover:border hover:border-red-500 active:translate-y-[0.10rem]"
          >
            {isProcessing ? (
              <>
                <FileText className="size-4 animate-spin" />
                PDF Generados {numPdfGenerado} de {selectedGroups.length}
              </>
            ) : (
              <>
                <FileText className="size-4" />
                Descargar {selectedGroups.length} PDF{selectedGroups.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
          {/* Botón para envia a la api de openai */}
          <Button
            size="sm"
            onClick={sendToOpenai}
            disabled={isProcessing || selectedGroups.length === 0}
            className="w-full mt-4 flex-shrink-0  select-none bg-green-500 border border-transparent transition-all  hover:text-green-500 hover:bg-white hover:border hover:border-green-500 active:translate-y-[0.10rem]"
          >
            {isProcessing ? (
              <>
                <Bot className="size-4 animate-spin" />
                PDF Generados {numPdfGenerado} de {selectedGroups.length}
              </>
            ) : (
              <>
                <Bot className="size-4" />
                Leer PDF  {selectedGroups.length} PDF{selectedGroups.length > 1 ? "s" : ""} con AI
              </>
            )}
          </Button>
        </>
      ) : (
        <Alert>
          <AlertDescription>No hay grupos definidos aún.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SelectedGroups;
