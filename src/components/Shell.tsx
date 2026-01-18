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
            setLanguage('en');
        },
        onLanguageChangeToDk: () => {
            setLanguage('dk');
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const header = await cmsApiFetchers.getHeader(language);
                const footer = await cmsApiFetchers.getFooter(language);

                // Clone data to ensure new references and trigger rerenders
                const updatedHeader = JSON.parse(JSON.stringify(header));
                const updatedFooter = JSON.parse(JSON.stringify(footer?.data || footer));

                // Inject current language as defaultValue and value for the language selector
                const findAndSetLanguage = (config: any) => {
                    if (!config || typeof config !== 'object') return;

                    if (Array.isArray(config)) {
                        config.forEach(child => findAndSetLanguage(child));
                        return;
                    }

                    // Check if this component is the language selector
                    if (config.id === 'select-language' || config.data?.id === 'select-lang' || config.type === 'Select') {
                        // Double check if it's the language selection one by checking options if possible
                        // const isLangSelect = config.data?.options?.some((opt: any) => opt.value === 'en' || opt.value === 'dk');
                        if (config.id === 'select-language' || config.data?.id === 'select-lang') {
                            config.value = language;
                            config.defaultValue = language;
                            if (config.data) {
                                config.data.value = language;
                                config.data.defaultValue = language;
                            }
                        }
                    }

                    // Recurse into children and items
                    if (config.children) findAndSetLanguage(config.children);
                    if (config.data?.children) findAndSetLanguage(config.data.children);
                    if (config.data?.items) findAndSetLanguage(config.data.items);
                };

                findAndSetLanguage(updatedHeader);

                setHeaderData(updatedHeader);
                setFooterData(updatedFooter);
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
