import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"

interface Props {
  onFileChange: (file: File) => void
}

const PdfUpload = ({ onFileChange }: Props) => {

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      onFileChange(uploadedFile);
    } else {
      alert("Por favor, suba un archivo PDF válido.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto  shadow-xl shadow-slate-600/50 rounded-lg mt-32">
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
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>
      </CardContent>
    </Card>
  )
}

export default PdfUpload 
