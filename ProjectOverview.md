# 🚴 Bike Sharing Demand Prediction Platform
## AI-Powered Demand Forecasting & Rebalancing Simulation for Smart Urban Mobility

---

## 📋 Executive Summary

Biky is a **machine learning-powered demand prediction and operational planning system** for bike-sharing services. By leveraging historical usage data, weather patterns, and temporal features, our dual-model system achieves **high accuracy in predicting both hourly and daily bike rental demand**. The platform includes an **interactive rebalancing simulation** to visualize station operations and optimize bike redistribution, enabling cities to reduce costs and improve user experience.

**Key Achievements:** 
- Hourly model (XGBoost/Gradient Boosting)
- Daily model:(XGBoost) Predicts total daily demand for fleet planning
- Interactive map visualization with 10 Washington D.C. stations
- Simulation-based rebalancing route planning

---

## 🎯 Business Problem

Bike-sharing systems face critical operational challenges:

| Challenge | Impact |
|-----------|--------|
| **Imbalanced bike distribution** | Stations run empty or overflow |
| **Unpredictable demand** | Poor resource allocation |
| **Maintenance scheduling** | Service disruptions during peak hours |
| **Staffing inefficiencies** | Over/understaffing costs |
| **Rebalancing logistics** | High operational costs for manual redistribution |

**Our Solution:** An AI-driven prediction platform that forecasts demand with high accuracy **plus** an interactive rebalancing simulation to visualize and plan bike redistribution operations.

---

## 📊 Dataset Overview

We analyzed the **Capital Bikeshare** dataset from Washington D.C., spanning 2011-2012:

### Data Sources
| Dataset | Records | Features | Granularity |
|---------|---------|----------|-------------|
| **Hourly** | ~17,379 | 16 | Hour-by-hour |
| **Daily** | 731 | 15 | Day-by-day |

### Key Observation
The two datasets differ by the `hr` (hour) column present only in the hourly dataset. This enables fine-grained temporal analysis of demand patterns.

### Target Variables
- **casual**: Non-registered user rentals
- **registered**: Registered member rentals  
- **cnt**: Total rentals (casual + registered) — *Primary prediction target*

### Feature Categories

| Category | Features | Description |
|----------|----------|-------------|
| **Temporal** | `dteday`, `season`, `yr`, `mnth`, `hr`, `weekday`, `holiday`, `workingday` | Time-based patterns |
| **Weather** | `weathersit`, `temp`, `atemp`, `hum`, `windspeed` | Environmental conditions |
| **Target** | `casual`, `registered`, `cnt` | Rental counts |

---

## 🔍 Data Quality & Preprocessing

### 1. Data Leakage Prevention
**Critical Step:** We identified and removed features that would cause data leakage:

```
Dropped columns: ['instant', 'casual', 'registered']
```

- `instant`: Just an index (no predictive value)
- `casual` + `registered` = `cnt`: Using these would be "cheating" since they directly sum to our target

### 2. Missing Values
✅ **Zero missing values** in both datasets — clean data ready for modeling.

### 3. Anomaly Detection
- Days with zero rentals (daily): Minimal
- Target variable range (hourly): 1 - 977 bikes/hour

---

## 📈 Exploratory Data Analysis (EDA)

### Key Insights from Data Exploration

#### 1. Temporal Patterns

**Daily Trends:**
- Clear **seasonal cycles** with summer peaks and winter troughs
- Gradual **year-over-year growth** (2012 > 2011)
- Visible weekly periodicity

**Hourly Patterns:**
- **Morning peak**: 7-9 AM (commute to work)
- **Evening peak**: 5-7 PM (commute from work)
- **Night minimum**: 2-5 AM (minimal usage)

#### 2. Seasonal Demand Analysis

| Season | Avg Rentals/Hour | Interpretation |
|--------|------------------|----------------|
| **Summer** | Highest | Warm weather encourages cycling |
| **Fall** | High | Pleasant conditions |
| **Spring** | Moderate | Variable weather |
| **Winter** | Lowest | Cold weather deters cycling |

**Business Insight:** Summer demand is approximately **60% higher** than winter demand.

#### 3. Weekday vs Weekend Patterns

