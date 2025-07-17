
import React, { useState, useEffect, useMemo } from 'react';
import { PeggedAsset } from '../../types';
import { fetchWithCache } from '../../utils/api';

// Constants
const STABLECOINS_TO_ANALYZE = ['USDT', 'USDC', 'DAI'];
const CHAIN_COLORS = [
    '#2563EB', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', 
    '#14B8A6', '#6366F1', '#D946EF', '#F97316', '#A855F7', '#64748B'
];

// Interfaces
interface ChartSegment {
    chain: string;
    value: number;
    color: string;
    yOffset: number; // For stacking
}

interface ChartBar {
    label: string; // e.g., 'USDT'
    total: number;
    segments: ChartSegment[];
}

// Helper to format numbers
const formatCompactCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);

// Tooltip component
const Tooltip: React.FC<{ hoveredData: { barLabel: string, segment: ChartSegment } | null; x: number; y: number }> = ({ hoveredData, x, y }) => {
    if (!hoveredData) return null;
    
    const { barLabel, segment } = hoveredData;

    const title = barLabel === 'Any'
        ? `Any on ${segment.chain}`
        : `${barLabel} on ${segment.chain}`;

    return (
        <div 
            className="absolute bg-secondary-dark text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none transition-opacity"
            style={{ left: x + 10, top: y + 10, zIndex: 50 }}
        >
            <div className="font-bold mb-1">{title}</div>
            <div>
                <span className="font-semibold">Market Cap: </span>
                <span>{formatCompactCurrency(segment.value)}</span>
            </div>
        </div>
    );
};


