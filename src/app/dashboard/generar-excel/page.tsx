import { getAvailableRequest } from "@/actions/activity/getRecordsUser"
import FormFactura from "@/components/generarExcel/formulario/FormFactura"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
export const dynamic = 'force-dynamic';


export default async function GeneralExcelPage() {
  const availableRequests = await getAvailableRequest()

  if (availableRequests <= 0) {
    return (
      <div className="px-4 max-w-md mx-auto mt-8">
        <Card className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sin solicitudes disponibles</AlertTitle>
            <AlertDescription className="mt-2">
              Has alcanzado el límite de solicitudes para este mes. Por favor, espera al próximo mes o actualiza tu plan
              de suscripción.
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4">
      <FormFactura />
    </div>
  )
}