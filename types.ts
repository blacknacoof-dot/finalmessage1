import type React from 'react';

export interface User {
  name: string;
  email: string;
  plan: 'Free' | 'Premium';
  subscription?: {
    planType: 'Monthly' | 'Annual' | 'Lifetime';
    status: 'active' | 'past_due';
    nextPaymentDate: string;
    paymentMethod: {
        type: 'Card' | 'Transfer';
        details: string;
    }
  } | null;
}

export interface Verifier {
  id: string;
  name: string;
  email: string;
  relationship: string;
  phone?: string;
  address?: string;
}

export interface Notary {
  id: string;
  name: string;
  email: string;
  firm: string;
  phone?: string;
  licenseNumber?: string;
  status: 'pending' | 'accepted';
}

export interface MediaFile {
  id:string;
  name: string;
  type: 'video' | 'audio';
  size: string;
  date: string;
}

export type AssetType = 'BankAccount' | 'CryptoWallet' | 'SecretNote';

export interface BaseAsset {
  id:string;
  type: AssetType;
  name: string;
  password?: string;
}

export interface BankAccountAsset extends BaseAsset {
    type: 'BankAccount';
    bankName: string;
    accountNumber: string;
    notes: string;
}

export interface CryptoWalletAsset extends BaseAsset {
    type: 'CryptoWallet';
    cryptoName: string;
    address: string;
    seedPhrase: string;
}

export interface SecretNoteAsset extends BaseAsset {
    type: 'SecretNote';
    content: string;
}

export type Asset = BankAccountAsset | CryptoWalletAsset | SecretNoteAsset;


// FIX: Add missing type definitions
export interface RoadmapPhase {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

export interface MonetizationFeature {
  title: string;
  price: string;
  implementationTime: string;
  differentiation: string;
  icon: React.ReactNode;
  status: string;
  statusColor: string;
}

interface Task {
  title: string;
  icon: React.ReactNode;
  details: string[];
}

export interface PriorityStep {
  title: string;
  timeline: string;
  tasks: Task[];
}

export interface MarketAnalysisItem {
  title: string;
  icon: React.ReactNode;
  content: string[] | { label: string; value: string }[];
}

export interface ActionItem {
  priority: number;
  title: string;
  category: string;
  icon: React.ReactNode;
  details: string[];
}

export interface B2BPartner {
  type: string;
  icon: React.ReactNode;
  description: string;
  benefits: string[];
}

export interface PartnerContactForm {
  title: string;
  subtitle: string;
  fields: {
    companyType: { label: string; placeholder: string; options: string[] };
    companyName: { label: string; placeholder: string };
    contactName: { label: string; placeholder: string };
    phone: { label: string; placeholder: string };
    mobile: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    inquiry: { label: string; placeholder: string };
  };
  submitButton: string;
  successMessage: string;
}

export interface PartnersPageData {
  title: string;
  subtitle: string;
  backToHome: string;
  partners: B2BPartner[];
  contactForm: PartnerContactForm;
}
