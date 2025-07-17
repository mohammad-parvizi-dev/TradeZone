import React, { useState } from 'react';
import TopProtocolsByTvl from '../components/defi/TopProtocolsByTvl';
import TopProtocolsByRevenue from '../components/defi/TopProtocolsByRevenue';
import { ListIcon, ChartIcon } from '../components/icons'; // Assuming you have an icon for revenue/fees

const TabButton: React.FC<{
    label: string;
    tabName: 'tvl' | 'revenue';
    activeTab: 'tvl' | 'revenue';
    onClick: (tabName: 'tvl' | 'revenue') => void;
}> = ({ label, tabName, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
            ${activeTab === tabName
                ? 'text-white border-accent-blue'
                : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
            }`}
    >
        <ListIcon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);


const ProtocolRankings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tvl' | 'revenue'>('tvl');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Protocol Rankings</h1>
            <p className="text-gray-400">
                Compare and discover DeFi protocols ranked by key metrics like Total Value Locked and Revenue.
            </p>

            <div className="border-b border-border-dark">
                 <div className="flex items-center space-x-2">
                     <TabButton 
                        label="Top by TVL"
                        tabName="tvl"
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                     <TabButton 
                        label="Top by Revenue & Fees"
                        tabName="revenue"
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                 </div>
            </div>

            <div className="mt-4">
                {activeTab === 'tvl' && <TopProtocolsByTvl />}
                {activeTab === 'revenue' && <TopProtocolsByRevenue />}
            </div>
        </div>
    );
};

export default ProtocolRankings;