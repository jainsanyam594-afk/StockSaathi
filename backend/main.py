from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title="StockSaathi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "StockSaathi backend is running"}


@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    ticker = yf.Ticker(symbol + ".NS")
    data = ticker.history(period="2d")

    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock '{symbol}' not found")

    current_price = data["Close"].iloc[-1]
    prev_close = data["Close"].iloc[-2] if len(data) > 1 else current_price
    day_high = data["High"].iloc[-1]
    day_low = data["Low"].iloc[-1]

    change = current_price - prev_close
    change_percent = (change / prev_close) * 100 if prev_close != 0 else 0

    return {
        "symbol": symbol.upper(),
        "price": round(current_price, 2),
        "previous_close": round(prev_close, 2),
        "day_high": round(day_high, 2),
        "day_low": round(day_low, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
    }


@app.get("/history/{symbol}")
def get_history(symbol: str, period: str = "1mo"):
    ticker = yf.Ticker(symbol + ".NS")
    data = ticker.history(period=period)

    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock '{symbol}' not found")

    history = []
    for date, row in data.iterrows():
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        })

    return {
        "symbol": symbol.upper(),
        "period": period,
        "candles": history,
    }


@app.get("/predict/{symbol}")
def predict_stock(symbol: str):
    ticker = yf.Ticker(symbol + ".NS")
    data = ticker.history(period="3mo")

    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock '{symbol}' not found")

    prices = data["Close"].values

    days = np.arange(len(prices)).reshape(-1, 1)
    y = prices

    model = LinearRegression()
    model.fit(days, y)

    next_day = np.array([[len(prices)]])
    predicted_price = model.predict(next_day)[0]

    confidence = model.score(days, y)

    current_price = prices[-1]
    change = predicted_price - current_price
    change_percent = (change / current_price) * 100

    return {
        "symbol": symbol.upper(),
        "current_price": round(float(current_price), 2),
        "predicted_price": round(float(predicted_price), 2),
        "change": round(float(change), 2),
        "change_percent": round(float(change_percent), 2),
        "confidence": round(float(confidence) * 100, 1),
        "direction": "up" if change >= 0 else "down",
    }


@app.get("/plan")
def generate_plan(income: str, risk: str, goal: str = "wealth", interest: str = "tech"):
    income_map = {
        "under_25k": 20000,
        "25k_50k": 37500,
        "50k_1L": 75000,
        "above_1L": 125000,
    }
    monthly_income = income_map.get(income, 37500)

    risk_profiles = {
        "very_low": {"invest_pct": 0.10, "label": "Very Conservative",
                     "alloc": {"Index funds": 55, "Mutual funds (SIP)": 30, "Large-cap stocks": 10, "Your interest sector": 5}},
        "low": {"invest_pct": 0.15, "label": "Conservative",
                "alloc": {"Index funds": 45, "Mutual funds (SIP)": 30, "Large-cap stocks": 15, "Your interest sector": 10}},
        "medium": {"invest_pct": 0.20, "label": "Balanced",
                   "alloc": {"Index funds": 35, "Mutual funds (SIP)": 30, "Large-cap stocks": 20, "Your interest sector": 15}},
        "high": {"invest_pct": 0.25, "label": "Growth-focused",
                 "alloc": {"Index funds": 25, "Mutual funds (SIP)": 25, "Large-cap stocks": 30, "Your interest sector": 20}},
    }
    profile = risk_profiles.get(risk, risk_profiles["low"])

    invest_amount = round(monthly_income * profile["invest_pct"])

    allocation = []
    for name, percent in profile["alloc"].items():
        allocation.append({
            "name": name,
            "percent": percent,
            "amount": round(invest_amount * percent / 100),
        })

    return {
        "monthly_income": monthly_income,
        "risk_label": profile["label"],
        "invest_amount": invest_amount,
        "invest_percent": round(profile["invest_pct"] * 100),
        "goal": goal,
        "interest": interest,
        "allocation": allocation,
    }