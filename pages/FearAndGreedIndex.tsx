import React, { useState, useEffect, useMemo } from 'react';
import { FngData } from '../types';

const timeRanges = [
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'ALL', days: 0 }
];

const getGaugeColor = (classification: string) => {
    switch (classification) {
        case 'Extreme Fear': return 'text-red-500';
        case 'Fear': return 'text-amber-500';
        case 'Neutral': return 'text-yellow-400';
        case 'Greed': return 'text-lime-400';
        case 'Extreme Greed': return 'text-green-500';
        default: return 'text-gray-400';
    }
};

const Gauge: React.FC<{ value: number, classification: string }> = ({ value, classification }) => {
    const rotation = (value / 100) * 180 - 90;
    const colorClass = getGaugeColor(classification);

    return (
        <div className="relative w-64 h-32 mx-auto">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" strokeWidth="10" className="text-gray-700" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" strokeWidth="10" strokeLinecap="round" className={colorClass}
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - value / 100)}
                />
            </svg>
            <div
                className="absolute bottom-2 left-1/2 w-0.5 h-10 bg-white transition-transform duration-500"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transformOrigin: 'bottom center' }}
            ></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-3 h-3"></div>
            <div className="absolute top-full -mt-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
                <div className="text-sm text-gray-400">{classification}</div>
            </div>
        </div>
    );
};

const HistoricalChart: React.FC<{ data: FngData[], height?: number }> = ({ data, height = 300 }) => {
    const width = 800;
    if (data.length < 2) return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough data.</div>;

    const PADDING = 50;
    const yMin = 0;
    const yMax = 100;
    const yRange = yMax - yMin;

    // Data is oldest to newest, so data[0] is xMin and data[data.length - 1] is xMax.
    const xMin = parseInt(data[0].timestamp, 10);
    const xMax = parseInt(data[data.length - 1].timestamp, 10);
    const xRange = xMax - xMin === 0 ? 1 : xMax - xMin;

    const toSvgX = (ts: number) => PADDING + ((ts - xMin) / xRange) * (width - PADDING * 2);
    const toSvgY = (val: number) => (height - PADDING) - ((val - yMin) / yRange) * (height - PADDING * 2);

    const pathData = data.map((d, i) => {
        const x = toSvgX(parseInt(d.timestamp, 10));
        const y = toSvgY(parseInt(d.value, 10));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');

    const yLabels = [0, 25, 50, 75, 100];
    const xLabels = Array.from({ length: 5 }, (_, i) => {
        const ts = xMin + (xRange / 4) * i;
        return { value: new Date(ts * 1000).toLocaleDateString(), x: toSvgX(ts) };
    });

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {yLabels.map(val => (
                <g key={val} className="text-gray-600">
                    <line x1={PADDING} y1={toSvgY(val)} x2={width - PADDING} y2={toSvgY(val)} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={PADDING - 8} y={toSvgY(val) + 3} textAnchor="end" fontSize="10" fill="currentColor">{val}</text>
                </g>
            ))}
            {xLabels.map(label => (
                <text key={label.x} x={label.x} y={height - PADDING + 20} textAnchor="middle" fontSize="10" fill="currentColor">{label.value}</text>
            ))}
            <path d={pathData} fill="none" stroke="#2563EB" strokeWidth="2" />
        </svg>
    );
};


const FearAndGreedIndex: React.FC = () => {
    const [allData, setAllData] = useState<FngData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState(timeRanges[2]); // Default to 90D

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://api.alternative.me/fng/?limit=0&format=json');
                if (!response.ok) throw new Error(`Failed to fetch Fear & Greed data: ${response.statusText}`);
                const result = await response.json();
                if (!result.data || !Array.isArray(result.data)) throw new Error("Invalid API response structure.");
                setAllData(result.data);
            } catch (err: any) {
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        if (selectedTimeframe.days === 0) return [...allData].reverse();
        const filtered = allData.slice(0, selectedTimeframe.days);
        return filtered.reverse();
    }, [allData, selectedTimeframe]);

    const currentData = allData[0];
    const yesterdayData = allData[1];
    const lastWeekData = allData[6];
    const lastMonthData = allData[29];
    
    if (loading) return <div className="text-center p-8 text-gray-400">Loading Fear & Greed Index...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    if (!currentData || !yesterdayData || !lastWeekData || !lastMonthData) return <div className="text-center p-8 text-gray-400">Not enough data available.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Risk Monitoring: Fear & Greed Index</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-primary-dark p-6 rounded-lg flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-8 text-center">Current Market Sentiment</h2>
                        <Gauge value={parseInt(currentData.value)} classification={currentData.value_classification} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center mt-12 pt-4 border-t border-border-dark">
                        <div>
                            <p className="text-xs text-gray-400">Yesterday</p>
                            <p className="text-lg font-semibold">{yesterdayData.value}</p>
                            <p className="text-xs">{yesterdayData.value_classification}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Last Week</p>
                            <p className="text-lg font-semibold">{lastWeekData.value}</p>
                             <p className="text-xs">{lastWeekData.value_classification}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Last Month</p>
                            <p className="text-lg font-semibold">{lastMonthData.value}</p>
                            <p className="text-xs">{lastMonthData.value_classification}</p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-primary-dark p-6 rounded-lg">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Historical Index</h3>
                         <div className="flex items-center bg-secondary-dark rounded-lg p-1">
                            {timeRanges.map(range => (
                                <button
                                    key={range.label}
                                    onClick={() => setSelectedTimeframe(range)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeframe.label === range.label ? 'bg-accent-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="bg-secondary-dark p-4 rounded-lg border border-border-dark">
                        <HistoricalChart data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FearAndGreedIndex;