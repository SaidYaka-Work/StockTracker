'use client';

import { useState, useEffect } from 'react';
import { Investment } from '@/types/investment';

interface InvestmentAnalysisProps {
  investment: Investment;
}

interface Analysis {
  currentPrice: number;
  historicalPerformance: {
    dailyChange: string;
    weeklyChange: string;
    monthlyChange: string;
  };
  aiInsights: string;
  riskAssessment: string;
}

export default function InvestmentAnalysis({ investment }: InvestmentAnalysisProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [investment]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze-investment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: investment.symbol,
          quantity: investment.quantity,
          purchasePrice: investment.purchasePrice,
          purchaseDate: investment.purchaseDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading analysis...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Investment Analysis</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="font-medium">${analysis.currentPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Daily Change</p>
          <p className={`font-medium ${analysis.historicalPerformance.dailyChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.historicalPerformance.dailyChange}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Weekly Change</p>
          <p className={`font-medium ${analysis.historicalPerformance.weeklyChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.historicalPerformance.weeklyChange}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Monthly Change</p>
          <p className={`font-medium ${analysis.historicalPerformance.monthlyChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.historicalPerformance.monthlyChange}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Risk Assessment</p>
        <p className="font-medium">{analysis.riskAssessment}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">AI Insights</p>
        <p className="whitespace-pre-wrap">{analysis.aiInsights}</p>
      </div>
    </div>
  );
} 