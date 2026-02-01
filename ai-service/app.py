from fastapi import FastAPI, HTTPException
import tensorflow as tf
import numpy as np
from PIL import Image
import json
from pydantic import BaseModel
from typing import List
from tensorflow.keras.applications.efficientnet import preprocess_input
import base64, io, os

from health_logic import generate_advice

app = FastAPI()

# -------------------------
# Globals (lazy loaded)
# -------------------------
model = None
food_info = None

CONFIDENCE_THRESHOLD = 0.5

CLASS_NAMES = [
    "akara", "banga_soup", "egusi_soup", "jollof_rice", "moi_moi",
    "nkwobi", "okpa", "suya", "tuwo", "yam_porridge"
]

# -------------------------
# Loaders
# -------------------------
def load_model_once():
    global model
    if model is None:
        print("Loading model...")
        model = tf.keras.models.load_model("food_vision_model.keras")
        print("Model loaded!")

# Warm-up model (IMPORTANT)
print("Warming up model...")
dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
model.predict(dummy)
print("Model ready!")


def load_food_info_once():
    global food_info
    if food_info is None:
        with open("food_info.json", "r") as f:
            food_info = json.load(f)

# -------------------------
# Schemas
# -------------------------
class ImagePayload(BaseModel):
    image: str
    conditions: List[str]

# -------------------------
# Utils
# -------------------------
def get_risk_level(score):
    if score <= 30:
        return "Low"
    elif score <= 70:
        return "Medium"
    return "High"

def preprocess_image(b64: str):
    image_bytes = base64.b64decode(b64)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    arr = tf.keras.preprocessing.image.img_to_array(image)
    arr = preprocess_input(arr)
    return np.expand_dims(arr, axis=0)

# -------------------------
# Routes
# -------------------------
@app.get("/")
def root():
    return {"status": "AI Service Running"}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/analyze")
def analyze_food(data: ImagePayload):

    try:
        load_model_once()
        load_food_info_once()

        if not data.conditions:
            raise HTTPException(400, "No health conditions provided")

        img = preprocess_image(data.image)

        preds = model.predict(img)[0]

        confidence = float(np.max(preds))
        idx = int(np.argmax(preds))
        food = CLASS_NAMES[idx]

        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "food": "unknown_food",
                "confidence": round(confidence, 3),
                "nutrients": {"calories":0,"carbs":0,"protein":0,"fat":0},
                "advice": "Food not recognized clearly",
                "risk_level": "Unknown",
                "risk_score": 0
            }

        info = food_info.get(food)
        if not info:
            raise HTTPException(500, "Food metadata missing")

        advice, risk_score, flags = generate_advice(info, data.conditions)

        return {
            "food": food,
            "confidence": round(confidence, 3),
            "nutrients": {
                "calories": info["calories"],
                "carbs": info["carbs"],
                "protein": info["protein"],
                "fat": info["fat"]
            },
            "advice": advice,
            "substitute": info.get("substitute"),
            "risk_level": get_risk_level(risk_score),
            "risk_score": risk_score
        }

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(500, f"Analysis failed: {str(e)}")
