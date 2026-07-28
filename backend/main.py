from fastapi import FastAPI
import yfinance as yf

app = FastAPI(title="StockSaathi API")


@app.get("/")
def read_root():
    return {"message": "StockSaathi backend is running"}


@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    ticker = yf.Ticker(symbol + ".NS")
    data = ticker.history(period="1d")
    price = data["Close"].iloc[-1]
    return {"symbol": symbol, "price": round(price, 2)}
