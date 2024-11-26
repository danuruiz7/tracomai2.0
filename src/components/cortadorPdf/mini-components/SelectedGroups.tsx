import { Button } from "@/components/cortadorPdf/ui/button";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface SelectedGroupsProps {
  selectedGroups: number[][];
  onDeleteGroup: (index: number) => void;
  isProcessing: boolean;
  numPdfGenerado: number;
  onGeneratePdfs: () => void;
}

const SelectedGroups: React.FC<SelectedGroupsProps> = ({
  selectedGroups,
  onDeleteGroup,
  isProcessing,
  numPdfGenerado,
  onGeneratePdfs,
}) => {
  return (
    <div className="flex-grow flex flex-col min-h-0">
      <h3 className="text-base font-semibold mb-2">
        Grupos Selecionados:
      </h3>
      {selectedGroups.length > 0 ? (
        <>
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
                    onClick={() => onDeleteGroup(index)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <Button
            size="sm"
            onClick={onGeneratePdfs}
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
        </>
      ) : (
        <Alert>
          <AlertDescription>
            No hay grupos definidos aún.
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
};

export default SelectedGroups;
