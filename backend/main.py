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

    # Get the closing prices as a list
    prices = data["Close"].values

    # X = day numbers (0, 1, 2, ...), y = the price on that day
    days = np.arange(len(prices)).reshape(-1, 1)
    y = prices

    # Train the linear regression model on the trend
    model = LinearRegression()
    model.fit(days, y)

    # Predict the price for the next day
    next_day = np.array([[len(prices)]])
    predicted_price = model.predict(next_day)[0]

    # How well does the trend line fit the data? (0 to 1, our "confidence")
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
