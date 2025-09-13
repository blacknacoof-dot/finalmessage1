
import React, { useMemo } from 'react';
import { data } from '../constants';
import DashboardCard from '../components/DashboardCard';
import type { MarketAnalysisItem } from '../types';
import type { Language } from '../App';

interface DashboardProps {
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
    const t = useMemo(() => data[language], [language]);

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'border-rose-500/50 bg-rose-500/10';
            case 2: return 'border-amber-500/50 bg-amber-500/10';
            case 3: return 'border-sky-500/50 bg-sky-500/10';
            default: return 'border-slate-600/50 bg-slate-700/20';
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-grid-slate-700/[0.05]">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white">{language === 'ko' ? '프로젝트 대시보드' : 'Project Dashboard'}</h1>
                    <p className="text-slate-400 mt-1">{language === 'ko' ? '디지털 자산 승계 솔루션' : 'Digital Asset Succession Solution'}</p>
                </header>

                <div className="space-y-8">
                    {/* Roadmap Phases */}
                    <section>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-4">{language === 'ko' ? '단계별 구현 로드맵' : 'Implementation Roadmap'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {t.roadmapPhases.map((phase, index) => (
                                <DashboardCard key={index} className="flex flex-col">
                                    <div className="flex items-start gap-4">
                                        {phase.icon}
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{phase.title}</h3>
                                            <p className="text-sm text-slate-400">{phase.subtitle}</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-slate-300 flex-grow">{phase.description}</p>
                                </DashboardCard>
                            ))}
                        </div>
                    </section>

                    {/* Monetization */}
                    <section>
                         <h2 className="text-2xl font-semibold text-slate-200 mb-4">{language === 'ko' ? '수익화 준비도 평가' : 'Monetization Readiness Assessment'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                             {t.monetizationFeatures.map((feature, index) => (
                                <DashboardCard key={index}>
                                    <div className="flex items-center gap-3 mb-3">
                                        {feature.icon}
                                        <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-cyan-300 font-semibold">{feature.price}</p>
                                    <p className="text-xs text-slate-400 mt-2">{language === 'ko' ? '구현 소요: ' : 'Implementation: '}{feature.implementationTime}</p>
                                    <p className="text-xs text-slate-400">{language === 'ko' ? '차별점: ' : 'Differentiation: '}{feature.differentiation}</p>
                                    <div className="mt-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${feature.statusColor}`}>{feature.status}</span>
                                    </div>
                                </DashboardCard>
                            ))}
                        </div>
                    </section>
                    
                    {/* Implementation Priority */}
                    <section>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-4">{language === 'ko' ? '다음 단계 구현 우선순위' : 'Next Step Implementation Priority'}</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {t.prioritySteps.map(step => (
                                <div key={step.title}>
                                    <h3 className="text-xl font-bold text-slate-100">{step.title}</h3>
                                    <p className="text-slate-400 mb-4">{step.timeline}</p>
                                    <div className="space-y-4">
                                    {step.tasks.map(task => (
                                        <DashboardCard key={task.title}>
                                            <div className="flex items-center gap-3 mb-2">
                                                {task.icon}
                                                <h4 className="font-semibold text-white">{task.title}</h4>
                                            </div>
                                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 pl-2">
                                                {task.details.map(detail => <li key={detail}>{detail}</li>)}
                                            </ul>
                                        </DashboardCard>
                                    ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Market Analysis */}
                    <section>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-4">{language === 'ko' ? '수익 잠재력 분석' : 'Revenue Potential Analysis'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {t.marketAnalysis.map((item: MarketAnalysisItem, index: number) => (
                                <DashboardCard key={index}>
                                    <div className="flex items-center gap-3 mb-4">
                                        {item.icon}
                                        <h3 className="font-bold text-white text-lg">{item.title}</h3>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-300">
                                        {Array.isArray(item.content) && typeof item.content[0] === 'string' 
                                            ? <ul className="list-disc list-inside space-y-1">{item.content.map(c => <li key={c as string}>{c}</li>)}</ul>
                                            : (item.content as {label: string, value: string}[]).map(c => (
                                                <div key={c.label} className="flex justify-between">
                                                    <span>{c.label}</span>
                                                    <span className="font-semibold text-emerald-400">{c.value}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </DashboardCard>
                            ))}
                        </div>
                    </section>
                    
                     {/* Action Items */}
                    <section>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-4">{language === 'ko' ? '즉시 보완 필요사항' : 'Immediate Action Items'}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {t.actionItems.map(item => (
                                <DashboardCard key={item.title} className={`border-t-4 ${getPriorityColor(item.priority)}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        {item.icon}
                                        <div>
                                            <h3 className="font-bold text-white">{item.title}</h3>
                                            <p className="text-xs text-slate-400">{item.category}</p>
                                        </div>
                                    </div>
                                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mt-3 pl-2">
                                        {item.details.map(detail => <li key={detail}>{detail}</li>)}
                                    </ul>
                                </DashboardCard>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;