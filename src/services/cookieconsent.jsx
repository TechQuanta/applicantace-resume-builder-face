// src/components/CookieConsent.jsx
import React, { useState, useEffect, useCallback } from 'react';


const COOKIE_CONSENT_KEY = 'userCookieConsent';
const COOKIE_LIFESPAN_DAYS = 365; // Consent valid for 1 year

const CookieConsent = ({ children }) => {
    const [consentState, setConsentState] = useState(null); // null means not yet checked/decided
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true, // Essential cookies are always true and non-toggleable
        analytics: false,
        marketing: false,
        functional: false,
    });

    // THIS IS CRUCIAL: Dynamically load/enable scripts based on consent
    // Use useCallback to memoize this function and prevent unnecessary re-creations
    const loadScriptsBasedOnConsent = useCallback((currentPreferences) => {
        console.log("Loading scripts based on consent:", currentPreferences);

        // --- Google Analytics Example ---
        // Ensure this logic is only run once per consent decision
        if (currentPreferences.analytics && !window._ga_loaded) {
            console.log("Analytics consent granted. Loading Google Analytics...");
            // Dynamically create script tag for Google Analytics
            const script = document.createElement('script');
            script.async = true;
            // IMPORTANT: Replace 'YOUR_GA_TRACKING_ID' with your actual Google Analytics ID
            script.src = `https://www.googletagmanager.com/gtag/js?id=YOUR_GA_TRACKING_ID`;
            document.head.appendChild(script);

            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'YOUR_GA_TRACKING_ID');
                window._ga_loaded = true; // Set a flag to prevent re-loading
            };
        } else if (!currentPreferences.analytics && window._ga_loaded) {
            console.log("Analytics consent revoked/not granted. Disabling GA if active.");
            // More advanced logic here to potentially disable GA or remove its cookies
            // (Often requires specific GA disable functions or Consent Mode in GTM)
        }

        // --- Marketing Scripts Example (e.g., Facebook Pixel) ---
        if (currentPreferences.marketing && !window._fb_pixel_loaded) {
            console.log("Marketing consent granted. Loading Facebook Pixel...");
            // Dynamically create script tag for Facebook Pixel
            // IMPORTANT: Replace 'YOUR_PIXEL_ID' with your actual Facebook Pixel ID
            // Example snippet (usually larger for full pixel):
            // const script = document.createElement('script');
            // script.async = true;
            // script.src = 'https://connect.facebook.net/en_US/fbevents.js';
            // document.head.appendChild(script);
            // script.onload = () => {
            //     window.fbq('init', 'YOUR_PIXEL_ID');
            //     window.fbq('track', 'PageView');
            //     window._fb_pixel_loaded = true;
            // };
        }

        // Add more conditional script loading logic for other categories (Functional, etc.)
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (storedConsent) {
            const { consentState: storedPreferences, timestamp } = JSON.parse(storedConsent);
            const now = new Date();
            const storedDate = new Date(timestamp);
            const daysSinceConsent = (now - storedDate) / (1000 * 60 * 60 * 24);

            if (daysSinceConsent < COOKIE_LIFESPAN_DAYS) {
                setPreferences(storedPreferences);
                setConsentState(true); // User previously granted consent
                loadScriptsBasedOnConsent(storedPreferences);
            } else {
                // Consent expired, show banner
                setConsentState(false);
            }
        } else {
            // No consent found, show banner
            setConsentState(false);
        }
    }, [loadScriptsBasedOnConsent]); // Include loadScriptsBasedOnConsent in dependency array

    // Function to set consent in localStorage and update state
    const storeConsent = (newPreferences) => {
        const consentData = {
            consentState: newPreferences,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
        setPreferences(newPreferences);
        setConsentState(true); // Consent is now granted
        setShowCustomizeModal(false); // Close modal if open
        loadScriptsBasedOnConsent(newPreferences);
    };

    const handleAcceptAll = () => {
        const newPreferences = { essential: true, analytics: true, marketing: true, functional: true };
        storeConsent(newPreferences);
    };

    const handleRejectAll = () => {
        const newPreferences = { essential: true, analytics: false, marketing: false, functional: false };
        storeConsent(newPreferences);
    };

    const handleSavePreferences = () => {
        storeConsent(preferences);
    };

    const handleCheckboxChange = (category) => (e) => {
        setPreferences(prev => ({
            ...prev,
            [category]: e.target.checked
        }));
    };

    // If consentState is null, it means we are still loading/checking localStorage
    if (consentState === null) {
        return null; // Don't render anything yet
    }

    // Render the banner or modal if consent is NOT granted
    if (consentState === false) {
        return (
            <div className="cookie-consent-overlay">
                <div className="cookie-consent-banner-wrapper"> {/* Wrapper for positioning */}
                    <div className="cookie-consent-banner">
                        <p>We use cookies to improve your experience and for analytics. For more details, see our <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                        <div className="cookie-banner-actions">
                            <button className="formal-button accept" onClick={handleAcceptAll}>Accept All</button>
                            <button className="formal-button reject" onClick={handleRejectAll}>Reject All</button>
                            <button className="formal-button customize" onClick={() => setShowCustomizeModal(true)}>Customize Settings</button>
                        </div>
                    </div>
                </div>

                {showCustomizeModal && (
                    <div className="cookie-customize-modal">
                        <div className="cookie-modal-content">
                            <h2>Cookie Settings</h2>
                            <p className="modal-description">Select which types of cookies you'd like to allow. Essential cookies are required for site functionality.</p>

                            <div className="cookie-category">
                                <h3><input type="checkbox" checked disabled /> Essential Cookies</h3>
                                <p>These cookies are necessary for the website to function (e.g., user sessions, security). They cannot be disabled.</p>
                            </div>

                            <div className="cookie-category">
                                <h3>
                                    <input
                                        type="checkbox"
                                        id="cookie-analytics"
                                        checked={preferences.analytics}
                                        onChange={handleCheckboxChange('analytics')}
                                    /> Analytics Cookies
                                </h3>
                                <p>Allow us to collect anonymous data on how you use our app to improve its performance and features.</p>
                            </div>

                            <div className="cookie-category">
                                <h3>
                                    <input
                                        type="checkbox"
                                        id="cookie-marketing"
                                        checked={preferences.marketing}
                                        onChange={handleCheckboxChange('marketing')}
                                    /> Marketing Cookies
                                </h3>
                                <p>Used by advertising partners to show you relevant ads on other sites. Opting out will still show ads, but they will be less personalized.</p>
                            </div>

                            <div className="cookie-category">
                                <h3>
                                    <input
                                        type="checkbox"
                                        id="cookie-functional"
                                        checked={preferences.functional}
                                        onChange={handleCheckboxChange('functional')}
                                    /> Functional Cookies
                                </h3>
                                <p>Enable enhanced functionality and personalization, like remembering your preferences or specific settings.</p>
                            </div>

                            <div className="cookie-modal-actions">
                                <button className="formal-button save" onClick={handleSavePreferences}>Save Preferences</button>
                                <button className="formal-button cancel" onClick={() => setShowCustomizeModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Only render children (your App) if consent is granted
    return children;
};

export default CookieConsent;