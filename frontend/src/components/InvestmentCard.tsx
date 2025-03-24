import { useState, useEffect } from 'react';
import { Investment } from '../types/investment';
import { getStockData, calculateInvestmentValue, StockData } from '../services/stockService';
import InvestmentAnalysis from './InvestmentAnalysis';

interface InvestmentCardProps {
  investment: Investment;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<Investment>) => Promise<void>;
}

export default function InvestmentCard({
  investment,
  onDelete,
  onUpdate,
}: InvestmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [formData, setFormData] = useState({
    symbol: investment.symbol,
    quantity: investment.quantity,
    purchasePrice: investment.purchasePrice,
    purchaseDate: investment.purchaseDate,
    notes: investment.notes || '',
  });
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const data = await getStockData(investment.symbol, investment.purchaseDate);
        setStockData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [investment.symbol, investment.purchaseDate]);

  const investmentValue = stockData
    ? calculateInvestmentValue(investment.quantity, investment.purchasePrice, stockData.currentPrice)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate(investment.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating investment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      setIsDeleting(true);
      try {
        await onDelete(investment.id);
      } catch (error) {
        console.error('Error deleting investment:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <div className="text-sm text-gray-500">
          Symbol: {investment.symbol}
          <br />
          Quantity: {investment.quantity}
          <br />
          Purchase Price: ${investment.purchasePrice.toFixed(2)}
          <br />
          Purchase Date: {new Date(investment.purchaseDate).toLocaleDateString()}
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
            <input
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{investment.symbol}</h3>
          <p className="text-sm text-gray-500">
            {investment.quantity} shares
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-900"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {stockData && investmentValue && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-lg font-semibold">${stockData.currentPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-semibold">${investmentValue.totalValue.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Profit/Loss</p>
            <p className={`text-lg font-semibold ${investmentValue.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${investmentValue.profitLoss.toFixed(2)} ({investmentValue.profitLossPercent.toFixed(2)}%)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Daily</p>
              <p className={`text-sm font-medium ${stockData.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.dailyChangePercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weekly</p>
              <p className={`text-sm font-medium ${stockData.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.weeklyChangePercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly</p>
              <p className={`text-sm font-medium ${stockData.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.monthlyChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>Purchase Date: {new Date(investment.purchaseDate).toLocaleDateString()}</p>
            <p>Purchase Price: ${investment.purchasePrice.toFixed(2)}</p>
            {investment.notes && <p className="mt-2">Notes: {investment.notes}</p>}
          </div>
        </div>
      )}

      {showAnalysis && (
        <div className="mt-6">
          <InvestmentAnalysis investment={investment} />
        </div>
      )}
    </div>
  );
} 