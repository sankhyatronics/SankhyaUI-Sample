import React from 'react';
import { useParams, useLocation } from 'react-router';
import { DynamicRenderer } from '@sankhyatronics/sankhya-ui';
import { usePageData } from '../hooks/usePageData';

/**
 * DynamicPage component handles rendering of pages based on the URL path.
 * It maps the URL path to a page ID used by the CMS API.
 * If a page is not found, it falls back to the 'not-found' CMS endpoint.
 */
export const DynamicPage: React.FC = () => {
    const { slug } = useParams<{ slug?: string }>();
    const location = useLocation();

    // Determine the initial pageId. If path is '/', use 'home'.
    const initialPageId = location.pathname === '/' ? 'home' : (slug || 'home');

    // State to track which page content we are currently showing
    const [activePageId, setActivePageId] = React.useState(initialPageId);

    // Reset activePageId when the URL path changes
    React.useEffect(() => {
        setActivePageId(initialPageId);
    }, [initialPageId]);

    const { data, loading, error } = usePageData(activePageId);

    // If there's an error and we haven't tried the 'not-found' page yet, fall back to it
    React.useEffect(() => {
        if (error && activePageId !== 'not-found') {
            setActivePageId('not-found');
        }
    }, [error, activePageId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If even the 'not-found' page fails, show a generic error message
    if (error && activePageId === 'not-found') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-4xl font-bold text-primary-600 mb-4">404</h1>
                <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
                <p className="text-gray-600 max-w-md">
                    We're sorry, the page you're looking for doesn't exist.
                    Additionally, we encountered an error while trying to load the custom error page.
                </p>
                <a href="/" className="mt-8 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">
                    Back to Home
                </a>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={`page-${activePageId}`}>
            {data.map((section, index) => (
                <DynamicRenderer
                    key={index}
                    config={section.data || section.Data}
                />
            ))}
        </div>
    );
};
