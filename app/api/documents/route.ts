import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch rider's documents
    const { data: documents, error: documentsError } = await supabase
      .from("rider_documents")
      .select("*")
      .eq("rider_id", user.id)
      .order("uploaded_at", { ascending: false })

    if (documentsError) {
      console.error("Database error:", documentsError)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    // Fetch rider profile
    const { data: rider, error: riderError } = await supabase.from("riders").select("*").eq("id", user.id).single()

    if (riderError) {
      console.error("Rider fetch error:", riderError)
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      rider: rider || { id: user.id, full_name: user.email },
    })
  } catch (error) {
    console.error("Documents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
