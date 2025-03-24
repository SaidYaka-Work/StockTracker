const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

export interface StockData {
  symbol: string;
  currentPrice: number;
  historicalPrices: {
    date: string;
    price: number;
  }[];
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  monthlyChange: number;
  monthlyChangePercent: number;
}

export async function getStockData(symbol: string, purchaseDate: string): Promise<StockData> {
  try {
    // Fetch daily time series data
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    const timeSeriesData = data['Time Series (Daily)'];

    if (!timeSeriesData) {
      throw new Error('No data available for this symbol');
    }

    // Get current price (latest available)
    const latestDate = Object.keys(timeSeriesData)[0];
    const currentPrice = parseFloat(timeSeriesData[latestDate]['4. close']);

    // Calculate historical prices
    const historicalPrices = Object.entries(timeSeriesData)
      .map(([date, values]: [string, any]) => ({
        date,
        price: parseFloat(values['4. close']),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the closest available date to purchase date
    const purchaseDateObj = new Date(purchaseDate);
    const closestDate = historicalPrices.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.date).getTime() - purchaseDateObj.getTime());
      const currDiff = Math.abs(new Date(curr.date).getTime() - purchaseDateObj.getTime());
      return currDiff < prevDiff ? curr : prev;
    });

    // Calculate changes
    const dailyChange = currentPrice - historicalPrices[historicalPrices.length - 2].price;
    const dailyChangePercent = (dailyChange / historicalPrices[historicalPrices.length - 2].price) * 100;

    // Calculate weekly change (last 5 trading days)
    const weeklyPrice = historicalPrices[Math.min(5, historicalPrices.length - 1)].price;
    const weeklyChange = currentPrice - weeklyPrice;
    const weeklyChangePercent = (weeklyChange / weeklyPrice) * 100;

    // Calculate monthly change (last 22 trading days)
    const monthlyPrice = historicalPrices[Math.min(22, historicalPrices.length - 1)].price;
    const monthlyChange = currentPrice - monthlyPrice;
    const monthlyChangePercent = (monthlyChange / monthlyPrice) * 100;

    return {
      symbol,
      currentPrice,
      historicalPrices,
      dailyChange,
      dailyChangePercent,
      weeklyChange,
      weeklyChangePercent,
      monthlyChange,
      monthlyChangePercent,
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

export function calculateInvestmentValue(
  quantity: number,
  purchasePrice: number,
  currentPrice: number
) {
  const totalValue = quantity * currentPrice;
  const totalCost = quantity * purchasePrice;
  const profitLoss = totalValue - totalCost;
  const profitLossPercent = (profitLoss / totalCost) * 100;

  return {
    totalValue,
    totalCost,
    profitLoss,
    profitLossPercent,
  };
} 