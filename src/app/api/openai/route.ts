import { getSession } from "@/actions/auth/getSession"
import { saveFile } from "@/actions/files/saveFile"
import { getAvailableRequest } from "@/actions/activity/getRecordsUser"
import type { fileEmpty } from "@/interface/inferface"
import { facturasOpenai } from "@/lib/openai"
import { convertPdfBufferToImage } from "@/lib/pdftopng"
import { totalTokens } from "@/lib/tiktoken"
import { NextResponse } from "next/server"
import PdfParse from "pdf-parse"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        {
          message: "No se ha iniciado sesión",
          error: true,
        },
        { status: 401 },
      )
    }

    // Obtener los archivos del FormData
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }

    // Verificar si hay archivos
    if (files.length === 0) {
      return NextResponse.json(
        {
          message: "No se han proporcionado archivos",
          error: true,
        },
        { status: 400 },
      )
    }

    // Verificar solicitudes disponibles
    const availableRequests = await getAvailableRequest()
    if (availableRequests < files.length) {
      return NextResponse.json(
        {
          message: `No tienes suficientes solicitudes disponibles. Disponibles: ${availableRequests}, Requeridas: ${files.length}`,
          error: true,
          availableRequests,
        },
        { status: 403 },
      )
    }

    let extractedTexts = ""
    const fileEmpty: fileEmpty[] = []
    const arrayTotalOpenai: any[] = []
    let contador_tokens = 0

    // Procesar archivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileSaved = await saveFile(file, user.id.toString())

      let data = await PdfParse(buffer)

      // Verificar contenido específico
      if (
        data.text.toLowerCase().includes("vodafone") ||
        data.text.toLowerCase().includes("endesa") ||
        data.text.toLowerCase().includes("sabadell")
      ) {
        data = await PdfParse(buffer, {
          max: 1,
        })
      }

      const numeroArchivo = "\nFactura-" + (i + 1) + "->\n"

      if (!data.text) {
        extractedTexts += numeroArchivo
        extractedTexts += await convertPdfBufferToImage(buffer)
      } else {
        extractedTexts += numeroArchivo
        extractedTexts += data.text
      }

      const tokens = await totalTokens(extractedTexts, "gpt-4o")
      console.log(`Total de tokens: ${tokens}`)

      const arrayOpenai = await facturasOpenai(extractedTexts)
      if (arrayOpenai.length === 0) {
        fileEmpty.push({
          fileName: file.name,
          fileUrl: fileSaved.filename,
        })
      }

      const arrayOpenaiWithUrl = arrayOpenai.map((item: any) => ({
        ...item,
        file_url: fileSaved.filename,
      }))

      arrayTotalOpenai.push(...arrayOpenaiWithUrl)
      contador_tokens += tokens
      extractedTexts = ""
    }

    // Registrar la actividad
    const insertQuery = `
      INSERT INTO activity (fk_user, tms, token, archivos, peticion)
      VALUES (?, NOW(), ?, ?, ?);
    `
    await db.execute(insertQuery, [user.id, contador_tokens, files.length, arrayTotalOpenai.length])

    return NextResponse.json({
      message: `Archivos procesados exitosamente ${arrayTotalOpenai.length} de ${files.length}`,
      arrayTotalOpenai,
      fileEmpty,
      remainingRequests: availableRequests - files.length,
    })
  } catch (error) {
    console.error("Error al procesar los archivos:", error)
    return NextResponse.json(
      {
        message: "Error al procesar los archivos",
        error: true,
      },
      { status: 500 },
    )
  }
}

