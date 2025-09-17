"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, QrCode, Scan, CheckCircle, XCircle, Fuel } from "lucide-react"
import { useRouter } from "next/navigation"

interface VerificationResult {
  success: boolean
  riderName: string
  numberPlate: string
  licenseStatus: string
  registrationStatus: string
  lastVerified: string
}

export default function FuelStationPage() {
  const router = useRouter()
  const [showScanner, setShowScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
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
    // Simulate QR code scanning and verification
    setTimeout(() => {
      const mockResult: VerificationResult = {
        success: true,
        riderName: "John Doe",
        numberPlate: "MH12AB1234",
        licenseStatus: "Valid",
        registrationStatus: "Valid",
        lastVerified: new Date().toLocaleString(),
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
            <h1 className="text-2xl font-bold text-foreground">Fuel Station Portal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {!showScanner && !verificationResult && (
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl">Document Verification</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Fuel className="w-12 h-12 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Verify Rider Documents</h2>
                <p className="text-muted-foreground mb-8">
                  Scan the rider's QR code to verify their documents including number plate and registration
                </p>
                <Button onClick={handleStartScanning} className="w-full max-w-sm">
                  <QrCode className="w-4 h-4 mr-2" />
                  Start QR Scanner
                </Button>
              </CardContent>
            </Card>
          )}

          {showScanner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  QR Code Scanner
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
                  <p className="text-muted-foreground mb-4">Position the QR code within the frame to scan</p>
                  <div className="flex gap-3">
                    <Button onClick={simulateQRScan} className="flex-1">
                      Simulate Scan
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-accent" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`p-4 rounded-lg ${
                    verificationResult.success
                      ? "bg-accent/10 border border-accent/20"
                      : "bg-destructive/10 border border-destructive/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {verificationResult.success ? (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="font-semibold">
                      {verificationResult.success ? "Verification Successful" : "Verification Failed"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rider Name</label>
                      <p className="text-foreground font-medium">{verificationResult.riderName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number Plate</label>
                      <p className="text-foreground font-medium">{verificationResult.numberPlate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">License Status</label>
                      <p
                        className={`font-medium ${
                          verificationResult.licenseStatus === "Valid" ? "text-accent" : "text-destructive"
                        }`}
                      >
                        {verificationResult.licenseStatus}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Status</label>
                      <p
                        className={`font-medium ${
                          verificationResult.registrationStatus === "Valid" ? "text-accent" : "text-destructive"
                        }`}
                      >
                        {verificationResult.registrationStatus}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Verified</label>
                    <p className="text-foreground">{verificationResult.lastVerified}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setVerificationResult(null)
                      setShowScanner(false)
                    }}
                    className="flex-1"
                  >
                    Scan Another
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
