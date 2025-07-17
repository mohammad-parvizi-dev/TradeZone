import React from 'react';
import TotalTvlChart from '../components/defi/TotalTvlChart';
import TvlByChainChart from '../components/defi/TvlByChainChart';

const DeFiHealthDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">DeFi Health Dashboard</h1>
      <p className="text-gray-400">
        A macro overview of the decentralized finance ecosystem's size and health, powered by DefiLlama data.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TotalTvlChart />
        </div>
        <div className="lg:col-span-2">
          <TvlByChainChart />
        </div>
      </div>
    </div>
  );
};

export default DeFiHealthDashboard;
