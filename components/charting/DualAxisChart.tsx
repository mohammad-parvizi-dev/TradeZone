import React from 'react';

interface ChartDataPoint {
    timestamp: number;
    value: number;
}

interface DualAxisChartProps {
    priceData: ChartDataPoint[];
    oiData: ChartDataPoint[];
    height?: number;
    className?: string;
}

const DualAxisChart: React.FC<DualAxisChartProps> = ({ priceData, oiData, height = 450, className }) => {
    const width = 800; // Keep a fixed aspect ratio basis
    if (!priceData || priceData.length < 2 || !oiData || oiData.length < 2) {
        return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough data to display chart.</div>;
    }

    const PADDING = 60;

    // Price data (left Y-axis)
    const yPriceMin = Math.min(...priceData.map(d => d.value));
    const yPriceMax = Math.max(...priceData.map(d => d.value));
    const yPriceRange = yPriceMax - yPriceMin === 0 ? 1 : yPriceMax - yPriceMin;

    // OI data (right Y-axis)
    const yOiMin = Math.min(...oiData.map(d => d.value));
    const yOiMax = Math.max(...oiData.map(d => d.value));
    const yOiRange = yOiMax - yOiMin === 0 ? 1 : yOiMax - yOiMin;

    const xMin = priceData[0].timestamp;
    const xMax = priceData[priceData.length - 1].timestamp;
    const xRange = xMax - xMin === 0 ? 1 : xMax - xMin;

    const toSvgX = (timestamp: number) => PADDING + ((timestamp - xMin) / xRange) * (width - PADDING * 2);
    const toPriceY = (value: number) => (height - PADDING) - ((value - yPriceMin) / yPriceRange) * (height - PADDING * 2);
    const toOiY = (value: number) => (height - PADDING) - ((value - yOiMin) / yOiRange) * (height - PADDING * 2);

    const pricePathData = priceData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.timestamp).toFixed(2)} ${toPriceY(p.value).toFixed(2)}`).join(' ');
    const oiPathData = oiData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.timestamp).toFixed(2)} ${toOiY(p.value).toFixed(2)}`).join(' ');

    const yPriceLabels = Array.from({ length: 6 }, (_, i) => {
        const value = yPriceMin + (yPriceRange / 5) * i;
        return { value, y: toPriceY(value) };
    });

    const yOiLabels = Array.from({ length: 6 }, (_, i) => {
        const value = yOiMin + (yOiRange / 5) * i;
        return { value, y: toOiY(value) };
    });

    const xLabels = Array.from({ length: 5 }, (_, i) => {
        const timestamp = xMin + (xRange / 4) * i;
        return { value: new Date(timestamp).toLocaleDateString(), x: toSvgX(timestamp) };
    });

    return (
        <div className={`relative ${className}`}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis (Price) grid lines and labels */}
                {yPriceLabels.map(({ value, y }) => (
                    <g key={`price-${value}`} className="text-gray-600">
                        <line x1={PADDING} y1={y} x2={width - PADDING} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                        <text x={PADDING - 8} y={y + 3} textAnchor="end" fontSize="10" fill="currentColor">${value.toLocaleString()}</text>
                    </g>
                ))}

                {/* Y-axis (OI) labels */}
                {yOiLabels.map(({ value, y }) => (
                     <g key={`oi-${value}`} className="text-gray-600">
                        <text x={width - PADDING + 8} y={y + 3} textAnchor="start" fontSize="10" fill="currentColor">
                            {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}
                        </text>
                    </g>
                ))}

                {/* X-axis grid lines and labels */}
                {xLabels.map(({ value, x }) => (
                    <g key={`x-${value}`} className="text-gray-600">
                        <line x1={x} y1={PADDING} x2={x} y2={height - PADDING} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
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
                    <text x="10" y="4" fontSize="12" fill="#D1D5DB">Price</text>
                    <circle cx="70" cy="0" r="4" fill="#10B981" />
                    <text x="80" y="4" fontSize="12" fill="#D1D5DB">Open Interest</text>
                </g>

                {/* Data paths */}
                <path d={pricePathData} fill="url(#priceGradient)" />
                <path d={pricePathData} fill="none" stroke="#2563EB" strokeWidth="2" />
                <path d={oiPathData} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
        </div>
    );
};

export default DualAxisChart;
