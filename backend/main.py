from fastapi import FastAPI, HTTPException
import yfinance as yf

app = FastAPI(title="StockSaathi API")


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