import React from 'react';

interface ChartDataPoint {
    timestamp: number;
    value: number;
}

interface LineChartProps {
    data: ChartDataPoint[];
    width?: number;
    height?: number;
    className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, width = 800, height = 400, className }) => {
    if (!data || data.length < 2) {
        return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough data to display chart.</div>;
    }

    const PADDING = 50;

    const yMin = Math.min(...data.map(d => d.value));
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
                {/* Y-axis grid lines and labels */}
                {yLabels.map(label => (
                    <g key={label.value} className="text-gray-500">
                        <line x1={PADDING} y1={label.y} x2={width - PADDING} y2={label.y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2"/>
                        <text x={PADDING - 10} y={label.y + 3} textAnchor="end" fontSize="10" fill="currentColor">
                           {label.value.toFixed(4)}%
                        </text>
                    </g>
                ))}

                {/* X-axis grid lines and labels */}
                {xLabels.map(label => (
                    <g key={label.value} className="text-gray-500">
                         <line x1={label.x} y1={PADDING} x2={label.x} y2={height - PADDING} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2"/>
                        <text x={label.x} y={height - PADDING + 20} textAnchor="middle" fontSize="10" fill="currentColor">
                           {label.value}
                        </text>
                    </g>
                ))}

                 {/* Axes lines */}
                <line x1={PADDING} y1={PADDING} x2={PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />
                <line x1={PADDING} y1={height - PADDING} x2={width - PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />

                {/* Zero line */}
                {yMin < 0 && yMax > 0 &&
                    <line x1={PADDING} y1={toSvgY(0)} x2={width - PADDING} y2={toSvgY(0)} stroke="#6B7280" strokeWidth="1" strokeDasharray="4,4"/>
                }

                {/* Data path */}
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

export default LineChart;
