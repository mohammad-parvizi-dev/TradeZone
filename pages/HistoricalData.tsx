
import React, { useState, useEffect, useMemo } from 'react';
import { SelectedCoin } from '../types';

type OhlcData = [number, number, number, number, number]; // [timestamp, open, high, low, close]

const HistoricalData: React.FC<{ selectedCoin: SelectedCoin | null }> = ({ selectedCoin }) => {
    const [data, setData] = useState<OhlcData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState<string>('90');

    useEffect(() => {
        if (!selectedCoin) {
            setData([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/ohlc?vs_currency=usd&days=${days}`);
                if (!response.ok) {
                     const errorData = await response.json();
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorData?.error || 'Unknown API error'}`);
                }
                const result: OhlcData[] = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCoin, days]);

    const downloadCSV = () => {
        if (!data.length || !selectedCoin) return;

        const headers = ['Timestamp', 'Date (UTC)', 'Open (USD)', 'High (USD)', 'Low (USD)', 'Close (USD)'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => {
                const date = new Date(row[0]).toISOString();
                return [row[0], date, ...row.slice(1)].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedCoin.symbol}-ohlc-${days}d.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const previewData = useMemo(() => data.slice(0, 50), [data]);

    if (!selectedCoin) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-xl text-gray-400">Please select a coin from the Market List or Market Movers to view historical data.</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Historical OHLC Data: {selectedCoin.symbol}/USD</h1>
            
            <div className="bg-primary-dark p-6 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center mb-6">
                    <div>
                        <label htmlFor="timeframe" className="block text-sm font-medium text-gray-300 mb-1">Timeframe</label>
                        <select
                            id="timeframe"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            className="bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                        >
                            <option value="1">1 Day</option>
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                            <option value="30">30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="180">180 Days</option>
                            <option value="365">1 Year</option>
                            <option value="max">Max</option>
                        </select>
                    </div>
                    <div className="flex-grow"></div>
                    <button
                        onClick={downloadCSV}
                        disabled={!data.length || loading}
                        className="bg-accent-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                        Download as CSV
                    </button>
                </div>

                {loading && <div className="text-center text-gray-400 py-8">Loading data...</div>}
                {error && <div className="text-center text-red-500 py-8">Error: {error}</div>}
                {!loading && !error && data.length === 0 && <div className="text-center text-gray-400 py-8">No data available for the selected period.</div>}

                {!loading && !error && data.length > 0 && (
                    <div className="overflow-x-auto">
                        <p className="text-sm text-gray-400 mb-2">Showing preview of the first {previewData.length} of {data.length} data points. Granularity is determined automatically by the API based on the timeframe.</p>
                        <table className="min-w-full divide-y divide-border-dark">
                            <thead className="bg-secondary-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Open</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">High</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Low</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Close</th>
                                </tr>
                            </thead>
                            <tbody className="bg-primary-dark divide-y divide-border-dark">
                                {previewData.map(([timestamp, open, high, low, close]) => (
                                    <tr key={timestamp}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{new Date(timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${open.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${high.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${low.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${close.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoricalData;
