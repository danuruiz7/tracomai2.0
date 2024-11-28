import { Card, CardContent } from '../../ui/card'

interface Props {
  fileUrl: string
}

const PdfViewer = ({ fileUrl }: Props) => {
  return (
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
  )
}

export default PdfViewer
