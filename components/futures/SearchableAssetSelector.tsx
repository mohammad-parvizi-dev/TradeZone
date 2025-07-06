import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDownIcon, SearchIcon } from '../icons';

interface SearchableAssetSelectorProps {
    allAssets: string[];
    popularAssets: string[];
    selectedAsset: string;
    onSelect: (asset: string) => void;
    className?: string;
}

const SearchableAssetSelector: React.FC<SearchableAssetSelectorProps> = ({ allAssets, popularAssets, selectedAsset, onSelect, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelect = (asset: string) => {
        onSelect(asset);
        setIsOpen(false);
        setSearchTerm('');
    };

    const filteredAssets = useMemo(() => {
        if (!searchTerm) {
            return popularAssets;
        }
        return allAssets.filter(asset =>
            asset.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allAssets, popularAssets]);

    const isLoading = allAssets.length === 0;

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="bg-secondary-dark border border-border-dark rounded-lg py-2 px-4 w-full flex justify-between items-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="font-medium">{isLoading ? 'Loading...' : selectedAsset}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !isLoading && (
                <div className="absolute z-10 top-full mt-2 w-full bg-secondary-dark border border-border-dark rounded-lg shadow-lg max-h-80 flex flex-col">
                    <div className="p-2 border-b border-border-dark">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-gray" />
                            <input
                                type="text"
                                placeholder="Search asset..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-primary-dark border border-border-dark rounded-md py-1.5 pl-9 pr-2 focus:outline-none focus:ring-1 focus:ring-accent-blue text-white text-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-1">
                        {filteredAssets.length > 0 ? (
                            filteredAssets.map(asset => (
                                <li
                                    key={asset}
                                    onClick={() => handleSelect(asset)}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-700 ${selectedAsset === asset ? 'bg-accent-blue text-white' : 'text-gray-300'}`}
                                >
                                    {asset}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-gray-500">No assets found.</li>
                        )}
                         {searchTerm && (
                             <li className="px-4 py-2 text-xs text-gray-500 text-center italic">
                                Showing {filteredAssets.length} results
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableAssetSelector;
