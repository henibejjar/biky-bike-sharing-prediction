# 🚴 Bike Sharing Demand Prediction Application

A full-stack AI-powered application for predicting bike sharing demand.

## 📁 Project Structure

```
bike-prediction-app/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py         # API endpoints
│   ├── model/
│   │   └── bike_model.pkl  # Trained ML model (add yours here)
│   ├── notebooks/
│   │   └── Final_notebook.ipynb  # ML experimentation notebook
│   ├── requirements.txt
│   └── Dockerfile
│
├── datasets/               # Data files
│   ├── day.csv            # Daily aggregated data
│   └── hour.csv           # Hourly data
│
├── frontend/               # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── PredictionResult.jsx
│   │   │   └── DailyForecast.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml      # Container orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Your trained model file (`bike_model.pkl`)

### 1. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy your model file
# Place bike_model.pkl in the model/ folder

# Run the API
uvicorn app.main:app --reload --port 8000
```

API will be available at: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🐳 Docker Deployment

```bash
# Build and run both services
docker-compose up --build

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message |
| `/health` | GET | Health check |
| `/predict` | POST | Single prediction |
| `/predict/batch` | POST | Batch predictions |
| `/predict/daily/{season}/{weekday}/{weathersit}` | GET | 24-hour forecast |

### Example Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "season": 3,
    "hour": 17,
    "weekday": 2,
    "workingday": 1,
    "weathersit": 1,
    "temp": 0.5,
    "atemp": 0.5,
    "hum": 0.5,
    "windspeed": 0.2,
    "holiday": 0
  }'
```

## 🎨 Features

### Frontend
- ✅ Modern React + Vite setup
- ✅ Tailwind CSS styling
- ✅ Interactive sliders for parameters
- ✅ Real-time predictions
- ✅ 24-hour forecast charts
- ✅ Responsive design
- ✅ Nginx configuration for production

### Backend
- ✅ FastAPI with automatic docs (Swagger & ReDoc)
- ✅ Model loading & inference
- ✅ CORS configured
- ✅ Input validation (Pydantic)
- ✅ Operational recommendations
- ✅ Batch & daily forecasts

### Data & ML
- ✅ Hourly and daily datasets included
- ✅ Jupyter notebook for experimentation

## 📊 Input Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| `season` | 1-4 | 1=Winter, 2=Spring, 3=Summer, 4=Fall |
| `hour` | 0-23 | Hour of day |
| `weekday` | 0-6 | 0=Sunday, 6=Saturday |
| `workingday` | 0-1 | Is it a working day? |
| `weathersit` | 1-4 | 1=Clear, 2=Mist, 3=Light Rain, 4=Heavy Rain |
| `temp` | 0-1 | Normalized temperature |
| `atemp` | 0-1 | Normalized feeling temperature |
| `hum` | 0-1 | Normalized humidity |
| `windspeed` | 0-1 | Normalized wind speed |
| `holiday` | 0-1 | Is it a holiday? |

## 📂 Datasets

Located in the `datasets/` folder:

| File | Description |
|------|-------------|
| `hour.csv` | Hourly bike sharing data (17,379 records) |
| `day.csv` | Daily aggregated data (731 records) |

**Source**: Capital Bikeshare system (2011-2012)

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000
```

**Backend** (`.env`):
```
MODEL_PATH=./model/bike_model.pkl
```

## 📈 Model Information

- **Algorithm**: XGBoost / Gradient Boosting
- **R² Score**: ~0.65
- **MAE**: ~40 bikes/hour
- **Training Data**: Capital Bikeshare 2011-2012
- **Notebook**: `backend/notebooks/Final_notebook.ipynb`

## 👥 Team

**MindShift Analytics** — Smart Mobility Solutions

## 📄 License

MIT License - Feel free to use and modify!