from fastapi import FastAPI
import yfinance as yf

app = FastAPI(title="StockSaathi API")


@app.get("/")
def read_root():
    return {"message": "StockSaathi backend is running"}


@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    ticker = yf.Ticker(symbol + ".NS")
    data = ticker.history(period="2d")

    current_price = data["Close"].iloc[-1]
    prev_close = data["Close"].iloc[-2]
    day_high = data["High"].iloc[-1]
    day_low = data["Low"].iloc[-1]

    change = current_price - prev_close
    change_percent = (change / prev_close) * 100

    return {
        "symbol": symbol,
        "price": round(current_price, 2),
        "previous_close": round(prev_close, 2),
        "day_high": round(day_high, 2),
        "day_low": round(day_low, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
    }