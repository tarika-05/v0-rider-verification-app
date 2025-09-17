import { type NextRequest, NextResponse } from "next/server"

interface DocumentVerification {
  type: string
  status: "valid" | "expired" | "invalid"
  expiryDate?: string
  issueDate?: string
  details?: string
}

interface VerificationResult {
  success: boolean
  riderName: string
  numberPlate: string
  vehicleType?: string
  documents: DocumentVerification[]
  violations: string[]
  lastVerified: string
  riskLevel: "low" | "medium" | "high"
}

export async function POST(request: NextRequest) {
  try {
    const { qrCode, verifierType } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code data is required" }, { status: 400 })
    }

    // Decode QR code data
    let qrData
    try {
      qrData = JSON.parse(Buffer.from(qrCode, "base64").toString())
    } catch (error) {
      return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Validate QR code authenticity
    // 2. Check if QR code is not expired
    // 3. Fetch rider data from database
    // 4. Verify documents against government APIs (DigiLocker, etc.)
    // 5. Check for any violations or blacklisted status

    // Mock verification based on verifier type
    const baseResult = {
      success: true,
      riderName: "John Doe",
      numberPlate: "MH12AB1234",
      lastVerified: new Date().toISOString(),
    }

    let result: VerificationResult

    if (verifierType === "fuel-station") {
      // Fuel station only needs basic verification
      result = {
        ...baseResult,
        vehicleType: "Motorcycle",
        documents: [
          {
            type: "Registration Certificate",
            status: "valid",
            expiryDate: "2025-08-20",
            details: "Valid RC",
          },
          {
            type: "Driving License",
            status: "valid",
            expiryDate: "2026-12-15",
            details: "Valid DL",
          },
        ],
        violations: [],
        riskLevel: "low",
      }
    } else if (verifierType === "police") {
      // Police need comprehensive verification
      result = {
        ...baseResult,
        vehicleType: "Motorcycle",
        documents: [
          {
            type: "Driving License",
            status: "valid",
            expiryDate: "2026-12-15",
            issueDate: "2016-12-15",
            details: "Class: MCWG",
          },
          {
            type: "Registration Certificate",
            status: "valid",
            expiryDate: "2025-08-20",
            issueDate: "2020-08-20",
            details: "Engine: 150cc",
          },
          {
            type: "Insurance",
            status: "expired",
            expiryDate: "2024-03-10",
            issueDate: "2023-03-10",
            details: "Policy: Third Party",
          },
          {
            type: "Pollution Certificate",
            status: "valid",
            expiryDate: "2024-12-30",
            issueDate: "2024-06-30",
            details: "Valid PUC",
          },
        ],
        violations: ["Insurance Expired"],
        riskLevel: "medium",
      }
    } else {
      return NextResponse.json({ error: "Invalid verifier type" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Failed to verify documents" }, { status: 500 })
  }
}
