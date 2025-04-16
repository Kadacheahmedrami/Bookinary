import { Header } from "./header"
import { BookCoverUploader } from "@/components/ui-components"

export default function HomeWithHeader() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-3">Book Cover Detector</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Upload an image containing a book cover and our AI will detect, crop, and optimize it.
            </p>
          </div>

          <BookCoverUploader />

          <div className="mt-12 text-center text-sm text-slate-500">
            <p>
              This application uses computer vision to detect and extract book covers from images. Make sure the Python
              server is running on port 5000.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
