from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Stock Investment AI Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_SERVICE_KEY", "")
)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class StockInvestment(BaseModel):
    symbol: str
    quantity: float
    purchase_price: float
    purchase_date: str
    notes: Optional[str] = None

class InvestmentAnalysis(BaseModel):
    symbol: str
    current_price: float
    historical_performance: dict
    ai_insights: str
    risk_assessment: str

@app.get("/")
async def root():
    return {"message": "Stock Investment AI Service is running"}

@app.post("/analyze-investment")
async def analyze_investment(investment: StockInvestment):
    try:
        # Get current stock price (you would integrate with a stock API here)
        # For now, we'll use a mock price
        current_price = 150.0  # Mock price

        # Generate AI insights using OpenAI
        prompt = f"""
        Analyze the following stock investment:
        Symbol: {investment.symbol}
        Quantity: {investment.quantity}
        Purchase Price: ${investment.purchase_price}
        Purchase Date: {investment.purchase_date}
        Current Price: ${current_price}
        
        Provide insights on:
        1. Investment performance
        2. Risk assessment
        3. Market trends
        4. Recommendations
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional stock market analyst."},
                {"role": "user", "content": prompt}
            ]
        )
        
        ai_insights = response.choices[0].message.content

        # Create analysis response
        analysis = InvestmentAnalysis(
            symbol=investment.symbol,
            current_price=current_price,
            historical_performance={
                "daily_change": "+2.5%",
                "weekly_change": "+5.2%",
                "monthly_change": "+8.7%"
            },
            ai_insights=ai_insights,
            risk_assessment="Moderate risk based on market conditions"
        )

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/portfolio-analysis/{user_id}")
async def get_portfolio_analysis(user_id: str):
    try:
        # Fetch user's portfolio from Supabase
        # This is a placeholder - you would implement actual database queries
        portfolio = {
            "total_value": 100000.0,
            "total_gain_loss": 5000.0,
            "holdings": [
                {
                    "symbol": "AAPL",
                    "quantity": 10,
                    "current_value": 15000.0,
                    "gain_loss": 1500.0
                }
            ]
        }

        # Generate AI portfolio insights
        prompt = f"""
        Analyze the following portfolio:
        Total Value: ${portfolio['total_value']}
        Total Gain/Loss: ${portfolio['total_gain_loss']}
        Holdings: {portfolio['holdings']}
        
        Provide insights on:
        1. Portfolio diversification
        2. Risk assessment
        3. Performance analysis
        4. Recommendations
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional portfolio manager."},
                {"role": "user", "content": prompt}
            ]
        )
        
        portfolio_insights = response.choices[0].message.content

        return {
            "portfolio": portfolio,
            "ai_insights": portfolio_insights
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 