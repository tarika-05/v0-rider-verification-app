"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Camera, ImageIcon, Check, X, FileText, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface Document {
  id: string
  file_name: string
  file_url: string
  file_size: number
  document_type: string
  upload_status: string
  uploaded_at: string
}

export default function RiderPage() {
  const router = useRouter()
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"gallery" | "camera" | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await fetch("/api/documents")
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents || [])
      } else {
        console.error("Failed to fetch documents:", data.error)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setShowConfirmation(true)
    setUploadError(null)
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setShowConfirmation(true)
    setUploadError(null)
  }

  const confirmUpload = async () => {
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("documentType", "identity") // Default document type

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        alert("Documents uploaded successfully!")
        setSelectedFiles([])
        setShowConfirmation(false)
        setShowUploadOptions(false)
        setUploadMethod(null)
        fetchDocuments()
      } else {
        setUploadError(data.error || "Failed to upload documents")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError("Failed to upload documents. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const cancelUpload = () => {
    setSelectedFiles([])
    setShowConfirmation(false)
    setUploadMethod(null)
    setUploadError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Rider Portal</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Uploaded Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDocuments ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{doc.file_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span className="capitalize">{doc.document_type}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploaded_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            doc.upload_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {doc.upload_status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.file_url, "_blank")}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
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
                        accept="image/*,application/pdf"
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
                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Selected Files ({selectedFiles.length})</h3>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-foreground flex-1">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={confirmUpload} className="flex-1" disabled={uploading}>
                      <Check className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Confirm Upload"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelUpload}
                      className="flex-1 bg-transparent"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
