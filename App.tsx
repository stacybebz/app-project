
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionType } from './types';
import Header from './components/Header';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import AnalyticsChart from './components/AnalyticsChart';
import SecurityTips from './components/SecurityTips';

const App: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        try {
            const localData = localStorage.getItem('transactions');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Could not parse transactions from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error("Could not save transactions to localStorage", error);
        }
    }, [transactions]);

    const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now(),
        };
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    }, []);

    const deleteTransaction = useCallback((id: number) => {
        setTransactions(prevTransactions => prevTransactions.filter(transaction => transaction.id !== id));
    }, []);

    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const income = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((acc, t) => acc + t.amount, 0);
        
        const expenses = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            totalIncome: income,
            totalExpenses: expenses,
            balance: income - expenses
        };
    }, [transactions]);

    return (
        <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <Summary totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <div className="space-y-6">
                       <TransactionForm addTransaction={addTransaction} />
                       <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} />
                    </div>
                    <div className="space-y-6">
                        <AnalyticsChart transactions={transactions} />
                        <SecurityTips income={totalIncome} expenses={totalExpenses} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
