import React from 'react';
import YieldAggregator from '../components/yield/YieldAggregator';

const YieldOpportunities: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Yield Opportunities Aggregator</h1>
      <p className="text-gray-400 max-w-4xl">
        Discover, search, and compare thousands of yield farming opportunities across the DeFi landscape. 
        This powerful tool, powered by DefiLlama, allows you to filter by chain, protocol, asset, APY, and liquidity to find the perfect strategy.
      </p>
      <YieldAggregator />
    </div>
  );
};

export default YieldOpportunities;