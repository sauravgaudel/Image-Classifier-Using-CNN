from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np
from PIL import Image
import io
from pathlib import Path


app = FastAPI(
    title="Cat vs Dog Image Classification API",
    description="API for classifying images as Cat or Dog using Keras",
    version="1.0.0"
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "model" / "cats_dogs_model.keras"

print("Looking for model at:", MODEL_PATH)
print("Model exists:", MODEL_PATH.exists())

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")



IMG_SIZE = (256, 256)



@app.get("/")
def root():
    return {
        "message": "Image Classification API is running"
    }



@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Check file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    try:

        # Read uploaded file
        contents = await file.read()

        # Open image
        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        # Resize to model input size
        image = image.resize(IMG_SIZE)

        # Convert image to NumPy array
        image_array = np.array(image)

        # Normalize pixel values
        image_array = image_array.astype(np.float32) / 255.0

        # Add batch dimension
        # Shape becomes: (1, 256, 256, 3)
        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # Make prediction
        predictions = model.predict(
            image_array,
            verbose=0
        )

        # Single sigmoid output
        probability = float(predictions[0][0])

        # Assuming:
        # 0 = Cat
        # 1 = Dog
        if probability >= 0.5:
            predicted_class = "Dog"
            confidence = probability
        else:
            predicted_class = "Cat"
            confidence = 1 - probability

        # Return result
        return {
            "success": True,
            "filename": file.filename,
            "class": predicted_class,
            "confidence": confidence,
            "confidence_percentage": round(
                confidence * 100,
                2
            )
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )