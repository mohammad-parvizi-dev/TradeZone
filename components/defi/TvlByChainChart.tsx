
import React, { useState, useEffect, useMemo } from 'react';
import { DefiLlamaChainData } from '../../types';
import DonutChart from '../charting/DonutChart';
import { fetchWithCache } from '../../utils/api';

interface ChartDataObject {
    label: string;
    value: number;
    color: string;
}

const CHAIN_COLORS = [
    '#2563EB', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#6366F1', '#D946EF', '#F97316', '#6B7280'
];

const TvlByChainChart: React.FC = () => {
    const [chartData, setChartData] = useState<ChartDataObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChainData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchWithCache<DefiLlamaChainData[]>('llama-chains', 'https://api.llama.fi/v2/chains', 3600);
                
                if (!data || data.length === 0) {
                    throw new Error("No chain data available from API.");
                }

                const topChains = data.slice(0, 10);
                const otherChainsTvl = data.slice(10).reduce((sum, chain) => sum + chain.tvl, 0);

                const formattedData: ChartDataObject[] = [
                    ...topChains.map((chain, index) => ({
                        label: chain.name,
                        value: chain.tvl,
                        color: CHAIN_COLORS[index % CHAIN_COLORS.length]
                    })),
                ];
                if (otherChainsTvl > 0) {
                    formattedData.push({
                         label: 'Others',
                         value: otherChainsTvl,
                         color: CHAIN_COLORS[10]
                    });
                }
                
                setChartData(formattedData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChainData();
    }, []);

    return (
        <div className="bg-primary-dark p-6 rounded-lg h-full">
            <h3 className="text-lg font-semibold text-white mb-4">TVL Distribution by Chain</h3>
            <div className="h-[390px]">
                {isLoading && <div className="w-full h-full flex items-center justify-center text-gray-400">Loading Chart...</div>}
                {error && <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>}
                {!isLoading && !error && chartData.length > 0 && (
                     <DonutChart data={chartData} />
                )}
            </div>
        </div>
    );
};

export default TvlByChainChart;
