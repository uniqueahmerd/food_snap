from fastapi import FastAPI
import tensorflow as tf
import numpy as np
from PIL import Image
import json
from pydantic import BaseModel
from typing import List
from health_logic import generate_advice
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess
import base64
import io

app = FastAPI()

# -------------------------
# Root health check
# -------------------------
@app.get("/")
def read_root():
    return {"message": "Food AI Service running"}

# -------------------------
# Constants
# -------------------------
CONFIDENCE_THRESHOLD = 0.5

# -------------------------
# Load Model
# -------------------------
print("Loading model...")
model = tf.keras.models.load_model("food_vision_model.keras")

# Warm-up model (IMPORTANT)
print("Warming up model...")
dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
model.predict(dummy)
print("Model ready!")

# -------------------------
# Classes
# -------------------------
class_names = [
    "akara",
    "banga_soup",
    "egusi_soup",
    "jollof_rice",
    "moi_moi",
    "nkwobi",
    "okpa",
    "suya",
    "tuwo",
    "yam_porridge"
]

# -------------------------
# Load food metadata
# -------------------------
with open("food_info.json", "r") as f:
    food_info = json.load(f)

# -------------------------
# Helpers
# -------------------------
def get_risk_level(score):
    if score <= 30:
        return "🟢 Low Risk"
    elif score <= 70:
        return "🟡 Medium Risk"
    else:
        return "🔴 High Risk"

# -------------------------
# Request schema
# -------------------------
class ImagePayload(BaseModel):
    image: str
    conditions: List[str]

# -------------------------
# Image preprocessing
# -------------------------
def preprocess_image(b64: str):
    # Remove data:image/... prefix if present
    if "," in b64:
        b64 = b64.split(",")[1]

    image_bytes = base64.b64decode(b64)
    image = Image.open(io.BytesIO(image_bytes))

    image = image.convert("RGB")
    image = image.resize((224, 224))

    img = tf.keras.preprocessing.image.img_to_array(image)
    img = efficientnet_preprocess(img)
    img = np.expand_dims(img, axis=0)

    return img

# -------------------------
# Analyze Endpoint
# -------------------------
@app.post("/analyze")
def analyze_food(data: ImagePayload):
    try:
        if not data.conditions:
            return {"error": "Please select at least one health condition"}

        img_array = preprocess_image(data.image)

        preds = model.predict(img_array)[0]

        confidence = float(np.max(preds))
        class_index = int(np.argmax(preds))
        predicted_class = class_names[class_index]

        # Low confidence
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "food": "unknown_food",
                "confidence": round(confidence, 3),
                "nutrients": {
                    "calories": 0,
                    "carbs": 0,
                    "protein": 0,
                    "fat": 0
                },
                "result": "Food not recognized with high confidence"
            }

        info = food_info.get(predicted_class)
        if not info:
            return {"error": f"{predicted_class} not found in database"}

        substitute = info.get("substitute")
        advice, risk_score, flags = generate_advice(info, data.conditions)
        risk_level = get_risk_level(risk_score)

        nutrients = {
            "calories": info["calories"],
            "carbs": info["carbs"],
            "protein": info["protein"],
            "fat": info["fat"]
        }

        return {
            "food": predicted_class,
            "confidence": round(confidence, 3),
            "nutrients": nutrients,
            "advice": advice,
            "substitute": substitute,
            "risk_level": risk_level,
            "risk_score": risk_score
        }

    except Exception as e:
        print("ANALYZE ERROR:", str(e))
        return {
            "error": "Food analysis failed",
            "details": str(e)
        }
