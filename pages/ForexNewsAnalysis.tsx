
import React, { useState, useEffect, useMemo } from 'react';
import { FinnhubNews } from '../types';
import { fetchWithCache } from '../utils/api';
import { FINNHUB_API_KEY } from '../constants';

const FILTERS: Record<string, string[]> = {
    'All': [],
    'Central Banks': ['fomc', 'ecb', 'boj', 'boe', 'rba', 'rbnz', 'boc', 'snb', 'interest rate', 'monetary policy', 'central bank'],
    'Inflation': ['inflation', 'cpi', 'ppi', 'consumer price index', 'producer price index'],
    'Growth & GDP': ['gdp', 'growth', 'gross domestic product', 'pmi', 'manufacturing', 'services'],
    'Geopolitics': ['war', 'election', 'trade deal', 'sanction', 'conflict', 'geopolitical'],
};

const NewsCard: React.FC<{ article: FinnhubNews }> = ({ article }) => (
    <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-primary-dark p-6 rounded-lg hover:bg-secondary-dark transition-colors duration-200 border border-border-dark flex flex-col"
    >
        <div className="flex-grow">
            {article.image && (
                <img src={article.image} alt={article.headline} className="w-full h-40 object-cover rounded-md mb-4" />
            )}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-semibold text-accent-blue">{article.source}</span>
                <span>{new Date(article.datetime * 1000).toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-3">{article.headline}</h3>
            <p className="text-sm text-gray-300 line-clamp-4">{article.summary}</p>
        </div>
        <div className="mt-4 text-sm font-semibold text-accent-blue hover:underline">
            Read More &rarr;
        </div>
    </a>
);

const ForexNewsAnalysis: React.FC = () => {
    const [articles, setArticles] = useState<FinnhubNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('All');

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch general forex news first, which is usually of high quality
                const forexNews = await fetchWithCache<FinnhubNews[]>(
                    'finnhub-forex-news',
                    `https://finnhub.io/api/v1/news?category=forex&token=${FINNHUB_API_KEY}`,
                    900 // 15 minute cache
                );
                
                // Fetch broader economic news to find other relevant articles
                const economicNews = await fetchWithCache<FinnhubNews[]>(
                    'finnhub-economic-news',
                    `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`,
                    900
                );
                
                // Merge and remove duplicates
                const allNews = new Map<number, FinnhubNews>();
                [...forexNews, ...economicNews].forEach(article => {
                    if (article.summary) { // Only include articles with summaries
                         allNews.set(article.id, article)
                    }
                });

                setArticles(Array.from(allNews.values()));
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred while fetching news.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const filteredArticles = useMemo(() => {
        if (activeFilter === 'All') {
            return articles;
        }
        const keywords = FILTERS[activeFilter];
        return articles.filter(article => {
            const content = `${article.headline.toLowerCase()} ${article.summary.toLowerCase()}`;
            return keywords.some(keyword => content.includes(keyword));
        });
    }, [articles, activeFilter]);

    if (loading) return <div className="text-center p-8 text-gray-400">Loading Forex News...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Forex News & Analysis</h1>
            <p className="text-gray-400 max-w-4xl">
                A curated feed of macroeconomic and geopolitical news influencing the Forex market.
            </p>

            <div className="flex flex-wrap gap-2 items-center border-b border-border-dark pb-4">
                 <span className="text-sm font-medium text-gray-400 mr-2">Filter by:</span>
                {Object.keys(FILTERS).map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            activeFilter === filter 
                                ? 'bg-accent-blue text-white font-semibold' 
                                : 'bg-secondary-dark text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredArticles.length > 0 ? (
                    filteredArticles.slice(0, 50).map(article => <NewsCard key={article.id} article={article} />)
                ) : (
                    <div className="md:col-span-2 xl:col-span-3 text-center py-16 text-gray-500">
                        No articles found for the filter "{activeFilter}".
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForexNewsAnalysis;