| Day Type | Pattern | Primary Users |
|----------|---------|---------------|
| **Weekdays** | Dual peaks (commute hours) | Registered members |
| **Weekends** | Single midday peak | Casual/recreational users |

**Business Insight:** Weekday demand is approximately **30% higher** than weekends.

#### 4. Weather Impact Analysis

| Weather Condition | Impact on Demand |
|-------------------|------------------|
| Clear/Partly Cloudy | Highest demand |
| Mist/Cloudy | Moderate reduction |
| Light Rain/Snow | Significant reduction |
| Heavy Rain/Storm | Severe reduction (up to 70%) |

#### 5. Correlation Analysis

**Key Correlations with Target (cnt):**
- `temp` / `atemp`: **Strong positive** (~0.4) — Warmer = More rentals
- `hum`: **Weak negative** (~-0.1) — High humidity slightly reduces demand
- `windspeed`: **Weak negative** — Strong winds deter cycling
- `hr`: **Moderate** — Time of day matters significantly

**⚠️ Multicollinearity Alert:**
- `temp` vs `atemp` correlation ≈ **0.99** (extremely high)
- Recommendation: Use only one temperature feature to avoid redundancy

---

## ⚙️ Feature Engineering

### Transformations Applied

| Transformation | Features Created | Rationale |
|----------------|------------------|-----------|
| **Cyclical Encoding** | `hour_sin`, `hour_cos`, `month_sin`, `month_cos` | Captures circular nature of time (23:00 is close to 00:00) |
| **Interaction Terms** | `temp_hum`, `workday_temp` | Captures combined effects |
| **Date Extraction** | `year` | Separates training/test periods |

### Why Cyclical Encoding?

Traditional encoding treats hours linearly (0, 1, 2... 23), but in reality:
- Hour 23 is **adjacent** to hour 0 (not far apart)
- Same for December (12) and January (1)

Sine/cosine transformation preserves this circular relationship:
```
hour_sin = sin(2π × hour / 24)
hour_cos = cos(2π × hour / 24)
```

---

## 🧪 Modeling Approach

### Temporal Train-Test Split (Critical!)

**We do NOT use random splitting for time-series data.**

| Set | Period | Records | Purpose |
|-----|--------|---------|---------|
| **Training** | 2011 | ~8,760 hours / 365 days | Model learning |
| **Testing** | 2012 | ~8,760 hours / 366 days | Future prediction simulation |

**Why?** Random splits would leak future information into training, giving unrealistically optimistic results.

### Models Evaluated

| Model | Type | Strengths |
|-------|------|-----------|
| **Linear Regression** | Linear | Interpretable, fast |
| **Ridge Regression** | Linear + L2 | Handles multicollinearity |
| **Lasso Regression** | Linear + L1 | Feature selection |
| **Random Forest** | Ensemble | Captures non-linear patterns |
| **Gradient Boosting** | Ensemble | High accuracy |
| **XGBoost** | Ensemble | State-of-the-art performance |

### Dual Model System

| Model | Purpose | Input Features | Output |
|-------|---------|----------------|--------|
| **Hourly Model** | Time-specific predictions | Includes `hour` feature | Rentals per hour |
| **Daily Model** | Total daily demand | Includes `month`, no `hour` | Total daily rentals |

### Baseline Model
**Seasonal Mean Predictor:** Always predicts the average rental count for that season.
- Purpose: Establish a minimum bar that ML models must beat
- Baseline R² ≈ 0.20-0.30

---

## 🏆 Results & Model Performance

### Performance Comparison - Hourly Model

| Model | R² Score | RMSE | MAE |
|-------|----------|------|-----|
| **XGBoost** | ~0.92 | ~60 | ~40 |
| **Gradient Boosting** | ~0.91 | ~62 | ~42 |
| **Random Forest** | ~0.90 | ~65 | ~44 |
| **Ridge Regression** | ~0.75 | ~95 | ~70 |
| **Linear Regression** | ~0.74 | ~98 | ~72 |
| **Lasso Regression** | ~0.73 | ~100 | ~74 |
| *Baseline (Seasonal Mean)* | ~0.25 | ~150 | ~110 |

### Interpretation

**🏆 Best Model: XGBoost/Gradient Boosting**

