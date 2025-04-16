from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import os
import uuid
import cv2
import numpy as np

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
MAX_WIDTH = 1080

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def crop_book_cover(image_path):
    """
    Detect and crop the book cover from an image.
    
    Args:
        image_path (str): Path to the input image.
        
    Returns:
        PIL.Image: Cropped image containing only the book cover.
    """
    # Read the image with OpenCV
    img = cv2.imread(image_path)
    original = img.copy()
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply edge detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Dilate the edges to connect nearby edges
    dilated = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
    
    # Find contours
    contours, _ = cv2.findContours(dilated.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Sort contours by area (largest first)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)
    
    book_cover = None
    
    # Loop through contours to find the book cover (largest rectangular contour)
    for contour in contours:
        # Approximate the contour to a polygon
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
        
        # If the polygon has 4 points, it might be a book cover
        if len(approx) == 4:
            # Check if it's large enough to be a book cover (filter out small rectangles)
            if cv2.contourArea(contour) > (original.shape[0] * original.shape[1]) / 20:
                # Create a mask for the contour area
                mask = np.zeros_like(gray)
                cv2.drawContours(mask, [approx], 0, 255, -1)
                
                # Apply perspective transform to get a straight view of the book cover
                pts = approx.reshape(4, 2)
                rect = order_points(pts)
                
                # Get width and height of the book cover
                width = max(
                    np.linalg.norm(rect[1] - rect[0]),
                    np.linalg.norm(rect[3] - rect[2])
                )
                height = max(
                    np.linalg.norm(rect[2] - rect[1]),
                    np.linalg.norm(rect[3] - rect[0])
                )
                
                width, height = int(width), int(height)
                
                # Define destination points for the perspective transform
                dst = np.array([
                    [0, 0],
                    [width - 1, 0],
                    [width - 1, height - 1],
                    [0, height - 1]
                ], dtype="float32")
                
                # Calculate perspective transform matrix and apply it
                M = cv2.getPerspectiveTransform(rect, dst)
                warped = cv2.warpPerspective(original, M, (width, height))
                
                # Convert the warped image back to PIL format
                book_cover = Image.fromarray(cv2.cvtColor(warped, cv2.COLOR_BGR2RGB))
                break
    
    # If no suitable contour was found, return the original image
    if book_cover is None:
        return Image.open(image_path)
    
    return book_cover

def order_points(pts):
    """
    Order points in: top-left, top-right, bottom-right, bottom-left order.
    
    Args:
        pts (numpy.ndarray): Array of 4 points.
        
    Returns:
        numpy.ndarray: Ordered points.
    """
    # Initialize a rectangle with ordered coordinates
    rect = np.zeros((4, 2), dtype="float32")
    
    # The top-left point will have the smallest sum
    # The bottom-right point will have the largest sum
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    
    # The top-right point will have the smallest difference
    # The bottom-left point will have the largest difference
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    
    return rect

def optimize_image(input_path, output_path, quality=85, max_width=MAX_WIDTH):
    """
    Reduce and optimize image size while maintaining good quality.
    
    Args:
        input_path (str): Path to the input image.
        output_path (str): Path to save the optimized image.
        quality (int): Quality setting (1–95).
        max_width (int): Resize image if width exceeds this value.
    """
    with Image.open(input_path) as img:
        # Convert to RGB if necessary (e.g., for PNG images with transparency)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize image if its width exceeds the maximum width
        if img.width > max_width:
            ratio = max_width / float(img.width)
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)
            print(f"Resized image to: {img.size}")
        
        # Save the optimized image as JPEG with desired quality
        img.save(output_path, format="JPEG", quality=quality, optimize=True)
        print(f"Optimized image saved to: {output_path}")

@app.route('/upload', methods=['POST'])
def upload_image():
    # Check if image was provided in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    # Save the uploaded image file to the uploads folder
    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        # Process the image to detect and crop the book cover
        cropped_img = crop_book_cover(filepath)
        
        # Save the cropped image temporarily
        cropped_path = os.path.join(UPLOAD_FOLDER, f"cropped_{filename}")
        cropped_img.save(cropped_path)

        # Optimize the processed image
        optimized_filename = f"{uuid.uuid4()}.jpg"
        optimized_path = os.path.join(PROCESSED_FOLDER, optimized_filename)
        optimize_image(cropped_path, optimized_path, quality=85)

        # Clean up temporary file
        if os.path.exists(cropped_path):
            os.remove(cropped_path)

        # Construct the URL for the processed image
        image_url = f"/processed/{optimized_filename}"
        
        return jsonify({
            "success": True,
            "url": image_url,
            "message": "Book cover detected and processed successfully"
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to process the image"
        }), 500

# Endpoint to serve the processed images
@app.route('/processed/<filename>', methods=['GET'])
def serve_processed_image(filename):
    return send_from_directory(PROCESSED_FOLDER, filename)

# Add a simple HTML interface for testing
@app.route('/', methods=['GET'])
def index():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Book Cover Detector</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .result {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            img {
                max-width: 100%;
                max-height: 500px;
                margin-top: 20px;
                border: 1px solid #ddd;
            }
            .hidden {
                display: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Book Cover Detector</h1>
            <p>Upload an image containing a book cover. The application will detect and isolate the cover.</p>
            
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" name="image" accept="image/*" required>
                <button type="submit">Upload & Process</button>
            </form>
            
            <div id="result" class="result hidden">
                <h3>Processed Book Cover</h3>
                <img id="resultImage" src="">
            </div>
        </div>
        
        <script>
            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('resultImage').src = data.url;
                        document.getElementById('result').classList.remove('hidden');
                    } else {
                        alert('Error: ' + data.message);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while processing the image.');
                }
            });
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(debug=True)