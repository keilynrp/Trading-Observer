
import requests
import pandas as pd
import os
import time
from datetime import datetime

ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query"
API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "demo") # Use env var

def fetch_daily_data(symbol: str, output_size: str = "full") -> pd.DataFrame:
    """
    Fetches daily time series data for a symbol.
    """
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "outputsize": output_size,
        "apikey": API_KEY,
        "datatype": "json"
    }
    
    response = requests.get(ALPHA_VANTAGE_URL, params=params)
    data = response.json()
    
    if "Time Series (Daily)" not in data:
        raise ValueError(f"Error fetching data for {symbol}: {data.get('Note') or data.get('Error Message')}")
        
    ts_data = data["Time Series (Daily)"]
    
    # Convert to DataFrame
    df = pd.DataFrame.from_dict(ts_data, orient='index')
    df = df.rename(columns={
        "1. open": "open",
        "2. high": "high",
        "3. low": "low",
        "4. close": "close",
        "5. volume": "volume"
    })
    
    # Convert types
    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = df[col].astype(float)
        
    df.index = pd.to_datetime(df.index)
    df = df.sort_index() # Sort by date ascending
    
    return df

if __name__ == "__main__":
    # Test
    try:
        print("Fetching AAPL data...")
        df = fetch_daily_data("AAPL", output_size="compact")
        print(f"Fetched {len(df)} rows.")
        print(df.tail())
    except Exception as e:
        print(f"Failed: {e}")
