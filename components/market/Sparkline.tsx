import React from 'react';

interface SparklineProps {
    data: number[];
    className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, className }) => {
    if (!data || data.length < 2) {
        return <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No data</div>;
    }

    const width = 128;
    const height = 40;

    const yMin = Math.min(...data);
    const yMax = Math.max(...data);
    const xStep = width / (data.length - 1);
    
    const isPositive = data[data.length - 1] >= data[0];
    const color = isPositive ? '#22C55E' : '#EF4444'; // green-500, red-500

    const pathData = data
        .map((point, i) => {
            const x = i * xStep;
            const y = height - ((point - yMin) / (yMax - yMin)) * height;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');
    
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
        >
            <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Sparkline;
