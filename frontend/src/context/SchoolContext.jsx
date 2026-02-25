import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/api';

const SchoolContext = createContext();

export const useSchool = () => {
    const context = useContext(SchoolContext);
    if (!context) {
        throw new Error('useSchool must be used within a SchoolProvider');
    }
    return context;
};

export const SchoolProvider = ({ children }) => {
    const [schoolSettings, setSchoolSettings] = useState({
        school_name: 'SMKN 2 SINGOSARI',
        school_logo_url: null,
        school_mascot_url: null,
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await apiService.getPublicSettings();
            if (response.data) {
                setSchoolSettings({
                    school_name: response.data.school_name || 'SMKN 2 SINGOSARI',
                    school_logo_url: response.data.school_logo_url,
                    school_mascot_url: response.data.school_mascot_url,
                });
            }
        } catch (error) {
            console.error('Failed to fetch public school settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = () => {
        fetchSettings();
    };

    return (
        <SchoolContext.Provider value={{ ...schoolSettings, loading, refreshSettings }}>
            {children}
        </SchoolContext.Provider>
    );
};
