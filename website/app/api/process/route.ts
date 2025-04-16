import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    console.log("Forwarding request to Python server...")

    // Forward the request to the Python server
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      console.error(`Python server responded with status: ${response.status}`)
      return NextResponse.json(
        {
          success: false,
          message: `Server error: ${response.status}. Make sure the Python server is running.`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Response from Python server:", data)

    // Return the response from the Python server
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process image. Make sure the Python server is running.",
      },
      { status: 500 },
    )
  }
}
