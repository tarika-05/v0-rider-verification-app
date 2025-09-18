import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const documentType = (formData.get("documentType") as string) || "identity"

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}`,
          },
          { status: 400 },
        )
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `File too large: ${file.name}. Maximum size: 10MB`,
          },
          { status: 400 },
        )
      }
    }

    const uploadedFiles = []

    for (const file of files) {
      const fileName = `${user.id}/${documentType}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("rider-documents")
        .upload(fileName, file)

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 })
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("rider-documents").getPublicUrl(fileName)

      const { data: documentData, error: dbError } = await supabase
        .from("rider_documents")
        .insert({
          rider_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          verification_status: "pending",
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        return NextResponse.json({ error: "Failed to save document metadata" }, { status: 500 })
      }

      uploadedFiles.push({
        id: documentData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        uploadedAt: documentData.uploaded_at,
        status: documentData.verification_status,
        documentType: documentData.document_type,
      })
    }

    const qrData = {
      riderId: user.id,
      documents: uploadedFiles.map((f) => ({ id: f.id, type: f.documentType, status: f.status })),
      generatedAt: new Date().toISOString(),
    }

    const { data: qrCodeData, error: qrError } = await supabase
      .from("rider_qr_codes")
      .insert({
        rider_id: user.id,
        qr_code_data: JSON.stringify(qrData),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        is_active: true,
      })
      .select()
      .single()

    if (qrError) {
      console.error("QR code error:", qrError)
      // Don't fail the upload if QR generation fails
    }

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully",
      files: uploadedFiles,
      qrCode: qrCodeData ? Buffer.from(JSON.stringify(qrData)).toString("base64") : null,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload documents" }, { status: 500 })
  }
}
