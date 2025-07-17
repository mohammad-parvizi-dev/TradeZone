import React from 'react';

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

interface BarChartProps {
    data: { label: string; value: number }[];
    className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, className }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-4">No data available.</div>;
    }
    
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className={`space-y-3 ${className}`}>
            {data.map((item) => (
                <div key={item.label} className="grid grid-cols-4 gap-2 items-center text-sm">
                    <div className="text-gray-300 truncate col-span-1" title={item.label}>
                        {item.label}
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                        <div className="w-full bg-secondary-dark rounded-full h-4">
                            <div
                                className="bg-accent-blue h-4 rounded-full transition-width duration-500 ease-in-out"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            ></div>
                        </div>
                        <div className="font-mono text-white w-24 text-right">
                            {formatLargeNumber(item.value)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BarChart;
