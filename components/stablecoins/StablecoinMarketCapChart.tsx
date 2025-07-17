
import React, { useState, useEffect, useMemo } from 'react';
import { ChartDataPoint, PeggedAsset, DefiLlamaChartPoint } from '../../types';
import AreaChart from '../charting/AreaChart';
import DonutChart from '../charting/DonutChart';
import BarChart from '../charting/BarChart';
import { fetchWithCache } from '../../utils/api';

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 3 }).format(value);
};

const timeRanges = ['30D', '90D', '1Y', 'ALL'];

const STABLECOIN_COLORS = [
    '#2563EB', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'
];


const StablecoinMarketCapChart: React.FC = () => {
    const [allDeFiTvlData, setAllDeFiTvlData] = useState<ChartDataPoint[]>([]);
    const [currentStablecoinTvl, setCurrentStablecoinTvl] = useState<number>(0);
    const [dominance, setDominance] = useState<number | null>(null);
    const [top5Data, setTop5Data] = useState<{ label: string; value: number; color: string }[]>([]);
    const [pegTypeData, setPegTypeData] = useState<{ label: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('1Y');

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [chartsData, stablecoinsData] = await Promise.all([
                    fetchWithCache<DefiLlamaChartPoint[]>('llama-charts', 'https://api.llama.fi/charts', 600),
                    fetchWithCache<{ peggedAssets: PeggedAsset[] }>('llama-stables', 'https://stablecoins.llama.fi/stablecoins', 300)
                ]);

                // Process historical DeFi TVL for main chart
                const formattedChartData: ChartDataPoint[] = chartsData.map(item => ({
                    timestamp: parseInt(item.date) * 1000,
                    value: item.totalLiquidityUSD,
                }));
                setAllDeFiTvlData(formattedChartData);

                // --- Start New Calculations ---
                const usdPeggedCoins = stablecoinsData.peggedAssets?.filter(c => c.pegType === 'peggedUSD' && c.circulating?.peggedUSD > 0) || [];
                
                // 1. Calculate Total Stablecoin TVL
                const totalStableTvl = usdPeggedCoins.reduce((sum, asset) => sum + (asset.circulating.peggedUSD || 0), 0);
                setCurrentStablecoinTvl(totalStableTvl);

                // 2. Calculate Dominance
                const currentDeFiTvl = chartsData.length > 0 ? chartsData[chartsData.length - 1].totalLiquidityUSD : 0;
                if (totalStableTvl > 0 && currentDeFiTvl > 0) {
                    setDominance((totalStableTvl / currentDeFiTvl) * 100);
                }

                // 3. Process Top 5 Breakdown for Donut Chart
                const sortedCoins = [...usdPeggedCoins].sort((a, b) => b.circulating.peggedUSD - a.circulating.peggedUSD);
                const top5 = sortedCoins.slice(0, 5);
                const othersTvl = sortedCoins.slice(5).reduce((sum, coin) => sum + (coin.circulating.peggedUSD || 0), 0);

                const donutChartData = top5.map((c, index) => ({
                    label: c.symbol,
                    value: c.circulating.peggedUSD,
                    color: STABLECOIN_COLORS[index % STABLECOIN_COLORS.length]
                }));

                if (othersTvl > 0) {
                    donutChartData.push({
                        label: 'Others',
                        value: othersTvl,
                        color: STABLECOIN_COLORS[5 % STABLECOIN_COLORS.length]
                    });
                }
                setTop5Data(donutChartData);

                // 4. Process Peg Mechanism for Bar Chart
                const mechanismData = usdPeggedCoins.reduce((acc, coin) => {
                    const mechanism = (coin.pegMechanism || 'Unknown').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const value = coin.circulating.peggedUSD || 0;
                    if (!acc[mechanism]) {
                        acc[mechanism] = 0;
                    }
                    acc[mechanism] += value;
                    return acc;
                }, {} as Record<string, number>);

                const barChartData = Object.entries(mechanismData)
                    .map(([label, value]) => ({ label, value }))
                    .sort((a, b) => b.value - a.value);
                setPegTypeData(barChartData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const chartData = useMemo(() => {
        if (selectedTimeRange === 'ALL') return allDeFiTvlData;
        const now = Date.now();
        const days = { '30D': 30, '90D': 90, '1Y': 365 }[selectedTimeRange] || 365;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        return allDeFiTvlData.filter(d => d.timestamp >= cutoff);
    }, [allDeFiTvlData, selectedTimeRange]);

    return (
        <div className="space-y-6">
            <div className="bg-primary-dark p-6 rounded-lg">
                <div className="flex flex-wrap justify-between items-start mb-4">
                     <div>
                        <h3 className="text-lg font-semibold text-white">Historical Trend (Total DeFi TVL)</h3>
                        <p className="text-sm text-gray-500">The historical chart shows the Total Value Locked across all of DeFi, serving as a benchmark for the stablecoin market's size.</p>
                    </div>
                     <div className="flex items-center bg-secondary-dark rounded-lg p-1 mt-2 sm:mt-0">
                        {timeRanges.map(range => (
                            <button key={range} onClick={() => setSelectedTimeRange(range)} className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeRange === range ? 'bg-accent-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[350px]">
                    {isLoading && <div className="w-full h-full flex items-center justify-center text-gray-400">Loading Chart...</div>}
                    {error && <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>}
                    {!isLoading && !error && chartData.length > 1 && <AreaChart data={chartData} />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="bg-primary-dark p-6 rounded-lg space-y-6 xl:col-span-1">
                     <h3 className="text-lg font-semibold text-white mb-2">Key Metrics</h3>
                     <div>
                        <p className="text-sm text-gray-400">Total Stablecoin Market Cap</p>
                        <p className="text-3xl font-bold text-accent-blue mt-1">{isLoading ? '...' : formatLargeNumber(currentStablecoinTvl)}</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-400">Stablecoin Dominance Ratio</p>
                        <p className="text-3xl font-bold text-accent-blue mt-1">{isLoading ? '...' : dominance ? `${dominance.toFixed(2)}%` : 'N/A'}</p>
                        <p className="text-xs text-gray-500">Percentage of total DeFi TVL held in stablecoins.</p>
                     </div>
                </div>
                
                <div className="bg-primary-dark p-6 rounded-lg">
                     <h3 className="text-lg font-semibold text-white mb-4">Top 5 Breakdown by Market Cap</h3>
                     <div className="h-[260px] flex items-center justify-center">
                        {isLoading && <div className="text-gray-400">Loading...</div>}
                        {error && <div className="text-red-500 text-sm">Could not load breakdown.</div>}
                        {!isLoading && !error && top5Data.length > 0 && <DonutChart data={top5Data} />}
                     </div>
                </div>
                
                <div className="bg-primary-dark p-6 rounded-lg">
                     <h3 className="text-lg font-semibold text-white mb-4">Market Cap by Peg Mechanism</h3>
                     <div className="mt-4">
                        {isLoading && <div className="text-gray-400">Loading...</div>}
                        {error && <div className="text-red-500 text-sm">Could not load peg types.</div>}
                        {!isLoading && !error && pegTypeData.length > 0 && <BarChart data={pegTypeData} />}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default StablecoinMarketCapChart;
