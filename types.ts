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
  inheritanceShare?: number; // 상속 비율 (%) - 기존 코드 호환성 유지
  notes?: string; // 추가 메모 - 기존 코드 호환성 유지
}

// Beneficiary는 Verifier와 동일한 구조로 통합
export type Beneficiary = Verifier;

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
  beneficiaries?: Beneficiary[]; // 상속자 목록
}

export type AssetType = 'BankAccount' | 'CryptoWallet' | 'SecretNote';

export interface BaseAsset {
  id: string;
  type: AssetType;
  name: string;
  tags: string[];                    // 해시태그 (#주계좌 #비상금 등)
  importance: 'high' | 'medium' | 'low';  // 중요도
  isLocked: boolean;                 // 잠금 상태
  password?: string;                 // 개별 비밀번호
  recoveryEmail?: string;            // 복구용 이메일
  maskedView?: boolean;              // 마스킹 표시 여부
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
