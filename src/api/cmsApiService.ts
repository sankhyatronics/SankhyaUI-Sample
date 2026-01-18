const API_CONFIG = {
  baseUrl: './',
  // Cache duration in milliseconds (e.g., 5 minutes)
  cacheDuration: 5 * 60 * 1000
};

// Cache storage
const apiCache = new Map<string, { data: any, timestamp: number }>();

function isStoryFormat(data: any): boolean {
  return (data && typeof data === 'object' && 'title' in data && ('component' in data || 'args' in data));
}

function normalizeStoryData(data: any): any {
  if (data.args) return data.args;
  return data;
}

/**
 * Generic fetch wrapper with caching and error handling
 */
export async function cmsFetch<T>(endpoint: string, lang: string = 'en', options: { skipStoryNormalization?: boolean } = {}): Promise<T> {
  const url = `${API_CONFIG.baseUrl}/${lang}/${endpoint}`;
  const cacheKey = url + (options.skipStoryNormalization ? '_raw' : '');

  // Check cache
  const cached = apiCache.get(cacheKey);
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > API_CONFIG.cacheDuration;
    if (!isExpired) {
      return cached.data as T;
    }
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback or error handling logic could go here
      throw new Error(`CMS API Error: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();

    // AUTO-NORMALIZE: Handle Array (Storybook format)
    // This is critical because CMS files (Footer.json, Header.json) are arrays of stories.
    if (!options.skipStoryNormalization && Array.isArray(data)) {
      const story = data.find((item: any) => (item.Title === 'Default' || item.title === 'Default')) || data[0];
      const storyData = story?.Data || story?.data;
      if (storyData) {
        // Flatten logic: if Data contains nested type/data, spread the inner data up
        // This is required for DynamicRenderer to see 'children' at top level for Header processing
        const innerData = storyData.data || storyData.Data;
        if (storyData.type && innerData) {
          data = {
            ...innerData,
            type: storyData.type
          };
        } else {
          data = storyData;
        }
      }
    }

    // AUTO-NORMALIZE: If it's a "story" format from Storybook, extract the args.
    if (!options.skipStoryNormalization && isStoryFormat(data)) {
      data = normalizeStoryData(data);
    }

    // Update cache
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data as T;
  } catch (error) {
    console.error(`Failed to fetch CMS data from ${url}:`, error);
    throw error;
  }
}

/**
 * Helper to normalize nested data structures if necessary
 */
export function normalizeData<T>(response: any): T {
  return response.data || response;
}

// Typed fetchers for specific content
export const cmsApiFetchers = {
  getHeader: (lang: string = 'en') => cmsFetch<any>('header.json', lang),
  getFooter: (lang: string = 'en') => cmsFetch<any>('footer.json', lang),

  // Generic page fetcher
  getPage: (pageId: string, lang: string = 'en') => {
    // We expect the pageId to be the slug, so we just append .json
    const filename = `${pageId.toLowerCase()}.json`;

    // For pages (which are arrays of sections), we usually want the raw array
    // unless you specifically wrapped them in a story object. 
    return cmsFetch<any[]>(filename, lang, { skipStoryNormalization: true });
  },

  // Specific pages (shortcuts)
  getHome: (lang: string = 'en') => cmsApiFetchers.getPage('home', lang),
  getAbout: (lang: string = 'en') => cmsApiFetchers.getPage('about', lang),
  getServices: (lang: string = 'en') => cmsApiFetchers.getPage('services', lang),
};