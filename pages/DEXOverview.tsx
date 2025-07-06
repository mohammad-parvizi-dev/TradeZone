import React, { useState } from 'react';
import { ListIcon, ChartIcon } from '../components/icons';
import DEXRankings from '../components/dex/DEXRankings';
import AggregatedVolume from '../components/dex/AggregatedVolume';

type ActiveTab = 'rankings' | 'volume';

const TabButton: React.FC<{
    label: string;
    tabName: ActiveTab;
    Icon: React.ComponentType<{ className?: string }>;
    activeTab: ActiveTab;
    onClick: (tabName: ActiveTab) => void;
}> = ({ label, tabName, Icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
            ${activeTab === tabName
                ? 'text-white border-accent-blue'
                : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);


const DEXOverview: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('rankings');

    return (
        <div className="space-y-6">
             <h1 className="text-2xl font-semibold text-white">DEX Overview</h1>

            <div className="border-b border-border-dark">
                 <div className="flex items-center space-x-2">
                     <TabButton 
                        label="DEX Rankings"
                        tabName="rankings"
                        Icon={ListIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                     <TabButton 
                        label="Aggregated Trading Volume"
                        tabName="volume"
                        Icon={ChartIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                 </div>
            </div>
            
            <div className="mt-4">
                {activeTab === 'rankings' && <DEXRankings />}
                {activeTab === 'volume' && <AggregatedVolume />}
            </div>
        </div>
    );
};

export default DEXOverview;
