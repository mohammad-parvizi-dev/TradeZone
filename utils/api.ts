
interface Cache<T> {
  data: T;
  timestamp: number;
}

/**
 * Fetches data from a URL with caching capabilities using localStorage.
 *
 * @param cacheKey - A unique key for storing and retrieving the cached data.
 * @param url - The URL to fetch data from.
 * @param cacheDurationInSeconds - The duration in seconds for which the cache is valid.
 * @returns A promise that resolves to the fetched data.
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  url: string,
  cacheDurationInSeconds: number = 60
): Promise<T> {
  const cachedItem = localStorage.getItem(cacheKey);

  if (cachedItem) {
    try {
      const cache: Cache<T> = JSON.parse(cachedItem);
      const isCacheValid = (Date.now() - cache.timestamp) < cacheDurationInSeconds * 1000;
      if (isCacheValid) {
        // console.log(`[Cache HIT] Returning cached data for key: ${cacheKey}`);
        return cache.data;
      }
    } catch (e) {
      console.error(`Error parsing cache for key ${cacheKey}:`, e);
      localStorage.removeItem(cacheKey);
    }
  }

  // console.log(`[Cache MISS] Fetching new data for key: ${cacheKey}`);
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed for ${url}: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data: T = await response.json();

  const cacheEntry: Cache<T> = {
    data,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (e) {
    console.error(`Failed to write to localStorage for key ${cacheKey}:`, e);
  }

  return data;
}