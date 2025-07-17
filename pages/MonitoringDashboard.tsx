import React, { useState } from 'react';
import StablecoinsTable from '../components/stablecoins/StablecoinsTable';
import StablecoinMarketCapChart from '../components/stablecoins/StablecoinMarketCapChart';
import OverallMarketStats from '../components/monitoring/OverallMarketStats';
import DerivativesStats from '../components/monitoring/DerivativesStats';
import { ListIcon, ChartIcon, AnalysisIcon, TradingToolsIcon } from '../components/icons';

type ActiveTab = 'table' | 'chart' | 'overall' | 'derivatives';

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

const MonitoringDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('table');

    const renderContent = () => {
        switch (activeTab) {
            case 'table':
                return <StablecoinsTable />;
            case 'chart':
                return <StablecoinMarketCapChart />;
            case 'overall':
                return <OverallMarketStats />;
            case 'derivatives':
                return <DerivativesStats />;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Market Monitoring Dashboard</h1>
            <p className="text-gray-400 max-w-4xl">A multi-faceted overview of the crypto ecosystem, from stablecoin liquidity to derivatives market health. Data is sourced from DefiLlama and CoinGecko.</p>
            
            <div className="border-b border-border-dark">
                <div className="flex items-center space-x-2 flex-wrap">
                    <TabButton 
                        label="Top Stablecoins" 
                        tabName="table" 
                        Icon={ListIcon} 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                    />
                    <TabButton 
                        label="Stablecoin Analysis" 
                        tabName="chart" 
                        Icon={ChartIcon} 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                    />
                     <TabButton 
                        label="Overall Market Snapshot" 
                        tabName="overall" 
                        Icon={AnalysisIcon} 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                    />
                    <TabButton 
                        label="Derivatives Health" 
                        tabName="derivatives" 
                        Icon={TradingToolsIcon} 
                        activeTab={activeTab} 
                        onClick={setActiveTab} 
                    />
                </div>
            </div>

            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default MonitoringDashboard;