import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function validateFileType(file: File): { isValid: boolean; detectedType: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]

  // First check the MIME type
  if (file.type && allowedTypes.includes(file.type)) {
    return { isValid: true, detectedType: file.type }
  }

  // Fallback to file extension if MIME type is missing or invalid
  const fileName = file.name.toLowerCase()
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return { isValid: true, detectedType: "image/jpeg" }
  }
  if (fileName.endsWith(".png")) {
    return { isValid: true, detectedType: "image/png" }
  }
  if (fileName.endsWith(".pdf")) {
    return { isValid: true, detectedType: "application/pdf" }
  }

  return { isValid: false, detectedType: file.type || "undefined" }
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function createRegularClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseAnonKey)
}

async function ensureBucketExists(bucketName: string) {
  try {
    const adminClient = createAdminClient()

    // Try to get bucket info first
    const { data: buckets, error: listError } = await adminClient.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return false
    }

    // Check if bucket already exists
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName)

    if (bucketExists) {
      return true
    }

    // Create bucket if it doesn't exist
    const { data, error: createError } = await adminClient.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      fileSizeLimit: 5242880, // 5MB
    })

    if (createError) {
      console.error("Error creating bucket:", createError)
      return false
    }

    console.log("Bucket created successfully:", bucketName)
    return true
  } catch (error) {
    console.error("Error ensuring bucket exists:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const regularClient = createRegularClient()

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const documentType = (formData.get("documentType") as string) || "identity"

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of files) {
      const { isValid, detectedType } = validateFileType(file)

      if (!isValid) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${detectedType}. Allowed types: ${allowedTypes.join(", ")}`,
          },
          { status: 400 },
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `File too large: ${file.name}. Maximum size: 5MB`,
          },
          { status: 400 },
        )
      }
    }

    const bucketName = "rider-documents"
    const bucketReady = await ensureBucketExists(bucketName)

    if (!bucketReady) {
      return NextResponse.json({ error: "Storage bucket is not available. Please try again later." }, { status: 500 })
    }

    const uploadedFiles = []
    const anonymousRiderId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    for (const file of files) {
      const fileName = `${anonymousRiderId}/${documentType}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await adminClient.storage.from(bucketName).upload(fileName, file)

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 })
      }

      const {
        data: { publicUrl },
      } = adminClient.storage.from(bucketName).getPublicUrl(fileName)

      const { detectedType } = validateFileType(file)

      const { data: documentData, error: dbError } = await regularClient
        .from("rider_documents")
        .insert({
          rider_id: anonymousRiderId,
          document_type: documentType,
          file_name: file.name,
          file_size: file.size,
          file_url: publicUrl, // Store the public URL instead of file_path
          upload_status: "uploaded", // Use upload_status instead of verification_status
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
        type: detectedType,
        url: publicUrl,
        uploadedAt: documentData.created_at,
        status: documentData.upload_status, // Updated to use upload_status
        documentType: documentData.document_type,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully",
      files: uploadedFiles,
      riderId: anonymousRiderId,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload documents" }, { status: 500 })
  }
}
