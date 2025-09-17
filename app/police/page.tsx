"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, QrCode, Scan, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface DocumentStatus {
  type: string
  status: "valid" | "expired" | "invalid"
  expiryDate?: string
  issueDate?: string
  details?: string
}

interface PoliceVerificationResult {
  success: boolean
  riderName: string
  numberPlate: string
  vehicleType: string
  documents: DocumentStatus[]
  violations: string[]
  lastVerified: string
  riskLevel: "low" | "medium" | "high"
}

export default function PolicePage() {
  const router = useRouter()
  const [showScanner, setShowScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [verificationResult, setVerificationResult] = useState<PoliceVerificationResult | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setIsScanning(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const simulateQRScan = () => {
    // Simulate comprehensive police verification
    setTimeout(() => {
      const mockResult: PoliceVerificationResult = {
        success: true,
        riderName: "John Doe",
        numberPlate: "MH12AB1234",
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
        lastVerified: new Date().toLocaleString(),
        riskLevel: "medium",
      }
      setVerificationResult(mockResult)
      stopCamera()
      setShowScanner(false)
    }, 2000)
  }

  const handleStartScanning = () => {
    setShowScanner(true)
    startCamera()
  }

  const handleStopScanning = () => {
    stopCamera()
    setShowScanner(false)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-accent text-accent-foreground"
      case "medium":
        return "bg-yellow-500 text-yellow-50"
      case "high":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-accent text-accent-foreground"
      case "expired":
        return "bg-yellow-500 text-yellow-50"
      case "invalid":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Police Verification Portal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showScanner && !verificationResult && (
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl">Comprehensive Document Verification</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-12 h-12 text-secondary-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Verify All Documents</h2>
                <p className="text-muted-foreground mb-8">
                  Scan the rider's QR code to verify driving license, insurance, registration certificate, and
                  compliance status
                </p>
                <Button onClick={handleStartScanning} className="w-full max-w-sm">
                  <QrCode className="w-4 h-4 mr-2" />
                  Start Verification Scanner
                </Button>
              </CardContent>
            </Card>
          )}

          {showScanner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Document Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-accent rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Position the QR code within the frame for comprehensive verification
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={simulateQRScan} className="flex-1">
                      Simulate Verification
                    </Button>
                    <Button variant="outline" onClick={handleStopScanning} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {verificationResult && (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {verificationResult.success ? (
                        <CheckCircle className="w-5 h-5 text-accent" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      Verification Complete
                    </div>
                    <Badge className={getRiskColor(verificationResult.riskLevel)}>
                      {verificationResult.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rider Name</label>
                      <p className="text-foreground font-medium">{verificationResult.riderName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number Plate</label>
                      <p className="text-foreground font-medium">{verificationResult.numberPlate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                      <p className="text-foreground font-medium">{verificationResult.vehicleType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verificationResult.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{doc.type}</h4>
                            <Badge className={getStatusColor(doc.status)}>{doc.status.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{doc.details}</p>
                          {doc.expiryDate && (
                            <p className="text-xs text-muted-foreground mt-1">Expires: {doc.expiryDate}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Violations */}
              {verificationResult.violations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Violations Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {verificationResult.violations.map((violation, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                        >
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-destructive font-medium">{violation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setVerificationResult(null)
                        setShowScanner(false)
                      }}
                      className="flex-1"
                    >
                      Verify Another
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
                      Back to Home
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Last verified: {verificationResult.lastVerified}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
