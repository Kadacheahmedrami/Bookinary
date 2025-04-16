"use client"

import type React from "react"

import { useState } from "react"
import { Upload, BookOpen, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function Home() {
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

      // Use our Next.js API route instead of directly calling the Flask server
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Construct the full URL to the processed image
        setProcessedImage(`http://localhost:5000${data.url}`)
      } else {
        setError(data.message || "Failed to process image")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error connecting to server. Make sure the Python server is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-3">
            <span className="flex items-center justify-center gap-2">
              <BookOpen className="h-10 w-10 text-emerald-600" />
              Bookinary
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upload an image containing a book cover and our AI will detect, crop, and optimize it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                Upload Book Image
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
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

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!file || loading}
                >
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
                <div className="mt-4">
                  <Button onClick={() => window.open(processedImage, "_blank")} variant="outline" className="w-full">
                    View Full Size
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>
            This application uses computer vision to detect and extract book covers from images. Make sure the Python
            server is running on port 5000.
          </p>
        </div>
      </div>
    </main>
  )
}
