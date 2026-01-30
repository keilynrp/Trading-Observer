
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from model import LSTMModel
from data_loader import fetch_daily_data
import os
import joblib

# Hyperparameters
SEQ_LENGTH = 60 # Look back 60 days
HIDDEN_DIM = 50
NUM_LAYERS = 2
OUTPUT_DIM = 1 # Predicting next price (or use classification)
EPOCHS = 20
BATCH_SIZE = 32
LEARNING_RATE = 0.001

def create_sequences(data, seq_length):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        x = data[i:(i+seq_length)]
        y = data[i+seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

def train_model(symbol: str):
    print(f"Starting training for {symbol}...")
    
    # 1. Load Data
    try:
        df = fetch_daily_data(symbol)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return
        
    # Use 'Close' price for prediction
    data = df[['close']].values
    
    # 2. Preprocessing
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    
    # Save scaler for inference reverse transform
    os.makedirs("artifacts", exist_ok=True)
    joblib.dump(scaler, f"artifacts/{symbol}_scaler.pkl")
    
    X, y = create_sequences(data_scaled, SEQ_LENGTH)
    
    # Split Train/Test (80/20)
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Tensor conversion
    X_train = torch.FloatTensor(X_train)
    y_train = torch.FloatTensor(y_train)
    X_test = torch.FloatTensor(X_test)
    y_test = torch.FloatTensor(y_test)
    
    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=BATCH_SIZE, shuffle=True)
    
    # 3. Model Setup
    model = LSTMModel(input_dim=1, hidden_dim=HIDDEN_DIM, num_layers=NUM_LAYERS, output_dim=OUTPUT_DIM)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # 4. Training Loop
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        if (epoch+1) % 5 == 0:
            print(f"Epoch [{epoch+1}/{EPOCHS}], Loss: {total_loss/len(train_loader):.4f}")
            
    # 5. Save Model
    torch.save(model.state_dict(), f"artifacts/{symbol}_model.pth")
    print(f"Training complete. Model saved to artifacts/{symbol}_model.pth")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", type=str, default="AAPL", help="Stock symbol to train")
    args = parser.parse_args()
    
    train_model(args.symbol)
