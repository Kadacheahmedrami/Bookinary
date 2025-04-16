"use client"

import type React from "react"

import { useState } from "react"
import { Upload, BookOpen, ImageIcon, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function BookCoverUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select an image file")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", file)

      // Use our Next.js API route as a proxy to the Python server
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Construct the full URL to the processed image
        setProcessedImage(`http://localhost:5000${data.url}`)
      } else {
        setError(data.message || "Failed to process image")
      }
    } catch (err) {
      setError("Error processing image. Make sure the Python server is running.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement("a")
      link.href = processedImage
      link.download = "processed-book-cover.jpg"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" />
            Upload Book Image
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
              <input type="file" id="image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="image-upload" className="cursor-pointer block">
                {preview ? (
                  <div className="relative w-full h-64">
                    <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="py-8">
                    <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Click to select an image or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </label>
            </div>

            {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Book Cover"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Processed Cover
          </h2>

          <div className="border rounded-lg bg-slate-50 h-[350px] flex items-center justify-center">
            {processedImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={processedImage || "/placeholder.svg"}
                  alt="Processed book cover"
                  fill
                  className="object-contain p-4"
                />
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <BookOpen className="h-12 w-12 mx-auto mb-2" />
                <p>Processed book cover will appear here</p>
              </div>
            )}
          </div>

          {processedImage && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => window.open(processedImage, "_blank")} variant="outline" className="flex-1">
                View Full Size
              </Button>
              <Button onClick={downloadImage} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
