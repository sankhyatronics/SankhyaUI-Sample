import React from 'react';
import { Footer, DropdownProvider, DynamicRenderer } from '@sankhyatronics/sankhya-ui';
import { Outlet } from 'react-router';
import { cmsApiFetchers } from '../api/cmsApiService';
import { useUser } from '../contexts/UserContext';

export const Shell: React.FC = () => {
    const [headerData, setHeaderData] = React.useState<any>(null);
    const [footerData, setFooterData] = React.useState<any>(null);
    const { language, setLanguage, toggleTheme } = useUser();

    const handlers = {
        onThemeChangeClick: () => {
            toggleTheme();
        },
        onLanguageChangeToEn: () => {
            setLanguage('en'); window.location.reload()
        },
        onLanguageChangeToDk: () => {
            setLanguage('dk'); window.location.reload()
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const header = await cmsApiFetchers.getHeader(language);
                const footer = await cmsApiFetchers.getFooter(language);
                setHeaderData(header);
                setFooterData(footer?.data || footer);
            } catch (e) {
                console.error("Failed to load shell data", e);
            }
        };
        fetchData();
    }, [language]);

    return (
        <div className="flex flex-col min-h-screen bg-primary">
            <DropdownProvider>
                <DynamicRenderer config={headerData} handlers={handlers} />
            </DropdownProvider>
            <main className="flex-1 w-full">
                <Outlet />
            </main>

            {footerData && (
                <Footer
                    {...footerData}
                />
            )}
        </div>
    );
};
