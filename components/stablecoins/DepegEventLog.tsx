
import React, { useState, useEffect, useMemo } from 'react';
import { InfoIcon } from '../icons';
import { fetchWithCache } from '../../utils/api';

const STABLECOINS_TO_ANALYZE = [
  { id: 'tether', name: 'Tether (USDT)' },
  { id: 'usd-coin', name: 'USD Coin (USDC)' },
  { id: 'dai', name: 'Dai (DAI)' },
  { id: 'true-usd', name: 'TrueUSD (TUSD)' },
  { id: 'frax', name: 'Frax (FRAX)' }
];

interface DepegEvent {
    startTime: string;
    duration: string;
    depth: string;
    severityScore: string;
}

const DepegEventLog: React.FC = () => {
    const [selectedCoin, setSelectedCoin] = useState(STABLECOINS_TO_ANALYZE[0]);
    const [events, setEvents] = useState<DepegEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedCoin.id) return;

        const analyzeDepeg = async (coinId: string) => {
            setIsLoading(true);
            setError(null);
            setEvents([]);

            try {
                const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90`;
                const data = await fetchWithCache<{ prices: [number, number][] }>(`cg-chart-90d-${coinId}`, url, 600);
                
                if (!data.prices || !Array.isArray(data.prices)) {
                    throw new Error("Invalid price data from API.");
                }

                const prices: [number, number][] = data.prices;
                const depegThreshold = 0.995;
                const minDurationMs = 1 * 60 * 60 * 1000; // 1 hour
                let depegEvents: DepegEvent[] = [];
                let currentEvent: { start: number, minPrice: number, end: number } | null = null;

                for (const [timestamp, price] of prices) {
                    if (price < depegThreshold && currentEvent === null) {
                        currentEvent = { start: timestamp, minPrice: price, end: timestamp };
                    } else if (price < depegThreshold && currentEvent !== null) {
                        currentEvent.end = timestamp;
                        if (price < currentEvent.minPrice) {
                            currentEvent.minPrice = price;
                        }
                    } else if (price >= depegThreshold && currentEvent !== null) {
                        if (currentEvent.end - currentEvent.start >= minDurationMs) {
                            const durationHours = (currentEvent.end - currentEvent.start) / (1000 * 60 * 60);
                            const maxDepeg = 1 - currentEvent.minPrice;
                            const severityScore = (maxDepeg * 100) * durationHours;

                            depegEvents.push({
                                startTime: new Date(currentEvent.start).toISOString(),
                                duration: `${durationHours.toFixed(1)} hours`,
                                depth: currentEvent.minPrice.toFixed(4),
                                severityScore: severityScore.toFixed(2),
                            });
                        }
                        currentEvent = null;
                    }
                }
                
                if (currentEvent && currentEvent.end - currentEvent.start >= minDurationMs) {
                     const durationHours = (currentEvent.end - currentEvent.start) / (1000 * 60 * 60);
                     const maxDepeg = 1 - currentEvent.minPrice;
                     const severityScore = (maxDepeg * 100) * durationHours;
                     depegEvents.push({
                         startTime: new Date(currentEvent.start).toISOString(),
                         duration: `${durationHours.toFixed(1)} hours`,
                         depth: currentEvent.minPrice.toFixed(4),
                         severityScore: severityScore.toFixed(2),
                     });
                }
                
                depegEvents.sort((a, b) => parseFloat(b.severityScore) - parseFloat(a.severityScore));
                setEvents(depegEvents);

            } catch (err: any) {
                console.error(`De-peg analysis failed for ${coinId}:`, err);
                setError(err.message || 'Analysis failed. The API might be rate-limiting requests.');
            } finally {
                setIsLoading(false);
            }
        };

        analyzeDepeg(selectedCoin.id);
    }, [selectedCoin]);
    
    return (
        <div className="space-y-4">
             <div>
                <label htmlFor="stablecoin-selector" className="block text-sm font-medium text-gray-300 mb-1">Select Stablecoin to Analyze</label>
                <select
                    id="stablecoin-selector"
                    value={selectedCoin.id}
                    onChange={(e) => setSelectedCoin(STABLECOINS_TO_ANALYZE.find(c => c.id === e.target.value)!)}
                    className="bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                >
                   {STABLECOINS_TO_ANALYZE.map(coin => (
                       <option key={coin.id} value={coin.id}>{coin.name}</option>
                   ))}
                </select>
            </div>

            {isLoading && (
                 <div className="text-center py-8 text-gray-400">Analyzing historical data for {selectedCoin.name}...</div>
            )}
            {error && (
                <div className="text-center py-8 text-red-500">Error: {error}</div>
            )}
            {!isLoading && !error && (
                <div className="overflow-x-auto">
                    {events.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No significant de-peg events found for {selectedCoin.name} in the last 90 days.</div>
                    ) : (
                         <table className="min-w-full divide-y divide-border-dark">
                            <thead className="bg-secondary-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time (UTC)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Lowest Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            Severity Score
                                            <span title="Calculated based on the depth and duration of the de-peg. Higher is more severe.">
                                                <InfoIcon tooltip="" className="w-4 h-4 text-gray-500 ml-1.5 cursor-help" />
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-primary-dark divide-y divide-border-dark">
                                {events.map(event => (
                                <tr key={event.startTime}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(event.startTime).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{event.duration}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono font-semibold text-red-400">${event.depth}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono font-semibold">{event.severityScore}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default DepegEventLog;
