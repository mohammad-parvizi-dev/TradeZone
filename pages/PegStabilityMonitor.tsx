import React from 'react';
import PegComparisonChart from '../components/stablecoins/PegComparisonChart';
import DepegEventLog from '../components/stablecoins/DepegEventLog';

const PegStabilityMonitor: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-white">Peg Stability Monitor</h1>
                <p className="text-gray-400 mt-2 max-w-4xl">
                    Real-time and historical analysis of major stablecoin pegs against their target value. This view helps in quickly assessing market risk and stability by highlighting deviations from the $1 peg.
                </p>
            </div>

            <div className="bg-primary-dark p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Comparative Price Chart</h2>
                <p className="text-gray-400 mb-6">
                    This chart shows the price of major stablecoins over the last 30 days, centered around the $1.00 mark to visualize peg stability and deviations.
                </p>
                <PegComparisonChart />
            </div>

            <div className="bg-primary-dark p-6 rounded-lg">
                 <h2 className="text-xl font-semibold text-white mb-4">De-peg Event Log</h2>
                 <p className="text-gray-400 mb-6">
                    An automated analysis of historical price data to identify and score significant de-pegging events (periods where the price was sustainably below $0.995).
                 </p>
                <DepegEventLog />
            </div>
        </div>
    );
};

export default PegStabilityMonitor;
