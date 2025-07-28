
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { fetchWithCache } from '../utils/api';
import { FMP_API_KEY, forexPairs } from '../constants';
import { SearchIcon, ChevronDownIcon } from '../components/icons';
import AreaChart from '../components/charting/AreaChart';
import { ChartDataPoint } from '../types';


interface FmpHistoricalPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const allPairs = [...forexPairs.majors, ...forexPairs.minors, ...forexPairs.exotics].sort();

// --- ForexPairSelector Component Logic (embedded for simplicity) ---
interface ForexPairSelectorProps {
    selectedPair: string;
    onSelect: (pair: string) => void;
}
const ForexPairSelector: React.FC<ForexPairSelectorProps> = ({ selectedPair, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleSelect = (pair: string) => {
        onSelect(pair.replace('/', ''));
        setIsOpen(false);
        setSearchTerm('');
    };

    const filteredAssets = useMemo(() => {
        if (!searchTerm) return allPairs.slice(0, 100); // Show a subset initially
        return allPairs.filter(pair => pair.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const displayPair = selectedPair.length > 4 ? `${selectedPair.slice(0, 3)}/${selectedPair.slice(3)}` : selectedPair;

    return (
        <div className="relative w-48" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-secondary-dark border border-border-dark rounded-lg py-2 px-4 w-full flex justify-between items-center text-white"
            >
                <span className="font-medium">{displayPair}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-full bg-secondary-dark border border-border-dark rounded-lg shadow-lg max-h-80 flex flex-col">
                    <div className="p-2 border-b border-border-dark">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-gray" />
                            <input
                                type="text"
                                placeholder="Search pair..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-primary-dark border border-border-dark rounded-md py-1.5 pl-9 pr-2 focus:outline-none focus:ring-1 focus:ring-accent-blue text-white text-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-1">
                        {filteredAssets.length > 0 ? (
                            filteredAssets.map(pair => (
                                <li key={pair} onClick={() => handleSelect(pair)} className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-700 ${selectedPair === pair.replace('/', '') ? 'bg-accent-blue text-white' : 'text-gray-300'}`}>
                                    {pair}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-gray-500">No pairs found.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Main Historical Data Component ---
const ForexHistoricalData: React.FC = () => {
    const [data, setData] = useState<FmpHistoricalPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPair, setSelectedPair] = useState('EURUSD');
    const [timeframe, setTimeframe] = useState<string>('1hour');

    const handleFetchData = async () => {
        setLoading(true);
        setError(null);
        setData([]);
        try {
            const url = `https://financialmodelingprep.com/api/v3/historical-chart/${timeframe}/${selectedPair}?apikey=${FMP_API_KEY}`;
            const cacheKey = `fmp-hist-${selectedPair}-${timeframe}`;
            const result = await fetchWithCache<FmpHistoricalPoint[]>(cacheKey, url, 600);
            if (!Array.isArray(result) || result.length === 0) {
                throw new Error('No data returned from the API. The pair or timeframe might be unavailable.');
            }
            setData(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo((): ChartDataPoint[] => {
        if (!data || data.length === 0) return [];
        // The FMP API returns historical data from newest to oldest.
        // For a time-series chart, we need to reverse it.
        return [...data].reverse().map(point => ({
            timestamp: new Date(point.date).getTime(),
            value: point.close
        }));
    }, [data]);

    const downloadCSV = () => {
        if (!data.length) return;
        const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [row.date, row.open, row.high, row.low, row.close, row.volume].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedPair}-historical-${timeframe}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const previewData = useMemo(() => data.slice(0, 100), [data]);
    const displayPair = selectedPair.length > 4 ? `${selectedPair.slice(0, 3)}/${selectedPair.slice(3)}` : selectedPair;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Forex Historical Data (OHLC)</h1>
            <div className="bg-primary-dark p-6 rounded-lg space-y-6">
                 <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Currency Pair</label>
                        <ForexPairSelector selectedPair={selectedPair} onSelect={setSelectedPair} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Timeframe / Granularity</label>
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white w-48"
                        >
                            <option value="1min">1 Minute</option>
                            <option value="5min">5 Minutes</option>
                            <option value="15min">15 Minutes</option>
                            <option value="30min">30 Minutes</option>
                            <option value="1hour">1 Hour</option>
                            <option value="4hour">4 Hours</option>
                        </select>
                    </div>
                    <button
                        onClick={handleFetchData}
                        disabled={loading}
                        className="bg-accent-blue text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {loading ? 'Fetching...' : 'Fetch Data'}
                    </button>
                </div>
                
                {loading && <div className="text-center text-gray-400 py-8">Loading data for {displayPair}...</div>}
                {error && <div className="text-center text-red-500 py-8 bg-secondary-dark rounded-lg">{error}</div>}

                {data.length > 0 && !loading && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Price Chart for {displayPair}</h3>
                            <p className="text-sm text-gray-400 mb-2">
                                A chart representing the closing prices for the selected timeframe.
                            </p>
                            <div className="h-[350px] bg-secondary-dark p-4 rounded-lg border border-border-dark">
                                <AreaChart data={chartData} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-lg font-semibold text-white">Data Preview for {displayPair}</h3>
                                 <button
                                    onClick={downloadCSV}
                                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Download as CSV
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">Showing preview of the first {previewData.length} of {data.length} data points.</p>
                            <div className="overflow-x-auto max-h-[60vh]">
                                <table className="min-w-full divide-y divide-border-dark">
                                    <thead className="bg-secondary-dark sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Open</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">High</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Low</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Close</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                                        {previewData.map((row) => (
                                            <tr key={row.date}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">{row.date}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono text-right">{row.open.toFixed(5)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono text-right">{row.high.toFixed(5)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono text-right">{row.low.toFixed(5)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono text-right">{row.close.toFixed(5)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono text-right">{row.volume.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                 {!loading && !error && data.length === 0 && (
                    <div className="text-center text-gray-500 py-16 border-2 border-dashed border-border-dark rounded-lg">
                        <p className="font-semibold">No Data to Display</p>
                        <p className="mt-1">Select a pair and timeframe, then click "Fetch Data".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForexHistoricalData;
