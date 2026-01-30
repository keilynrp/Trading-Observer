
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import os

app = FastAPI(title="Trading Observer ML Service")

class PredictionRequest(BaseModel):
    symbol: str

class PredictionResponse(BaseModel):
    symbol: str
    prediction: str
    confidence: float

@app.get("/")
def read_root():
    return {"status": "online", "service": "ml-service"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Placeholder for LSTM inference
    # In the future, this will load the model and run inference
    
    # Mock logic for initial connectivity test
    confidence = random.uniform(0, 100)
    if confidence > 60:
        pred = "BUY"
    elif confidence < 40:
        pred = "SELL"
    else:
        pred = "HOLD"
        
    return {
        "symbol": request.symbol,
        "prediction": pred,
        "confidence": round(confidence, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
