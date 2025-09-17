"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Camera, ImageIcon, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RiderPage() {
  const router = useRouter()
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"gallery" | "camera" | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setShowConfirmation(true)
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setShowConfirmation(true)
  }

  const confirmUpload = () => {
    // Here you would implement the actual upload logic
    console.log("Uploading files:", selectedFiles)
    alert("Documents uploaded successfully!")
    setSelectedFiles([])
    setShowConfirmation(false)
    setShowUploadOptions(false)
    setUploadMethod(null)
  }

  const cancelUpload = () => {
    setSelectedFiles([])
    setShowConfirmation(false)
    setUploadMethod(null)
  }

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
            <h1 className="text-2xl font-bold text-foreground">Rider Portal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {!showUploadOptions && !showConfirmation && (
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl">Document Management</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-accent-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Upload Your Documents</h2>
                <p className="text-muted-foreground mb-8">
                  Upload your driving license, registration certificate, and other required documents
                </p>
                <Button onClick={() => setShowUploadOptions(true)} className="w-full max-w-sm">
                  Upload Documents
                </Button>
              </CardContent>
            </Card>
          )}

          {showUploadOptions && !showConfirmation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Choose Upload Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="gallery-upload"
                    />
                    <Card className="h-full cursor-pointer hover:bg-accent/10 transition-colors">
                      <CardContent className="p-6 text-center">
                        <ImageIcon className="w-12 h-12 text-accent mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Choose from Gallery</h3>
                        <p className="text-sm text-muted-foreground">Select photos from your device gallery</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="camera-upload"
                    />
                    <Card className="h-full cursor-pointer hover:bg-accent/10 transition-colors">
                      <CardContent className="p-6 text-center">
                        <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Open Camera</h3>
                        <p className="text-sm text-muted-foreground">Take photos using your device camera</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Button variant="outline" onClick={() => setShowUploadOptions(false)} className="w-full">
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {showConfirmation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-accent" />
                  Confirm Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Selected Files ({selectedFiles.length})</h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={confirmUpload} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Upload
                  </Button>
                  <Button variant="outline" onClick={cancelUpload} className="flex-1 bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
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
