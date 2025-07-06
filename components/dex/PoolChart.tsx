import React, { useState, useEffect } from 'react';

interface ChartApiResponse {
    status: string;
    data: {
        timestamp: string;
        tvlUsd: number;
        apy: number;
    }[];
}

interface HistoricalTvlApyChartProps {
    poolId: string;
    height?: number;
    className?: string;
}

const HistoricalTvlApyChart: React.FC<HistoricalTvlApyChartProps> = ({ poolId, height = 400, className }) => {
    const [tvlData, setTvlData] = useState<{ timestamp: number; value: number }[]>([]);
    const [apyData, setApyData] = useState<{ timestamp: number; value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!poolId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch chart data for pool ${poolId}: ${response.statusText}`);
                }
                const result: ChartApiResponse = await response.json();
                
                if (result.status !== 'success' || !Array.isArray(result.data)) {
                    throw new Error('Invalid chart data structure from API.');
                }
                
                const tvlPoints = result.data.map(d => ({ timestamp: new Date(d.timestamp).getTime(), value: d.tvlUsd }));
                const apyPoints = result.data.map(d => ({ timestamp: new Date(d.timestamp).getTime(), value: d.apy }));

                setTvlData(tvlPoints);
                setApyData(apyPoints);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [poolId]);

    const width = 800; // Keep a fixed aspect ratio basis

    if (loading) return <div style={{ height }} className="flex items-center justify-center text-gray-500">Loading Chart Data...</div>;
    if (error) return <div style={{ height }} className="flex items-center justify-center text-red-500">Error: {error}</div>;
    if (tvlData.length < 2) return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough historical data available for this pool.</div>;

    const PADDING = 60;

    const yTvlMin = Math.min(...tvlData.map(d => d.value));
    const yTvlMax = Math.max(...tvlData.map(d => d.value));
    const yApyMin = Math.min(...apyData.map(d => d.value));
    const yApyMax = Math.max(...apyData.map(d => d.value));

    const xMin = tvlData[0].timestamp;
    const xMax = tvlData[tvlData.length - 1].timestamp;

    const yTvlRange = yTvlMax - yTvlMin === 0 ? 1 : yTvlMax - yTvlMin;
    const yApyRange = yApyMax - yApyMin === 0 ? 1 : yApyMax - yApyMin;
    const xRange = xMax - xMin === 0 ? 1 : xMax - xMin;

    const toSvgX = (timestamp: number) => PADDING + ((timestamp - xMin) / xRange) * (width - PADDING * 2);
    const toTvlY = (value: number) => (height - PADDING) - ((value - yTvlMin) / yTvlRange) * (height - PADDING * 2);
    const toApyY = (value: number) => (height - PADDING) - ((value - yApyMin) / yApyRange) * (height - PADDING * 2);

    const tvlPathData = tvlData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.timestamp).toFixed(2)} ${toTvlY(p.value).toFixed(2)}`).join(' ');
    const apyPathData = apyData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.timestamp).toFixed(2)} ${toApyY(p.value).toFixed(2)}`).join(' ');

    const yTvlLabels = Array.from({ length: 6 }, (_, i) => ({ value: yTvlMin + (yTvlRange / 5) * i, y: toTvlY(yTvlMin + (yTvlRange / 5) * i) }));
    const yApyLabels = Array.from({ length: 6 }, (_, i) => ({ value: yApyMin + (yApyRange / 5) * i, y: toApyY(yApyMin + (yApyRange / 5) * i) }));
    const xLabels = Array.from({ length: 5 }, (_, i) => ({ value: new Date(xMin + (xRange / 4) * i).toLocaleDateString(), x: toSvgX(xMin + (xRange / 4) * i) }));

    return (
        <div className={`relative ${className}`}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                {/* Y-axis (TVL) grid lines and labels */}
                {yTvlLabels.map(({ value, y }) => (
                    <g key={`tvl-${value}`} className="text-gray-600">
                        <line x1={PADDING} y1={y} x2={width - PADDING} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                        <text x={PADDING - 8} y={y + 3} textAnchor="end" fontSize="10" fill="currentColor">
                           ${Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}
                        </text>
                    </g>
                ))}

                {/* Y-axis (APY) labels */}
                {yApyLabels.map(({ value, y }) => (
                     <g key={`apy-${value}`} className="text-gray-600">
                        <text x={width - PADDING + 8} y={y + 3} textAnchor="start" fontSize="10" fill="currentColor">
                           {value.toFixed(2)}%
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {xLabels.map(({ value, x }) => (
                    <g key={`x-${value}`} className="text-gray-600">
                        <text x={x} y={height - PADDING + 20} textAnchor="middle" fontSize="10" fill="currentColor">{value}</text>
                    </g>
                ))}

                {/* Axes lines */}
                <line x1={PADDING} y1={PADDING/2} x2={PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />
                <line x1={width - PADDING} y1={PADDING/2} x2={width - PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />
                <line x1={PADDING} y1={height - PADDING} x2={width - PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />

                {/* Legend */}
                <g transform={`translate(${PADDING}, 10)`}>
                    <circle cx="0" cy="0" r="4" fill="#2563EB" />
                    <text x="10" y="4" fontSize="12" fill="#D1D5DB">TVL (USD)</text>
                    <circle cx="90" cy="0" r="4" fill="#10B981" />
                    <text x="100" y="4" fontSize="12" fill="#D1D5DB">APY</text>
                </g>

                {/* Data paths */}
                <path d={tvlPathData} fill="none" stroke="#2563EB" strokeWidth="2" />
                <path d={apyPathData} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
        </div>
    );
};

export default HistoricalTvlApyChart;
