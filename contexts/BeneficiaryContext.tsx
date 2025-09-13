import React, { createContext, useContext, useState, useEffect } from 'react';
import { Beneficiary } from '../types';
import { useLocalStorage } from '../App';

interface BeneficiaryContextType {
    globalBeneficiaries: Beneficiary[];
    setGlobalBeneficiaries: (beneficiaries: Beneficiary[]) => void;
    addGlobalBeneficiary: (beneficiary: Beneficiary) => void;
    updateGlobalBeneficiary: (id: string, beneficiary: Beneficiary) => void;
    deleteGlobalBeneficiary: (id: string) => void;
}

const BeneficiaryContext = createContext<BeneficiaryContextType | undefined>(undefined);

export const BeneficiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [globalBeneficiaries, setGlobalBeneficiaries] = useLocalStorage<Beneficiary[]>('finalmessage_global_beneficiaries', []);

    const addGlobalBeneficiary = (beneficiary: Beneficiary) => {
        setGlobalBeneficiaries(prev => [...prev, beneficiary]);
    };

    const updateGlobalBeneficiary = (id: string, beneficiary: Beneficiary) => {
        setGlobalBeneficiaries(prev => 
            prev.map(b => b.id === id ? beneficiary : b)
        );
    };

    const deleteGlobalBeneficiary = (id: string) => {
        setGlobalBeneficiaries(prev => prev.filter(b => b.id !== id));
    };

    return (
        <BeneficiaryContext.Provider value={{
            globalBeneficiaries,
            setGlobalBeneficiaries,
            addGlobalBeneficiary,
            updateGlobalBeneficiary,
            deleteGlobalBeneficiary
        }}>
            {children}
        </BeneficiaryContext.Provider>
    );
};

export const useBeneficiaries = () => {
    const context = useContext(BeneficiaryContext);
    if (context === undefined) {
        throw new Error('useBeneficiaries must be used within a BeneficiaryProvider');
    }
    return context;
};