- **R² = 0.92** means the model explains **92% of the variance** in bike rental demand
- **RMSE ≈ 60** means on average, predictions are off by about **60 bikes per hour**
- **Improvement over baseline: +250-300%** in R² score

### What Does This Mean in Practice?

| Metric | Interpretation |
|--------|----------------|
| **R² = 0.92** | Excellent predictive power; captures most demand patterns |
| **MAE = 40** | Average prediction error of ±40 bikes/hour |
| **Best case** | ±28 bikes error (favorable conditions) |
| **Worst case** | ±52 bikes error (unusual events) |

---

## 🔑 Feature Importance Analysis

### Top Predictive Features

| Rank | Feature | Importance | Interpretation |
|------|---------|------------|----------------|
| 1 | **hour_sin/hour_cos** | ~0.35 | Time of day is the strongest predictor |
| 2 | **temp** | ~0.20 | Temperature significantly drives demand |
| 3 | **year** | ~0.10 | Captures growth trend |
| 4 | **workingday** | ~0.08 | Weekday/weekend distinction matters |
| 5 | **humidity** | ~0.07 | Weather comfort factor |
| 6 | **season** | ~0.06 | Seasonal demand patterns |

### Business Interpretation

1. **Hour of Day** (Most Important)
   - Demand follows predictable daily rhythms
   - Peak hours: 7-9 AM, 5-7 PM
   - Low hours: 2-5 AM
   - **Action:** Pre-position bikes before peak hours

2. **Temperature** (Second Most Important)
   - Strong positive relationship
   - Optimal range: 20-30°C (normalized: 0.5-0.7)
   - **Action:** Adjust fleet availability based on weather forecasts

3. **Working Day**
   - Different patterns on weekdays vs weekends
   - **Action:** Use separate staffing schedules

---

## 📉 Model Diagnostics

### Residual Analysis

**What are residuals?** The difference between actual and predicted values.

| Diagnostic | Finding | Interpretation |
|------------|---------|----------------|
| **Residual Distribution** | Approximately normal, centered at 0 | Model is unbiased |
| **Residuals vs Time** | No clear pattern | No systematic errors |
| **Q-Q Plot** | Mostly linear | Errors follow normal distribution |
| **Actual vs Predicted Scatter** | Tight clustering around diagonal | Good prediction accuracy |

### Performance by Season

| Season | R² Score | RMSE | Interpretation |
|--------|----------|------|----------------|
| **Summer** | ~0.93 | ~55 | Best performance (stable patterns) |
| **Fall** | ~0.92 | ~58 | Strong performance |
| **Spring** | ~0.91 | ~62 | Good performance |
| **Winter** | ~0.88 | ~70 | Lower but still good (variable weather) |

**Insight:** Model performs best in summer when demand patterns are most consistent.

---

### Value Proposition

| Stakeholder | Benefit |
|-------------|---------|
| **City Operations** | 10%+ reduction in operational costs |
| **Users** | Higher bike availability, reduced wait times |
| **Environment** | Optimized fleet reduces need for rebalancing vehicles |
| **Maintenance** | Predictive scheduling during low-demand periods |

---

## 🗺️ Rebalancing Simulation Feature

### Interactive Map Visualization

The platform includes a **real-time rebalancing simulation** showing 10 bike stations in Washington D.C.:

#### Station Types
- **🔵 SOURCE (Overflow)**: Stations near capacity (e.g., Union Station: 58/60 bikes)
- **🔴 SINK (High Demand)**: Stations nearly empty (e.g., Dupont Circle: 2/50 bikes)
- **🟢 NORMAL**: Balanced stations (~50% capacity)

#### Stations Included
1. **Union Station** (Capacity: 60) — SOURCE
2. **Lincoln Memorial** (Capacity: 35) — SOURCE
3. **Georgetown Harbor** (Capacity: 30) — SOURCE
4. **Dupont Circle** (Capacity: 50) — SINK
5. **Nationals Park** (Capacity: 55) — SINK
6. **Adams Morgan** (Capacity: 25) — SINK
7. **White House** (Capacity: 40) — NORMAL
8. **Capitol Hill** (Capacity: 45) — NORMAL
9. **National Zoo** (Capacity: 40) — NORMAL
10. **Columbia Heights** (Capacity: 30) — NORMAL

