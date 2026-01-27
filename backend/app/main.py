"""
Bike Sharing Demand Prediction API
FastAPI backend for serving ML predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import numpy as np
import joblib
import os
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="Bike Sharing Demand Prediction API",
    description="AI-powered demand forecasting for smart urban mobility",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
HOURLY_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "bike_model.pkl")
DAILY_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "bike_model_daily.pkl")

models = {"Hourly": None, "daily": None}

def load_models():
    # Load Hourly Model
    try:
        if os.path.exists(HOURLY_MODEL_PATH):
            models["Hourly"] = joblib.load(HOURLY_MODEL_PATH)
            print(f"✓ Hourly Model loaded: {HOURLY_MODEL_PATH}")
    except Exception as e:
        print(f"⚠ Error loading Hourly Model: {e}")

    # Load Daily Model
    try:
        if os.path.exists(DAILY_MODEL_PATH):
            models["daily"] = joblib.load(DAILY_MODEL_PATH)
            print(f"✓ Daily Model loaded: {DAILY_MODEL_PATH}")
    except Exception as e:
        print(f"⚠ Error loading Daily Model: {e}")

@app.on_event("startup")
async def startup_event():
    load_models()

# Request/Response Models
class PredictionRequest(BaseModel):
    """Input features for bike demand prediction"""
    season: int = Field(..., ge=1, le=4, description="Season (1=Winter, 2=Spring, 3=Summer, 4=Fall)")
    year: int = Field(default=2024, description="Year (for trend adjustment)")
    holiday: int = Field(default=0, ge=0, le=1, description="Holiday (0=No, 1=Yes)")
    weekday: int = Field(..., ge=0, le=6, description="Day of week (0=Sunday, 6=Saturday)")
    workingday: int = Field(..., ge=0, le=1, description="Working day (0=No, 1=Yes)")
    weathersit: int = Field(..., ge=1, le=4, description="Weather (1=Clear, 2=Mist, 3=Light Rain, 4=Heavy Rain)")
    temp: float = Field(..., ge=0, le=1, description="Normalized temperature (0-1)")
    atemp: float = Field(..., ge=0, le=1, description="Normalized feeling temperature (0-1)")
    hum: float = Field(..., ge=0, le=1, description="Normalized humidity (0-1)")
    windspeed: float = Field(..., ge=0, le=1, description="Normalized wind speed (0-1)")
    hour: int = Field(..., ge=0, le=23, description="Hour of day (0-23)")

    class Config:
        json_schema_extra = {
            "example": {
                "season": 3,
                "year": 2024,
                "holiday": 0,
                "weekday": 2,
                "workingday": 1,
                "weathersit": 1,
                "temp": 0.5,
                "atemp": 0.5,
                "hum": 0.5,
                "windspeed": 0.2,
                "hour": 17
            }
        }

class PredictionResponse(BaseModel):
    """Prediction result"""
    predicted_rentals: int
    confidence_low: int
    confidence_high: int
    demand_level: str
    recommendations: list[str]
    input_summary: dict

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    timestamp: str

# Helper functions
def get_cyclical_features(hour: int, month: int = 6):
    """Convert hour and month to cyclical sin/cos features"""
    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)
    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)
    return hour_sin, hour_cos, month_sin, month_cos

def get_demand_level(rentals: int) -> str:
    """Categorize demand level"""
    if rentals < 50:
        return "Very Low"
    elif rentals < 150:
        return "Low"
    elif rentals < 300:
        return "Moderate"
    elif rentals < 500:
        return "High"
    else:
        return "Very High"

def get_recommendations(rentals: int, hour: int, weathersit: int) -> list[str]:
    """Generate operational recommendations based on prediction"""
    recommendations = []
    
    demand_level = get_demand_level(rentals)
    
    if demand_level in ["High", "Very High"]:
        recommendations.append("🚴 Increase bike availability at popular stations")
        recommendations.append("👥 Consider additional rebalancing staff")
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            recommendations.append("⏰ Peak commute hours - maximize station capacity")
    
    if demand_level in ["Very Low", "Low"]:
        recommendations.append("🔧 Good time for maintenance activities")
        recommendations.append("📊 Consider promotional campaigns")
    
    if weathersit >= 3:
        recommendations.append("🌧️ Bad weather expected - reduce fleet exposure")
        recommendations.append("📱 Send weather alerts to users")
    
    if not recommendations:
        recommendations.append("✅ Normal operations - standard staffing recommended")
    
    return recommendations

def prepare_features(request: PredictionRequest) -> np.ndarray:
    """Prepare feature array for model prediction"""
    # Get cyclical features
    hour_sin, hour_cos, month_sin, month_cos = get_cyclical_features(request.hour)
    
    # Interaction terms
    temp_hum = request.temp * request.hum
    workday_temp = request.workingday * request.temp
    
    # Feature array (must match training features order)
    # ['season', 'yr', 'holiday', 'weekday', 'workingday', 'weathersit', 
    #  'temp', 'atemp', 'hum', 'windspeed', 'hour_sin', 'hour_cos', 
    #  'month_sin', 'month_cos', 'temp_hum', 'workday_temp']
    features = np.array([[
        request.season,
        1 if request.year >= 2012 else 0,  # yr feature (0 or 1)
        request.holiday,
        request.weekday,
        request.workingday,
        request.weathersit,
        request.temp,
        request.atemp,
        request.hum,
        request.windspeed,
        hour_sin,
        hour_cos,
        month_sin,
        month_cos,
        temp_hum,
        workday_temp
    ]])
    
    return features

class DailyPredictionRequest(BaseModel):
    """Input features for Daily Prediction (No Hour, Needs Month)"""
    season: int = Field(..., ge=1, le=4)
    year: int = Field(default=2024)
    month: int = Field(..., ge=1, le=12)  # Required for daily model
    holiday: int = Field(default=0)
    weekday: int = Field(..., ge=0, le=6)
    workingday: int = Field(..., ge=0, le=1)
    weathersit: int = Field(..., ge=1, le=3)
    temp: float = Field(..., ge=0, le=1)
    atemp: float = Field(..., ge=0, le=1)
    hum: float = Field(..., ge=0, le=1)
    windspeed: float = Field(..., ge=0, le=1)

def prepare_daily_features(req: DailyPredictionRequest):
    """Prepares features specifically for the Daily Model"""
    # 1. Cyclical Features for Month
    mnth_sin = np.sin(2 * np.pi * req.month / 12)
    mnth_cos = np.cos(2 * np.pi * req.month / 12)
    
    # 2. Interactions
    temp_hum = req.temp * req.hum
    workday_temp = req.workingday * req.temp
    
    # 3. Create Array (Order must match daily training columns)
    return np.array([[
        req.season, 
        1 if req.year >= 2012 else 0, 
        req.month, 
        req.holiday,
        req.weekday, 
        req.workingday, 
        req.weathersit, 
        req.temp, 
        req.atemp, 
        req.hum, 
        req.windspeed, 
        mnth_sin, 
        mnth_cos, 
        temp_hum, 
        workday_temp
    ]])
# API Endpoints
@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint"""
    return {
        "message": "🚴 Bike Sharing Demand Prediction API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health status"""
    return HealthResponse(
        status="healthy",
        model_loaded=models["Hourly"] is not None,
        timestamp=datetime.now().isoformat()
    )

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_demand(request: PredictionRequest):
    """
    Predict bike rental demand based on input features.
    
    Returns predicted number of rentals, confidence interval, 
    demand level, and operational recommendations.
    """
    try:
        # Prepare features
        features = prepare_features(request)
        
        # Make prediction
        if models["Hourly"] is not None:
            prediction = models["Hourly"].predict(features)[0]
        else:
            # Mock prediction if model not loaded
            base = 100 + (request.temp * 200) + (request.season * 30)
            if request.workingday and (7 <= request.hour <= 9 or 17 <= request.hour <= 19):
                base *= 1.5
            if request.weathersit >= 3:
                base *= 0.5
            prediction = base
        
        # Ensure non-negative prediction
        predicted_rentals = max(0, int(round(prediction)))
        
        # Calculate confidence interval (±20% as approximation)
        margin = max(10, int(predicted_rentals * 0.2))
        confidence_low = max(0, predicted_rentals - margin)
        confidence_high = predicted_rentals + margin
        
        # Get demand level and recommendations
        demand_level = get_demand_level(predicted_rentals)
        recommendations = get_recommendations(predicted_rentals, request.hour, request.weathersit)
        
        # Input summary
        season_map = {1: "Winter", 2: "Spring", 3: "Summer", 4: "Fall"}
        weather_map = {1: "Clear", 2: "Mist/Cloudy", 3: "Light Rain/Snow", 4: "Heavy Rain/Storm"}
        weekday_map = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"}
        
        input_summary = {
            "season": season_map.get(request.season, "Unknown"),
            "hour": f"{request.hour:02d}:00",
            "weather": weather_map.get(request.weathersit, "Unknown"),
            "temperature": f"{request.temp * 41:.1f}°C",  # Denormalize (max ~41°C)
            "humidity": f"{request.hum * 100:.0f}%",
            "day_type": "Working Day" if request.workingday else "Weekend/Holiday",
            "weekday": weekday_map.get(request.weekday, "Unknown")
        }
        
        return PredictionResponse(
            predicted_rentals=predicted_rentals,
            confidence_low=confidence_low,
            confidence_high=confidence_high,
            demand_level=demand_level,
            recommendations=recommendations,
            input_summary=input_summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/batch", tags=["Prediction"])
async def predict_batch(requests: list[PredictionRequest]):
    """
    Batch prediction for multiple time slots.
    Useful for generating daily forecasts.
    """
    results = []
    for req in requests:
        result = await predict_demand(req)
        results.append(result)
    return {"predictions": results, "count": len(results)}
@app.get("/predict/daily/{season}/{weekday}/{weathersit}", tags=["Prediction"])
async def predict_daily_pattern(
    season: int,
    weekday: int,
    weathersit: int,
    temp: float = 0.5,
    hum: float = 0.5,
    month: int = 6
):
    """
    Generate hourly predictions for a full day (GET).
    Returns 24-hour demand forecast.
    """
    predictions = []
    workingday = 1 if weekday not in (0, 6) else 0

    for hour in range(24):
        req = PredictionRequest(
            season=season,
            year=2024,
            holiday=0,
            weekday=weekday,
            workingday=workingday,
            weathersit=weathersit,
            temp=temp,
            atemp=temp,
            hum=hum,
            windspeed=0.2,
            hour=hour
        )
        result = await predict_demand(req)
        predictions.append({
            "hour": hour,
            "predicted_rentals": result.predicted_rentals,
            "demand_level": result.demand_level
        })

    total_daily = sum(p["predicted_rentals"] for p in predictions)
    peak = max(predictions, key=lambda x: x["predicted_rentals"])

    return {
        "predictions": predictions,
        "summary": {
            "total_daily_rentals": total_daily,
            "average_hourly": round(total_daily / 24),
            "peak_hour": peak["hour"],
            "peak_rentals": peak["predicted_rentals"],
            "month": month
        }
    }
@app.post("/predict/daily", tags=["Prediction"])
async def predict_daily_demand(request: DailyPredictionRequest):
    """
    Predicts TOTAL DAILY demand using the specialized Daily Model.
    """
    if not models["daily"]:
        raise HTTPException(status_code=503, detail="Daily model not available")

    try:
        features = prepare_daily_features(request)
        prediction = models["daily"].predict(features)[0]
        
        # Ensure positive integer
        predicted_rentals = max(0, int(round(prediction)))
        
        return {
            "predicted_rentals": predicted_rentals,
            "demand_level": "High" if predicted_rentals > 4000 else "Low",
            "model_used": "bike_model_daily.pkl"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
