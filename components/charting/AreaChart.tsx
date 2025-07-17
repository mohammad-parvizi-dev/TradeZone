import React from 'react';
import { ChartDataPoint } from '../../types';

interface AreaChartProps {
    data: ChartDataPoint[];
    height?: number;
    className?: string;
}

const formatCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
};

const AreaChart: React.FC<AreaChartProps> = ({ data, height = 350, className }) => {
    const width = 800;
    if (!data || data.length < 2) {
        return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough data.</div>;
    }

    const PADDING = { top: 10, right: 10, bottom: 30, left: 60 };

    const yMin = 0;
    const yMax = Math.max(...data.map(d => d.value));
    const yRange = yMax - yMin;

    const xMin = data[0].timestamp;
    const xMax = data[data.length - 1].timestamp;
    const xRange = xMax - xMin;

    const toSvgX = (ts: number) => PADDING.left + ((ts - xMin) / xRange) * (width - PADDING.left - PADDING.right);
    const toSvgY = (val: number) => (height - PADDING.bottom) - ((val - yMin) / yRange) * (height - PADDING.top - PADDING.bottom);

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(d.timestamp)} ${toSvgY(d.value)}`).join(' ');
    const areaPath = `${linePath} L ${toSvgX(xMax)} ${height - PADDING.bottom} L ${toSvgX(xMin)} ${height - PADDING.bottom} Z`;

    const yLabels = Array.from({ length: 5 }, (_, i) => yMin + (yRange / 4) * i);
    const xLabels = Array.from({ length: 4 }, (_, i) => xMin + (xRange / 3) * i);

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
            <defs>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#131316" stopOpacity="0.1" />
                </linearGradient>
            </defs>
            
            {/* Y-axis grid lines and labels */}
            {yLabels.map(val => (
                <g key={val} className="text-gray-600">
                    <line x1={PADDING.left} y1={toSvgY(val)} x2={width - PADDING.right} y2={toSvgY(val)} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2"/>
                    <text x={PADDING.left - 8} y={toSvgY(val) + 4} textAnchor="end" fontSize="10" fill="currentColor">
                        ${formatCompact(val)}
                    </text>
                </g>
            ))}

            {/* X-axis labels */}
            {xLabels.map(ts => (
                <text key={ts} x={toSvgX(ts)} y={height - PADDING.bottom + 15} textAnchor="middle" fontSize="10" fill="currentColor">
                    {new Date(ts).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </text>
            ))}

            {/* Area and Line */}
            <path d={areaPath} fill="url(#areaGradient)" />
            <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2" />
        </svg>
    );
};

export default AreaChart;
