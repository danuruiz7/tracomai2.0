"use client"

import type React from "react"


import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { AlertCircle } from "lucide-react"

import {
  getUserSubscription,
  getTotalRequest,
  getRecordPrompts,
  savePrompt,
  deletePrompt,
} from "@/actions/activity/getRecordsUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PromptRecord {
  id: number
  tms: string
  descripcion: string
} 

export function DashboardContent() {
  const [description, setDescription] = useState("")
  const [totalSubscription, setTotalSubscription] = useState<number>(0)
  const [totalRequests, setTotalRequests] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [recentPrompts, setRecentPrompts] = useState<PromptRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const totalPages = Math.ceil(totalRecords / 5)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      // Execute all promises but handle their results separately
      const subscription = await getUserSubscription()
      const requests = await getTotalRequest()
      const promptsData = await getRecordPrompts(currentPage)

      setTotalSubscription(subscription)
      setTotalRequests(requests)
      setRecentPrompts(promptsData.records)
      setTotalRecords(promptsData.total)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    try {
      setIsSaving(true)
      setError(null)
      await savePrompt(description.trim())
      setDescription("")

      // Recargar los datos y volver a la primera página
      setCurrentPage(1)
      await loadData()
    } catch (error) {
      console.error("Error al guardar:", error)
      setError("No se pudo guardar el registro")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este registro?")) return

    try {
      setError(null)
      await deletePrompt(id)
      await loadData()
    } catch (error) {
      console.error("Error al eliminar:", error)
      setError("No se pudo eliminar el registro")
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full flex items-start gap-6 p-4">
      {/* Left side - Counters */}
      <div className="w-1/3 space-y-4">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nº de facturas contratado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalSubscription}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nº de facturas interpretadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nº de facturas disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalSubscription-totalRequests}</div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Table and Form */}
      <div className="w-2/3">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ultimos Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="w-[60px]">Borrar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">
                        {new Date(prompt.tms).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{prompt.descripcion}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentPrompts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No hay registros recientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Añadir nuevo Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1"
                  disabled={isSaving}
                />
                <Button type="submit" disabled={isSaving || !description.trim()}>
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

