import React from 'react';
import DistributionChart from '../components/stablecoins/DistributionChart';

const DistributionAnalysis: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Stablecoin Distribution Analysis</h1>
            <p className="text-gray-400 max-w-4xl">
                This chart shows the distribution of major stablecoin supplies across different blockchains. 
                Each bar represents a stablecoin, and the stacked segments within each bar show the portion of its total market cap on a specific chain. 
                This helps visualize the concentration and multi-chain presence of each asset.
            </p>

            <div className="bg-primary-dark p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Market Cap by Chain</h2>
                <DistributionChart />
            </div>
        </div>
    );
};

export default DistributionAnalysis;
