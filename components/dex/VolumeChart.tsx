import React from 'react';
import { ChartDataPoint } from '../../types';

interface VolumeChartProps {
    data: ChartDataPoint[];
    height?: number;
    className?: string;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, height = 400, className }) => {
    const width = 800; // Keep a fixed aspect ratio basis
    if (!data || data.length < 2) {
        return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough data to display chart.</div>;
    }

    const PADDING = 60;

    const yMin = 0; // Volume starts from 0
    const yMax = Math.max(...data.map(d => d.value));
    const xMin = data[0].timestamp;
    const xMax = data[data.length - 1].timestamp;

    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;
    const xRange = xMax - xMin === 0 ? 1 : xMax - xMin;

    const toSvgX = (timestamp: number) => PADDING + ((timestamp - xMin) / xRange) * (width - PADDING * 2);
    const toSvgY = (value: number) => (height - PADDING) - ((value - yMin) / yRange) * (height - PADDING * 2);

    const pathData = data
        .map((point, i) => {
            const x = toSvgX(point.timestamp);
            const y = toSvgY(point.value);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');
    
    const areaPathData = `${pathData} L ${toSvgX(xMax).toFixed(2)} ${height - PADDING} L ${toSvgX(xMin).toFixed(2)} ${height - PADDING} Z`;
    
    // Y-axis labels
    const yLabels = [];
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
        const value = yMin + (yRange / numYLabels) * i;
        yLabels.push({ value: value, y: toSvgY(value) });
    }

    // X-axis labels
    const xLabels = [];
    const numXLabels = 4;
    for (let i = 0; i <= numXLabels; i++) {
        const timestamp = xMin + (xRange / numXLabels) * i;
        xLabels.push({ value: new Date(timestamp).toLocaleDateString(), x: toSvgX(timestamp) });
    }

    return (
        <div className={`relative ${className}`}>
             <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                 <defs>
                    <linearGradient id="volumeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis grid lines and labels */}
                {yLabels.map(label => (
                    <g key={label.value} className="text-gray-500">
                        <line x1={PADDING} y1={label.y} x2={width - PADDING} y2={label.y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2"/>
                        <text x={PADDING - 10} y={label.y + 3} textAnchor="end" fontSize="10" fill="currentColor">
                           ${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(label.value)}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {xLabels.map(label => (
                    <g key={label.value} className="text-gray-500">
                        <text x={label.x} y={height - PADDING + 20} textAnchor="middle" fontSize="10" fill="currentColor">
                           {label.value}
                        </text>
                    </g>
                ))}

                 {/* Axes lines */}
                <line x1={PADDING} y1={PADDING/2} x2={PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />
                <line x1={PADDING} y1={height - PADDING} x2={width - PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />

                {/* Data area and path */}
                <path d={areaPathData} fill="url(#volumeGradient)" />
                <path
                    d={pathData}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default VolumeChart;