const DistributionChart: React.FC = () => {
    // State
    const [chartData, setChartData] = useState<ChartBar[]>([]);
    const [allChains, setAllChains] = useState<Map<string, string>>(new Map());
    const [chainTotals, setChainTotals] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredData, setHoveredData] = useState<{ barLabel: string, segment: ChartSegment } | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Data fetching and processing effect
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiData = await fetchWithCache<{ peggedAssets: PeggedAsset[] }>('llama-stables', 'https://stablecoins.llama.fi/stablecoins', 300);
                
                const targetAssets = apiData.peggedAssets.filter(asset => STABLECOINS_TO_ANALYZE.includes(asset.symbol));

                const calculatedChainTotals = new Map<string, number>();
                targetAssets.forEach(asset => {
                    if (asset.chainCirculating) {
                        Object.entries(asset.chainCirculating).forEach(([chain, data]) => {
                            const value = data.current?.peggedUSD || data.peggedUSD || data.circulating?.peggedUSD || 0;
                            const currentTotal = calculatedChainTotals.get(chain) || 0;
                            calculatedChainTotals.set(chain, currentTotal + value);
                        });
                    }
                });
                setChainTotals(calculatedChainTotals);

                const chainSet = new Set<string>();
                targetAssets.forEach(asset => {
                    if (asset.chainCirculating) {
                        Object.keys(asset.chainCirculating).forEach(chain => chainSet.add(chain));
                    }
                });

                const chainColorMap = new Map<string, string>();
                Array.from(chainSet).sort().forEach((chain, i) => { // Sort for consistent color assignment
                    chainColorMap.set(chain, CHAIN_COLORS[i % CHAIN_COLORS.length]);
                });
                setAllChains(chainColorMap);

                const processedData: ChartBar[] = STABLECOINS_TO_ANALYZE.map(symbol => {
                    const asset = targetAssets.find(a => a.symbol === symbol);
                    let total = 0;
                    
                    if (!asset || !asset.chainCirculating) {
                        return { label: symbol, total: 0, segments: [] };
                    }

                    const segments: Omit<ChartSegment, 'yOffset'>[] = Object.entries(asset.chainCirculating)
                        .map(([chain, data]) => {
                            // Corrected data parsing: Prioritize `current.peggedUSD` as per the provided API response.
                            const value = data.current?.peggedUSD || data.peggedUSD || data.circulating?.peggedUSD || 0;
                            return { chain, value, color: chainColorMap.get(chain)! };
                        })
                        .filter(s => s.value > 1000) // Filter out negligible amounts
                        .sort((a, b) => b.value - a.value);

                    const finalSegments: ChartSegment[] = [];
                    let currentOffset = 0;
                    segments.forEach(segment => {
                        total += segment.value;
                        finalSegments.push({ ...segment, yOffset: currentOffset });
                        currentOffset += segment.value;
                    });
                    
                    return { label: symbol, total, segments: finalSegments };
                });

                setChartData(processedData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const yAxisMax = useMemo(() => {
        if (chartData.length === 0) return 0;
        const max = Math.max(...chartData.map(bar => bar.total));
        return max > 0 ? Math.ceil(max / 20_000_000_000) * 20_000_000_000 : 100_000_000_000; // Round up to nearest 20B, provide a default if max is 0
    }, [chartData]);
    
    // SVG Dimensions & Scales
    const width = 800;
    const height = 450;
    const padding = { top: 50, right: 150, bottom: 50, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const xScale = (index: number) => padding.left + (chartWidth / chartData.length) * index;
    const yScale = (value: number) => padding.top + chartHeight - (value / yAxisMax) * chartHeight;
    const barWidth = (chartWidth / chartData.length) * 0.6;
    
    const yAxisLabels = useMemo(() => {
        if (yAxisMax === 0) return [];
        const ticks = 5;
        return Array.from({ length: ticks + 1 }, (_, i) => {
            const value = (yAxisMax / ticks) * i;
            return { value, y: yScale(value) };
        });
    }, [yAxisMax, yScale]);


    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    if (isLoading) return <div className="h-[450px] flex items-center justify-center text-gray-400">Loading Distribution Chart...</div>;
    if (error) return <div className="h-[450px] flex items-center justify-center text-red-500">Error: {error}</div>;

    return (
        <div className="relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredData(null)}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Y Axis */}
                {yAxisLabels.map(label => (
                    <g key={label.value} className="text-gray-600">
                        <line x1={padding.left - 5} y1={label.y} x2={width - padding.right} y2={label.y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2"/>
                        <text x={padding.left - 10} y={label.y + 4} textAnchor="end" fontSize="12" fill="currentColor">
                           {formatCompactCurrency(label.value)}
                        </text>
                    </g>
                ))}
                
                {/* Bars */}
                {chartData.map((bar, barIndex) => (
                    <g key={bar.label}>
                        {bar.segments.map((segment) => (
                            <rect
                                key={segment.chain}
                                x={xScale(barIndex) + (chartWidth / chartData.length - barWidth) / 2}
                                y={yScale(segment.yOffset + segment.value)}
                                width={barWidth}
                                height={yScale(0) - yScale(segment.value)}
                                fill={segment.color}
                                onMouseEnter={() => setHoveredData({ barLabel: bar.label, segment })}
                                onMouseLeave={() => setHoveredData(null)}
                                className="transition-opacity duration-200"
                                style={{ opacity: hoveredData && (hoveredData.barLabel !== bar.label || hoveredData.segment.chain !== segment.chain) ? 0.7 : 1 }}
                            />
                        ))}
                        {/* X Axis Label */}
                        <text x={xScale(barIndex) + chartWidth / (chartData.length * 2)} y={height - padding.bottom + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">
                            {bar.label}
                        </text>
                    </g>
                ))}

                {/* Legend */}
                <g transform={`translate(${width - padding.right + 20}, ${padding.top})`}>
                    {Array.from(allChains.entries()).map(([chain, color], index) => (
                         <g key={chain} transform={`translate(0, ${index * 20})`}
                            onMouseEnter={() => {
                                const totalValue = chainTotals.get(chain) || 0;
                                setHoveredData({ barLabel: 'Any', segment: { chain, value: totalValue, color: '', yOffset: 0 } });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                            className="cursor-pointer"
                         >
                            <rect x="0" y="0" width="12" height="12" fill={color} rx="2"/>
                            <text x="20" y="10" fontSize="12" fill="#D1D5DB"
                                style={{ opacity: hoveredData && hoveredData.segment.chain && hoveredData.segment.chain !== chain ? 0.5 : 1}}
                            >
                                {chain}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
            <Tooltip hoveredData={hoveredData} x={mousePosition.x} y={mousePosition.y} />
        </div>
    );
};

export default DistributionChart;
