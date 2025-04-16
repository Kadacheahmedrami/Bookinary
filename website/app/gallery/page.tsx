"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Gallery() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // This is a mock function since we don't have a real endpoint to list processed images
    // In a real application, you would fetch this from your server
    const fetchProcessedImages = async () => {
      try {
        // Mock data - in a real app, you would fetch this from your server
        // For example: const response = await fetch('/api/processed-images');
        // const data = await response.json();

        // Simulating a server response with mock data
        setTimeout(() => {
          // This is just placeholder data
          // In a real app, these would be actual image URLs from your server
          setImages([
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
          ])
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError("Failed to load gallery images")
        setLoading(false)
      }
    }

    fetchProcessedImages()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            <span className="flex items-center justify-center gap-2">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              Processed Book Covers Gallery
            </span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">View all your previously processed book covers.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="relative h-80 w-full">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Processed book cover ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-slate-500">Book Cover #{index + 1}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Note: This is a demo gallery with placeholder images. In a real application, this would show your actual
            processed book covers.
          </p>
        </div>
      </div>
    </main>
  )
}
