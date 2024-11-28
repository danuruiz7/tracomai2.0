import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <FileQuestion className="w-24 h-24 text-gray-100 mb-8" />
      <h1 className="text-4xl font-bold mb-2">404: Página no encontrada</h1>
      <p className="text-xl text-gray-400 mb-8">Lo sentimos, no pudimos encontrar el recurso solicitado.</p>
      <Button asChild variant="outline" className="bg-white text-black hover:bg-gray-200">
        <Link href="/dashboard">
          Volver al inicio
        </Link>
      </Button>
    </div>
  )
}

