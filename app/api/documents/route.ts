import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch all rider documents (for demo purposes, in production you might want to filter by session or rider ID)
    const { data: documents, error: documentsError } = await supabase
      .from("rider_documents")
      .select("*")
      .order("created_at", { ascending: false }) // Fixed column name from uploaded_at to created_at

    if (documentsError) {
      console.error("Database error:", documentsError)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
    })
  } catch (error) {
    console.error("Documents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
