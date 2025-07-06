import React, { useState, useEffect, useMemo } from 'react';
import { ChartDataPoint } from '../../types';
import VolumeChart from './VolumeChart';

const timeRanges = ['7D', '30D', '90D', '1Y', 'ALL'];

const AggregatedVolume: React.FC = () => {
    const [volumeData, setVolumeData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('90D');

    useEffect(() => {
        const fetchVolume = async () => {
            setLoading(true);
            setError(null);
            try {
                // Correct endpoint for aggregated daily DEX volume
                const response = await fetch('https://api.llama.fi/overview/dexs?dataType=dailyVolume');
                 if (!response.ok) {
                    throw new Error(`Failed to fetch aggregated volume data: ${response.statusText}`);
                }
                const data = await response.json();
                
                if (!data || !Array.isArray(data.totalDataChart)) {
                    throw new Error("API did not return a valid data structure for aggregated volume.");
                }

                const parsedData: ChartDataPoint[] = data.totalDataChart.map((point: [number, number]) => ({
                    timestamp: point[0] * 1000, // API returns seconds, chart needs ms
                    value: point[1],
                }));

                setVolumeData(parsedData);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchVolume();
    }, []);

    const chartData = useMemo((): ChartDataPoint[] => {
        if (volumeData.length === 0) return [];
        
        if (selectedTimeRange === 'ALL') {
            return volumeData;
        }

        const daysToFilter = {
            '7D': 7,
            '30D': 30,
            '90D': 90,
            '1Y': 365,
        }[selectedTimeRange];

        if (daysToFilter) {
            const now = new Date().setHours(0, 0, 0, 0);
            const cutoff = now - daysToFilter * 24 * 60 * 60 * 1000;
            return volumeData.filter(d => d.timestamp >= cutoff);
        }

        return volumeData;

    }, [volumeData, selectedTimeRange]);

    if (loading) return <div className="text-center p-8 text-gray-400">Loading volume data...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Total DEX Volume (USD)</h3>
                 <div className="flex items-center bg-secondary-dark rounded-lg p-1">
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
             <div className="bg-secondary-dark p-4 rounded-lg border border-border-dark">
                {chartData.length > 0 ? (
                    <VolumeChart data={chartData} />
                ) : (
                    <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No volume data available for the selected range.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AggregatedVolume;