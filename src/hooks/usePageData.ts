import { useState, useEffect } from 'react';
import { cmsApiFetchers } from '../api/cmsApiService';
import { useUser } from '../contexts/UserContext';

export interface PageSection {
    type: string;
    data: any;
}

export interface SectionConfig {
    Title?: string;
    title?: string;
    Data?: {
        type: string;
        data?: any;
    };
    data?: {
        type: string;
        data?: any;
    };
}

export function usePageData(pageId: string) {
    const [data, setData] = useState<SectionConfig[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { language } = useUser();

    useEffect(() => {
        async function fetchPage() {
            setLoading(true);
            setError(null);
            try {
                // Use the page fetcher with the current language
                const result = await cmsApiFetchers.getPage(pageId, language);
                setData(result);
            } catch (err: any) {
                console.error('Failed to fetch page data:', err);
                setError(err.message || 'Failed to load page');
            } finally {
                setLoading(false);
            }
        }

        if (pageId) {
            fetchPage();
        }
    }, [pageId, language]);

    return { data, loading, error };
}
