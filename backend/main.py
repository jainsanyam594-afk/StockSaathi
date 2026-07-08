from fastapi import FastAPI

app = FastAPI(title="StockSaathi API")


@app.get("/")
def read_root():
    return {"message": "StockSaathi backend is running"}
