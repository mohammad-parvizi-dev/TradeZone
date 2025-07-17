
import React, { useState, useEffect, useMemo } from 'react';
import { ChartDataPoint, DefiLlamaChartPoint } from '../../types';
import AreaChart from '../charting/AreaChart';
import { fetchWithCache } from '../../utils/api';

const timeRanges = ['30D', '90D', '1Y', 'ALL'];

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 3 }).format(value);
};

const TotalTvlChart: React.FC = () => {
    const [allData, setAllData] = useState<ChartDataPoint[]>([]);
    const [currentTvl, setCurrentTvl] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('1Y');

    useEffect(() => {
        const fetchTvlData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchWithCache<DefiLlamaChartPoint[]>('llama-charts', 'https://api.llama.fi/charts', 600);

                if (!data || data.length === 0) {
                    throw new Error("No TVL data returned from API.");
                }

                const formattedData: ChartDataPoint[] = data.map(item => ({
                    timestamp: parseInt(item.date) * 1000,
                    value: item.totalLiquidityUSD,
                }));
                setAllData(formattedData);
                setCurrentTvl(data[data.length - 1].totalLiquidityUSD);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTvlData();
    }, []);

    const chartData = useMemo(() => {
        if (selectedTimeRange === 'ALL') return allData;
        const now = Date.now();
        const days = { '30D': 30, '90D': 90, '1Y': 365 }[selectedTimeRange] || 365;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        return allData.filter(d => d.timestamp >= cutoff);
    }, [allData, selectedTimeRange]);

    return (
        <div className="bg-primary-dark p-6 rounded-lg h-full">
            <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Total Value Locked (All Chains)</h3>
                    <p className="text-3xl font-bold text-accent-blue mt-1">
                        {isLoading ? 'Loading...' : formatLargeNumber(currentTvl)}
                    </p>
                </div>
                <div className="flex items-center bg-secondary-dark rounded-lg p-1 mt-2 sm:mt-0">
                    {timeRanges.map(range => (
                        <button
                            key={range}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeRange === range ? 'bg-accent-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[350px]">
                {isLoading && <div className="w-full h-full flex items-center justify-center text-gray-400">Loading Chart...</div>}
                {error && <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>}
                {!isLoading && !error && chartData.length > 1 && (
                    <AreaChart data={chartData} />
                )}
                 {!isLoading && !error && chartData.length <= 1 && (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">Not enough data for chart.</div>
                )}
            </div>
        </div>
    );
};

export default TotalTvlChart;
