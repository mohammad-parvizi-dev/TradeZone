import React, { useState } from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

const formatLargeNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  
  const width = 400;
  const height = 250;
  const radius = Math.min(width, height) / 2 - 10;
  const innerRadius = radius * 0.6;
  const centerX = width / 2;
  const centerY = height / 2;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  let startAngle = -Math.PI / 2;

  const getArcPath = (startAngle: number, endAngle: number) => {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

    const innerStartX = centerX + innerRadius * Math.cos(endAngle);
    const innerStartY = centerY + innerRadius * Math.sin(endAngle);
    const innerEndX = centerX + innerRadius * Math.cos(startAngle);
    const innerEndY = centerY + innerRadius * Math.sin(startAngle);

    return [
      `M ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${innerStartX} ${innerStartY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}`,
      'Z',
    ].join(' ');
  };

  const hoveredData = data.find(item => item.label === hoveredSegment);

  return (
    <div className="flex flex-col md:flex-row items-center h-full">
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <g transform={`translate(${centerX}, ${centerY})`}>
             {data.map((item) => {
              const angle = (item.value / total) * 2 * Math.PI;
              const endAngle = startAngle + angle;
              const path = getArcPath(startAngle, endAngle);
              const currentAngle = startAngle;
              startAngle = endAngle;

              return (
                <path
                  key={item.label}
                  d={path}
                  fill={item.color}
                  onMouseEnter={() => setHoveredSegment(item.label)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="transition-opacity duration-200"
                  style={{ opacity: hoveredSegment && hoveredSegment !== item.label ? 0.5 : 1 }}
                />
              );
            })}
          </g>
           <text x={centerX} y={centerY} textAnchor="middle" dy=".3em" className="fill-current text-white font-bold text-2xl">
            {hoveredData ? formatLargeNumber(hoveredData.value) : formatLargeNumber(total)}
          </text>
          <text x={centerX} y={centerY + 24} textAnchor="middle" dy=".3em" className="fill-current text-gray-400 text-sm">
            {hoveredData ? hoveredData.label : 'Total TVL'}
          </text>
        </svg>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[250px] w-full md:w-auto md:ml-4">
        <ul className="space-y-2 text-sm">
          {data.map((item) => (
            <li 
              key={item.label} 
              className="flex items-center justify-between p-2 rounded-md transition-all"
              onMouseEnter={() => setHoveredSegment(item.label)}
              onMouseLeave={() => setHoveredSegment(null)}
              style={{ backgroundColor: hoveredSegment === item.label ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
            >
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-300">{item.label}</span>
              </div>
              <span className="font-mono text-white">
                {((item.value / total) * 100).toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DonutChart;
