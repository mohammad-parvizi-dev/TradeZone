
import React, { useState, useEffect } from 'react';
import MultiLineChart from '../charting/MultiLineChart';
import { fetchWithCache } from '../../utils/api';

const STABLECOINS_TO_TRACK = [
  { id: 'tether', name: 'USDT', color: '#26A17B' },
  { id: 'usd-coin', name: 'USDC', color: '#2775CA' },
  { id: 'dai', name: 'DAI', color: '#F9A825' },
];

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: { timestamp: number, value: number }[];
        color: string;
    }[];
}

const PegComparisonChart = () => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllCharts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const promises = STABLECOINS_TO_TRACK.map(coin => {
                    const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
                    return fetchWithCache<{ prices: [number, number][] }>(`cg-chart-${coin.id}`, url, 600);
                });

                const results = await Promise.all(promises);

                const datasets = results.map((result, index) => {
                    if (!result.prices) throw new Error(`Invalid data for ${STABLECOINS_TO_TRACK[index].name}`);
                    return {
                        label: STABLECOINS_TO_TRACK[index].name,
                        data: result.prices.map((p: [number, number]) => ({ timestamp: p[0], value: p[1] })),
                        color: STABLECOINS_TO_TRACK[index].color,
                    };
                });
                
                setChartData({ labels: [], datasets }); // labels are generated inside the chart component now
            } catch (err: any) {
                console.error("Error fetching price histories:", err);
                setError('Failed to fetch price histories. The API may be rate-limiting requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllCharts();
    }, []);
    
    if (isLoading) return (
        <div className="h-[400px] flex items-center justify-center bg-secondary-dark rounded-lg">
            <p className="text-gray-400">Loading Peg Stability Chart...</p>
        </div>
    );
    if (error) return (
         <div className="h-[400px] flex items-center justify-center bg-secondary-dark rounded-lg">
            <p className="text-red-500">Error: {error}</p>
        </div>
    );

    return (
        <div className="h-[400px] bg-secondary-dark p-4 rounded-lg border border-border-dark">
            {chartData && (
                <MultiLineChart 
                    datasets={chartData.datasets}
                    yAxisMin={0.98}
                    yAxisMax={1.02}
                    refLines={[{ value: 1.00, label: '$1 Peg', color: '#9CA3AF' }]}
                />
            )}
        </div>
    );
};

export default PegComparisonChart;