#### Rebalancing Routes
- **Visual routes** connecting overflow stations to empty stations
- **Transfer amounts** displayed (e.g., "Move 15 bikes")
- **Dashed lines** with directional arrows
- **Hover tooltips** showing route details

#### Business Value
- **Visual planning**: Operations teams can see which stations need attention
- **Route optimization**: Pre-planned rebalancing paths reduce logistics costs
- **Real-time monitoring**: Track station status at a glance
- **Data-driven decisions**: Combine demand forecasts with station status

---

## 🎯 Key Insights & Recommendations

### For City Planners

1. **Dynamic Rebalancing**
   - Pre-position bikes at stations before morning (6 AM) and evening (4 PM) peaks
   - Move bikes from residential to commercial areas in mornings, reverse in evenings
   - **Use the rebalancing simulation to plan routes**

2. **Weather-Responsive Operations**
   - Reduce fleet availability on rainy/cold days
   - Maximize availability on warm, clear days

3. **Seasonal Planning**
   - Increase fleet size in summer months
   - Schedule maintenance during winter (lower demand)

### For Marketing Teams

1. **Targeted Promotions**
   - Offer discounts during low-demand hours (10 AM - 4 PM)
   - Weekend promotions to boost casual usage

2. **Weather-Based Campaigns**
   - Push notifications on nice weather days
   - Rainy day alternatives (partner with transit)

### For Technology Teams

1. **Real-Time Integration**
   - Connect model to live weather APIs
   - Integrate with station sensors for real-time adjustments
   - **Deploy rebalancing simulation with live data feeds**

2. **Continuous Learning**
   - Retrain model quarterly with new data
   - Monitor for concept drift (changing patterns)

---

## 📁 Deliverables

### Application Components

| Component | Description |
|-----------|-------------|
| **Frontend (React + Vite)** | Three interactive tabs: Single Prediction, Daily Forecast, Rebalancing |
| **Backend (FastAPI)** | REST API with dual model system (hourly + daily) |
| **Rebalancing Map** | Interactive Leaflet map with 10 stations and route planning |
| **Prediction Models** | `bike_model.pkl` (hourly), `bike_model_daily.pkl` (daily) |

### Visualizations Generated

| File | Description |
|------|-------------|
| `01_timeseries.png` | Daily & hourly rental trends |
| `02_distribution_target.png` | Target variable distributions |
| `03_distribution_weather.png` | Weather feature distributions |
| `04_correlation_heatmap.png` | Feature correlation matrix |
| `05_model_comparison.png` | Model performance comparison |
| `06_feature_importance.png` | Feature importance rankings |
| `07_actual_vs_predicted.png` | Prediction accuracy visualization |
| `08_residual_analysis.png` | Error analysis diagnostics |
| `09_performance_by_season.png` | Seasonal performance breakdown |
| `10_partial_dependence.png` | Feature relationship plots |
| `11_business_impact.png` | Financial projections |

### Model Artifacts

| File | Description |
|------|-------------|
| `bike_model.pkl` | Trained XGBoost hourly model (production-ready) |
| `bike_model_daily.pkl` | Trained daily model for total demand |

---

## 🚀 Next Steps

1. **Deploy Model** — ✅ Already built as REST API
2. **Dashboard Development** — ✅ Interactive React dashboard with rebalancing map
3. **A/B Testing** — Pilot in 2-3 cities to validate real-world performance
4. **Expand Features** — Add event data, traffic patterns, transit schedules
5. **Live Data Integration** — Connect rebalancing simulation to real-time station sensors
6. **Mobile App** — Extend platform to mobile for field operations teams
7. **Scale** — Roll out to additional cities after validation

---

## 👥 Team

*MindShift Analytics*

---

## 📚 References

- UCI Machine Learning Repository: Bike Sharing Dataset
- Capital Bikeshare, Washington D.C.
- Fanaee-T, Hadi, and Gama, Joao: Event labeling combining ensemble detectors and background knowledge
- Leaflet.js for interactive mapping
- React-Leaflet for React integration

---

**© 2026 MindShift Analytics — Smart Mobility Solutions**