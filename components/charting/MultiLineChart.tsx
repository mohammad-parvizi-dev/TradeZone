import React from 'react';

interface ChartDataPoint {
    timestamp: number;
    value: number;
}

interface Dataset {
    label: string;
    data: ChartDataPoint[];
    color: string;
}

interface ReferenceLine {
    value: number;
    label: string;
    color: string;
}

interface MultiLineChartProps {
    datasets: Dataset[];
    refLines?: ReferenceLine[];
    height?: number;
    className?: string;
    yAxisMin?: number;
    yAxisMax?: number;
}

const MultiLineChart: React.FC<MultiLineChartProps> = ({ datasets, refLines, height = 400, className, yAxisMin, yAxisMax }) => {
    const width = 800; // Fixed aspect ratio basis

    if (!datasets || datasets.length === 0 || datasets.some(ds => ds.data.length < 2)) {
        return <div style={{ height }} className="flex items-center justify-center text-gray-500">Not enough data to display chart.</div>;
    }

    const PADDING = 60;

    const allValues = datasets.flatMap(ds => ds.data.map(d => d.value));
    const allTimestamps = datasets.flatMap(ds => ds.data.map(d => d.timestamp));

    const yMin = yAxisMin !== undefined ? yAxisMin : Math.min(...allValues);
    const yMax = yAxisMax !== undefined ? yAxisMax : Math.max(...allValues);
    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

    const xMin = Math.min(...allTimestamps);
    const xMax = Math.max(...allTimestamps);
    const xRange = xMax - xMin === 0 ? 1 : xMax - xMin;

    const toSvgX = (timestamp: number) => PADDING + ((timestamp - xMin) / xRange) * (width - PADDING * 2);
    const toSvgY = (value: number) => (height - PADDING) - ((value - yMin) / yRange) * (height - PADDING * 2);

    const yLabels = Array.from({ length: 6 }, (_, i) => {
        const value = yMin + (yRange / 5) * i;
        return { value, y: toSvgY(value) };
    });

    const xLabels = Array.from({ length: 5 }, (_, i) => {
        const timestamp = xMin + (xRange / 4) * i;
        return { value: new Date(timestamp).toLocaleDateString(), x: toSvgX(timestamp) };
    });

    return (
        <div className={`relative ${className}`}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                {/* Y-axis grid lines and labels */}
                {yLabels.map(({ value, y }) => (
                    <g key={`y-label-${value}`} className="text-gray-600">
                        <line x1={PADDING} y1={y} x2={width - PADDING} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                        <text x={PADDING - 8} y={y + 3} textAnchor="end" fontSize="10" fill="currentColor">${value.toFixed(4)}</text>
                    </g>
                ))}

                {/* X-axis labels */}
                {xLabels.map(({ value, x }) => (
                    <g key={`x-label-${value}`} className="text-gray-600">
                        <text x={x} y={height - PADDING + 20} textAnchor="middle" fontSize="10" fill="currentColor">{value}</text>
                    </g>
                ))}

                {/* Axes lines */}
                <line x1={PADDING} y1={PADDING/2} x2={PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />
                <line x1={PADDING} y1={height - PADDING} x2={width - PADDING} y2={height - PADDING} stroke="#4B5563" strokeWidth="1" />

                {/* Reference Lines */}
                {refLines?.map(line => (
                    <g key={line.label}>
                        <line x1={PADDING} y1={toSvgY(line.value)} x2={width - PADDING} y2={toSvgY(line.value)} stroke={line.color} strokeWidth="1" strokeDasharray="4,4"/>
                    </g>
                ))}
                
                {/* Data paths */}
                {datasets.map(ds => {
                    const pathData = ds.data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.timestamp).toFixed(2)} ${toSvgY(p.value).toFixed(2)}`).join(' ');
                    return <path key={ds.label} d={pathData} fill="none" stroke={ds.color} strokeWidth="2" />;
                })}

                {/* Legend */}
                <g transform={`translate(${PADDING}, 10)`}>
                    {datasets.map((ds, i) => (
                        <g key={ds.label} transform={`translate(${i * 80}, 0)`}>
                           <circle cx="0" cy="0" r="4" fill={ds.color} />
                           <text x="10" y="4" fontSize="12" fill="#D1D5DB">{ds.label}</text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default MultiLineChart;
