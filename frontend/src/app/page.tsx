'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Investment } from '../types/investment';
import AddInvestment from '../components/AddInvestment';
import InvestmentCard from '../components/InvestmentCard';
import Loading from '../components/Loading';
import Error from '../components/Error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInvestments();
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInvestments();
      } else {
        setInvestments([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/investments`);
      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }
      const data = await response.json();
      setInvestments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (investmentData: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(investmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add investment');
      }

      const newInvestment = await response.json();
      setInvestments([...investments, newInvestment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateInvestment = async (id: string, data: Partial<Investment>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/investments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update investment');
      }

      const updatedInvestment = await response.json();
      setInvestments(investments.map(inv => 
        inv.id === id ? updatedInvestment : inv
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/investments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete investment');
      }

      setInvestments(investments.filter(inv => inv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to Stock Tracker
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please sign in to manage your investments
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">{user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8">
          <Error message={error} onRetry={fetchInvestments} />
        </div>
      )}

      <div className="mb-8">
        <AddInvestment onAdd={handleAddInvestment} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            onDelete={handleDeleteInvestment}
            onUpdate={handleUpdateInvestment}
          />
        ))}
      </div>

      {investments.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">No investments yet. Add your first investment above!</p>
        </div>
      )}
    </div>
  );
}
