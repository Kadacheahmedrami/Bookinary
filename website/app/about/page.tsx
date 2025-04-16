import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Code, ImageIcon, Zap } from "lucide-react"

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
              About Bookinary
            </span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Learn more about how our book cover detection technology works.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <p className="text-slate-600 mb-4">
              Bookinary uses advanced computer vision techniques to detect, extract, and optimize book covers from your
              images. Here's the process:
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <ImageIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-medium mb-2">1. Image Upload</h3>
                <p className="text-sm text-slate-500">
                  Upload any image containing a book cover. Our system accepts various image formats.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <Code className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-medium mb-2">2. Computer Vision</h3>
                <p className="text-sm text-slate-500">
                  Our algorithm detects the book cover using edge detection and contour analysis.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-medium mb-2">3. Optimization</h3>
                <p className="text-sm text-slate-500">
                  The extracted cover is optimized for quality and file size, ready for use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Technical Details</h2>
            <p className="text-slate-600 mb-4">
              Bookinary combines several technologies to provide a seamless experience:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <span className="font-medium">Frontend:</span> Built with Next.js and React for a responsive, modern
                user interface
              </li>
              <li>
                <span className="font-medium">Backend:</span> Powered by a Python Flask server with OpenCV for image
                processing
              </li>
              <li>
                <span className="font-medium">Computer Vision:</span> Uses edge detection, contour analysis, and
                perspective transformation
              </li>
              <li>
                <span className="font-medium">Image Optimization:</span> Automatically resizes and compresses images
                while maintaining quality
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Use Cases</h2>
            <p className="text-slate-600 mb-4">Bookinary is perfect for:</p>

            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Book collectors organizing their digital library</li>
              <li>Online booksellers needing clean cover images</li>
              <li>Librarians digitizing their collections</li>
              <li>Book bloggers and reviewers creating consistent thumbnails</li>
              <li>Publishers and authors preparing marketing materials</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
