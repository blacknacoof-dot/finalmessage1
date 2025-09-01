import React from 'react';
import type { RoadmapPhase, MonetizationFeature, PriorityStep, MarketAnalysisItem, ActionItem, PartnersPageData } from './types';
import { 
    VaultIcon, AutomationIcon, TrustIcon, PremiumIcon, MultimediaIcon, 
    BlockchainIcon, PaymentIcon, CloudIcon, AiIcon, TargetIcon, 
    RevenueIcon, B2BIcon, ShieldIcon, UxIcon, LegalIcon, KeyIcon, BanknotesIcon, HomeIcon
} from './components/icons';

interface AppData {
  roadmapPhases: RoadmapPhase[];
  monetizationFeatures: MonetizationFeature[];
  prioritySteps: PriorityStep[];
  marketAnalysis: MarketAnalysisItem[];
  actionItems: ActionItem[];
  partnersPage: PartnersPageData;
}

export const data: { [key: string]: AppData } = {
  en: {
    roadmapPhases: [
      {
        title: "Phase 1 (MVP+)",
        subtitle: "Universal Secure Vault (Messages, Assets, Secrets)",
        description: "Establish the core value by allowing users to securely store not just messages, but also digital assets (crypto keys, NFTs), financial information, and private secrets.",
        icon: <VaultIcon className="w-8 h-8 text-cyan-400" />
      },
      {
        title: "Phase 2 (Core Automation)",
        subtitle: "Automated & Encrypted Delivery System",
        description: "Implement 'guaranteed execution'. Develop verifier designation, an automated inactivity trigger, and utilize blockchain for secure, encrypted, and automated post-mortem delivery of the vault's contents.",
        icon: <AutomationIcon className="w-8 h-8 text-teal-400" />
      },
      {
        title: "Phase 3 (Trust & Expansion)",
        subtitle: "Blockchain, B2B Integration & Legal Services",
        description: "Achieve the highest level of trust and build for B2B expansion through API development and strategic partnerships with legal and financial institutions.",
        icon: <TrustIcon className="w-8 h-8 text-indigo-400" />
      }
    ],
    monetizationFeatures: [
      {
        title: "Digital Secure Vault",
        price: "₩10,000/month",
        implementationTime: "2-3 Days",
        differentiation: "AES-256 Encryption, Cloud Sync",
        icon: <VaultIcon className="w-7 h-7 text-cyan-300" />,
        status: "Foundation Complete",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "Premium AI Templates",
        price: "Included",
        implementationTime: "1 Week (AI API Integration)",
        differentiation: "Personalized will generation",
        icon: <PremiumIcon className="w-7 h-7 text-purple-300" />,
        status: "AI Gallery Implemented",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "Multimedia Messages",
        price: "Included",
        implementationTime: "3-4 Days",
        differentiation: "Store video/audio messages",
        icon: <MultimediaIcon className="w-7 h-7 text-pink-300" />,
        status: "UI Implemented",
        statusColor: "bg-green-500/20 text-green-300"
      },
       {
        title: "Universal Asset Storage",
        price: "Premium Feature",
        implementationTime: "Planned",
        differentiation: "Store crypto keys, bank info, secrets",
        icon: <KeyIcon className="w-7 h-7 text-fuchsia-300" />,
        status: "UI Implemented",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "Blockchain-Encrypted Delivery",
        price: "Premium Feature",
        implementationTime: "1 Week",
        differentiation: "Secure, verifiable transfer of vault contents",
        icon: <BlockchainIcon className="w-7 h-7 text-amber-300" />,
        status: "UI Implemented",
        statusColor: "bg-green-500/20 text-green-300"
      }
    ],
    prioritySteps: [
        {
          title: "Step 1: Immediate Monetization (Complete)",
          timeline: "1-2 Weeks",
          tasks: [
            {
              title: "Payment System Integration",
              icon: <PaymentIcon />,
              details: ["Stripe/Toss Payments (Complete)", "Subscription Management (Complete)", "Free vs. Premium Tiers (Complete)", "Role-Based Access Control (Complete)"]
            },
            {
              title: "Cloud Storage Integration",
              icon: <CloudIcon />,
              details: ["AWS S3 / Firebase Storage (Complete)", "Encrypted File Storage (Complete)", "Multi-device Sync (Complete)", "Backup System (Complete)"]
            }
          ]
        },
        {
          title: "Step 2: Core Differentiation (Complete)",
          timeline: "2-3 Weeks",
          tasks: [
            {
              title: "AI Template System",
              icon: <AiIcon />,
              details: ["Gemini API Integration (Complete)", "Occupation-specific templates (Complete)", "Family structure recommendations (Complete)", "Emotion analysis for tone (Complete)"]
            }
          ]
        },
        {
          title: "Step 3: Advancement (Complete)",
          timeline: "1 Month+",
          tasks: [
            {
              title: "Blockchain Recording",
              icon: <BlockchainIcon />,
              details: ["Ethereum/Polygon Integration (Complete)", "Store hash on blockchain (Complete)", "Smart Contract deployment (Complete)", "Verification system (Complete)"]
            },
            {
              title: "Advanced Multimedia",
              icon: <MultimediaIcon />,
              details: ["Video compression/optimization (Complete)", "Encrypted streaming (Complete)", "Thumbnail generation (Complete)", "Scheduled message delivery (Complete)"]
            }
          ]
        }
    ],
    marketAnalysis: [
      {
        title: "Target Market",
        icon: <TargetIcon className="w-8 h-8 text-rose-400" />,
        content: [
          "Primary Target: 40-60 year old asset owners (low resistance to ₩10,000/month).",
          "Secondary Target: 30-40 year old tech-savvy individuals (digital asset management).",
          "Market Size: 1,000,000+ potential customers in South Korea."
        ]
      },
      {
        title: "Revenue Forecast",
        icon: <RevenueIcon className="w-8 h-8 text-emerald-400" />,
        content: [
          { label: "Year 1", value: "₩10M / month (1k users)" },
          { label: "Year 2", value: "₩50M / month (5k users)" },
          { label: "Year 3", value: "₩200M / month (20k users)" },
        ]
      },
      {
        title: "B2B Expansion",
        icon: <B2BIcon className="w-8 h-8 text-sky-400" />,
        content: [
          "Insurance Companies: Package with life insurance products.",
          "Banks: Offer as a VIP client service.",
          "Law Firms: Digitize traditional will services.",
          "Funeral Homes: Integrate with digital memorial services."
        ]
      }
    ],
    actionItems: [
      {
        priority: 1,
        title: "Security Enhancement",
        category: "Security",
        icon: <ShieldIcon />,
        details: ["Implement E2E Encryption", "Master Password System", "Add 2-Factor Authentication", "Enhance Session Security"]
      },
      {
        priority: 2,
        title: "Payment Infrastructure",
        category: "Payment",
        icon: <PaymentIcon />,
        details: ["Integrate Subscription Payments", "Tier-based Permission Management", "Handle Payment Failures", "Implement Refund Policy"]
      },
      {
        priority: 3,
        title: "UX/UI Improvement",
        category: "UX/UI",
        icon: <UxIcon />,
        details: ["Finalize Responsive Design", "Create User Onboarding Flow", "Implement Help/Support System", "Improve Accessibility"]
      },
      {
        priority: 4,
        title: "Legal & Regulatory",
        category: "Compliance",
        icon: <LegalIcon />,
        details: ["Comply with PIPA", "Meet legal requirements for wills", "Finalize Terms of Service", "Acquire necessary insurance"]
      }
    ],
    partnersPage: {
      title: "FinalMessage for Partners",
      subtitle: "Collaborate with us to provide your clients with enhanced value and peace of mind through our secure digital legacy platform.",
      backToHome: "Back to Home",
      partners: [
          {
              type: "Insurance Companies",
              icon: <ShieldIcon className="w-8 h-8 text-green-400" />,
              description: "Integrate FinalMessage as a value-added service with life insurance policies, helping clients organize their digital estate alongside their financial planning.",
              benefits: ["Increase policy value", "Offer a modern, digital-first benefit", "Strengthen client trust and loyalty"]
          },
          {
              type: "Banks & Financial Institutions",
              icon: <BanknotesIcon className="w-8 h-8 text-cyan-400" />,
              description: "Offer FinalMessage as a premium service to high-net-worth or VIP clients, providing a comprehensive solution for both financial and digital asset succession.",
              benefits: ["Enhance premium client offerings", "Create new revenue streams", "Position your institution as a forward-thinking leader"]
          },
          {
              type: "Law Firms & Notaries",
              icon: <LegalIcon className="w-8 h-8 text-amber-400" />,
              description: "Digitize and streamline the traditional will and testament process. Use our platform to securely manage and execute digital aspects of your clients' estates.",
              benefits: ["Modernize your legal services", "Improve efficiency in estate planning", "Provide a secure digital complement to legal documents"]
          },
          {
              type: "Funeral Homes & Memorial Services",
              icon: <HomeIcon className="w-8 h-8 text-indigo-400" />,
              description: "Integrate FinalMessage with pre-need planning and digital memorial services, allowing families to receive final messages as part of the remembrance process.",
              benefits: ["Offer unique and heartfelt memorial options", "Provide comfort to grieving families", "Expand your service portfolio"]
          }
      ],
      contactForm: {
        title: "Become a Partner",
        subtitle: "Interested in a partnership? Fill out the form below and our team will get in touch with you shortly.",
        fields: {
            companyType: { 
                label: "Company Classification",
                placeholder: "Select a classification",
                options: ["Insurance Company", "Bank / Financial Institution", "Law Firm / Notary", "Funeral Home / Memorial Service", "Other"]
            },
            companyName: { label: "Company Name", placeholder: "e.g., FinalMessage Inc." },
            contactName: { label: "Contact Person's Name", placeholder: "e.g., Jane Doe" },
            phone: { label: "Phone Number", placeholder: "e.g., 02-123-4567" },
            mobile: { label: "Mobile Phone Number", placeholder: "e.g., 010-1234-5678" },
            email: { label: "Email Address", placeholder: "e.g., partners@example.com" },
            inquiry: { label: "Inquiry Details", placeholder: "Please describe your partnership proposal or question." }
        },
        submitButton: "Submit Inquiry",
        successMessage: "Your inquiry has been submitted successfully. We will get back to you soon."
      }
    }
  },
  ko: {
    roadmapPhases: [
      {
        title: "1단계 (MVP+)",
        subtitle: "통합 디지털 안심 금고 (메시지, 자산, 비밀)",
        description: "기존 메시지를 넘어, 디지털 자산(암호화폐 키, NFT), 금융 정보, 개인적인 비밀까지 안전하게 보관하는 핵심 가치를 구축합니다.",
        icon: <VaultIcon className="w-8 h-8 text-cyan-400" />
      },
      {
        title: "2단계 (핵심 자동화)",
        subtitle: "블록체인 암호화 자동 전달 시스템",
        description: "'확실한 실행' 가치를 구현합니다. 확인자 지정 로직과 자동 비활성 감지 트리거를 개발하고, 블록체인 기술을 활용해 금고의 내용물을 사후에 암호화하여 안전하고 자동화된 방식으로 전달합니다.",
        icon: <AutomationIcon className="w-8 h-8 text-teal-400" />
      },
      {
        title: "3단계 (신뢰 및 확장)",
        subtitle: "블록체인, B2B 연동 & 법률 서비스",
        description: "최고 수준의 신뢰를 확보하고, 본격적인 B2B 사업 확장을 위한 API 개발 및 파트너십을 구축합니다.",
        icon: <TrustIcon className="w-8 h-8 text-indigo-400" />
      }
    ],
    monetizationFeatures: [
      {
        title: "디지털 안심 금고",
        price: "월 10,000원",
        implementationTime: "2-3일",
        differentiation: "AES-256 암호화, 클라우드 동기화",
        icon: <VaultIcon className="w-7 h-7 text-cyan-300" />,
        status: "기반 완성",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "프리미엄 AI 템플릿",
        price: "포함",
        implementationTime: "1주일 (AI 연동)",
        differentiation: "개인 맞춤형 유언 문구 생성",
        icon: <PremiumIcon className="w-7 h-7 text-purple-300" />,
        status: "AI 갤러리 구현됨",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "멀티미디어 메시지",
        price: "포함",
        implementationTime: "3-4일",
        differentiation: "영상/음성 메시지 저장",
        icon: <MultimediaIcon className="w-7 h-7 text-pink-300" />,
        status: "UI 구현됨",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "통합 자산 보관",
        price: "프리미엄 기능",
        implementationTime: "계획됨",
        differentiation: "암호화폐 키, 금융정보, 비밀 저장",
        icon: <KeyIcon className="w-7 h-7 text-fuchsia-300" />,
        status: "UI 구현됨",
        statusColor: "bg-green-500/20 text-green-300"
      },
      {
        title: "블록체인 암호화 전달",
        price: "프리미엄 기능",
        implementationTime: "1주일",
        differentiation: "금고 내용물의 안전하고 검증 가능한 전송",
        icon: <BlockchainIcon className="w-7 h-7 text-amber-300" />,
        status: "UI 구현됨",
        statusColor: "bg-green-500/20 text-green-300"
      }
    ],
    prioritySteps: [
        {
          title: "1단계: 즉시 수익화 (완료)",
          timeline: "1-2주",
          tasks: [
            {
              title: "결제 시스템 구축",
              icon: <PaymentIcon />,
              details: ["Stripe/Toss Payments 연동 (완료)", "구독 관리 시스템 (완료)", "Free vs Premium 기능 분리 (완료)", "사용자 등급별 접근 제어 (완료)"]
            },
            {
              title: "클라우드 저장소 연동",
              icon: <CloudIcon />,
              details: ["AWS S3 / Firebase Storage (완료)", "암호화된 파일 저장 (완료)", "다중 기기 동기화 (완료)", "백업 시스템 (완료)"]
            }
          ]
        },
        {
          title: "2단계: 핵심 차별화 (완료)",
          timeline: "2-3주",
          tasks: [
            {
              title: "AI 템플릿 시스템",
              icon: <AiIcon />,
              details: ["제미니 API 연동 (완료)", "직업별 맞춤 템플릿 (완료)", "가족 구성별 문구 추천 (완료)", "감정 분석 기반 톤 조절 (완료)"]
            }
          ]
        },
        {
          title: "3단계: 고도화 (완료)",
          timeline: "1개월+",
          tasks: [
            {
              title: "블록체인 기록",
              icon: <BlockchainIcon />,
              details: ["Ethereum/Polygon 연동 (완료)", "해시값 블록체인 저장 (완료)", "스마트 컨트랙트 배포 (완료)", "검증 시스템 구축 (완료)"]
            },
            {
              title: "멀티미디어 고도화",
              icon: <MultimediaIcon />,
              details: ["영상 압축/최적화 (완료)", "암호화된 스트리밍 (완료)", "썸네일 생성 (완료)", "시간별 메시지 예약 (완료)"]
            }
          ]
        }
    ],
    marketAnalysis: [
      {
        title: "목표 시장",
        icon: <TargetIcon className="w-8 h-8 text-rose-400" />,
        content: [
          "1차 타겟: 40-60대 자산가 (월 1만원 거부감 낮음).",
          "2차 타겟: 30-40대 IT 친화층 (디지털 자산 관리).",
          "시장 규모: 국내 잠재 고객 100만명+."
        ]
      },
      {
        title: "수익 예측",
        icon: <RevenueIcon className="w-8 h-8 text-emerald-400" />,
        content: [
          { label: "1년차", value: "월 1,000만원 (1천명)" },
          { label: "2년차", value: "월 5,000만원 (5천명)" },
          { label: "3년차", value: "월 2억원 (2만명)" },
        ]
      },
      {
        title: "B2B 확장 가능성",
        icon: <B2BIcon className="w-8 h-8 text-sky-400" />,
        content: [
          "보험회사: 종신보험 패키지 상품",
          "은행: VIP 고객 서비스",
          "법무법인: 유언 서비스 디지털화",
          "장례업체: 디지털 추모 서비스"
        ]
      }
    ],
    actionItems: [
      {
        priority: 1,
        title: "보안 강화",
        category: "보안",
        icon: <ShieldIcon />,
        details: ["E2E 암호화 구현", "마스터 비밀번호 시스템", "2FA 인증 추가", "세션 보안 강화"]
      },
      {
        priority: 2,
        title: "결제 인프라",
        category: "결제",
        icon: <PaymentIcon />,
        details: ["구독 결제 연동", "등급별 권한 관리", "결제 실패 처리", "환불 정책 구현"]
      },
      {
        priority: 3,
        title: "UX/UI 개선",
        category: "UX/UI",
        icon: <UxIcon />,
        details: ["반응형 디자인 완성", "사용자 온보딩 플로우", "도움말 시스템", "접근성 개선"]
      },
      {
        priority: 4,
        title: "법적/규제 대응",
        category: "규제",
        icon: <LegalIcon />,
        details: ["개인정보보호법 준수", "유언장 법적 요건 충족", "서비스 약관 정비", "보험 가입"]
      }
    ],
    partnersPage: {
      title: "FinalMessage 파트너 프로그램",
      subtitle: "저희의 안전한 디지털 유산 플랫폼을 통해 고객에게 향상된 가치와 마음의 평화를 제공하기 위해 협력하세요.",
      backToHome: "홈으로 돌아가기",
      partners: [
          {
              type: "보험회사",
              icon: <ShieldIcon className="w-8 h-8 text-green-400" />,
              description: "FinalMessage를 생명 보험 상품의 부가 서비스로 통합하여 고객이 재무 계획과 함께 디지털 자산을 정리할 수 있도록 지원합니다.",
              benefits: ["보험 상품 가치 증대", "현대적인 디지털 우선 혜택 제공", "고객 신뢰 및 충성도 강화"]
          },
          {
              type: "은행 및 금융 기관",
              icon: <BanknotesIcon className="w-8 h-8 text-cyan-400" />,
              description: "고액 자산가 또는 VIP 고객을 위한 프리미엄 서비스로 FinalMessage를 제공하여 금융 및 디지털 자산 승계를 위한 포괄적인 솔루션을 제공합니다.",
              benefits: ["프리미엄 고객 서비스 강화", "새로운 수익원 창출", "미래 지향적 리더로서의 입지 강화"]
          },
          {
              type: "법무법인 및 공증 사무소",
              icon: <LegalIcon className="w-8 h-8 text-amber-400" />,
              description: "전통적인 유언 및 공증 절차를 디지털화하고 간소화합니다. 저희 플랫폼을 사용하여 고객 자산의 디지털 측면을 안전하게 관리하고 실행하세요.",
              benefits: ["법률 서비스 현대화", "자산 계획 효율성 향상", "법적 문서에 대한 안전한 디지털 보완책 제공"]
          },
          {
              type: "장례업체 및 추모 서비스",
              icon: <HomeIcon className="w-8 h-8 text-indigo-400" />,
              description: "사전 장례 계획 및 디지털 추모 서비스에 FinalMessage를 통합하여, 유족들이 추모 과정의 일부로 고인의 마지막 메시지를 전달받을 수 있도록 합니다.",
              benefits: ["독특하고 진심 어린 추모 옵션 제공", "유가족에게 위안 제공", "서비스 포트폴리오 확장"]
          }
      ],
      contactForm: {
        title: "파트너가 되어주세요",
        subtitle: "파트너십에 관심이 있으신가요? 아래 양식을 작성해주시면 저희 팀에서 곧 연락드리겠습니다.",
        fields: {
            companyType: {
                label: "회사 분류",
                placeholder: "분류를 선택하세요",
                options: ["보험회사", "은행/금융기관", "법무법인/공증사무소", "장례업체/추모서비스", "기타"]
            },
            companyName: { label: "상호 (회사명)", placeholder: "예: (주)파이널메시지" },
            contactName: { label: "담당자 성함", placeholder: "예: 홍길동" },
            phone: { label: "전화번호", placeholder: "예: 02-123-4567" },
            mobile: { label: "핸드폰번호", placeholder: "예: 010-1234-5678" },
            email: { label: "이메일 주소", placeholder: "예: partners@example.com" },
            inquiry: { label: "문의 내용", placeholder: "파트너십 제안이나 질문에 대해 설명해주세요." }
        },
        submitButton: "문의 제출",
        successMessage: "문의가 성공적으로 접수되었습니다. 곧 회신드리겠습니다."
      }
    }
  }
};
