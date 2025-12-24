

import React, { useState } from 'react';
import { StructuredResult, GoToMarketData, IndicationExpansionData } from '../types';
import { Download, Globe, ShieldCheck, CheckCircle2, AlertTriangle, Zap, ShieldAlert, Rocket, Stethoscope, Scale, Dna, FlaskConical, Building2, UserCheck, Gauge, AlertOctagon, Lightbulb, Activity, ExternalLink, FileText, Container } from 'lucide-react';
import { CompetitiveGridChart, TierDistributionChart, MarketChart, TrialsChart, PatentTimelineChart, EximChart } from './Charts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultCardsProps {
  result: StructuredResult | null;
  loading: boolean;
  isDarkMode: boolean;
}

// Helper for Citations
const SourceBadge = ({ source, isDarkMode }: { source: string; isDarkMode: boolean }) => {
  if (!source) return null;
  
  const isUrl = source.startsWith('http') || source.startsWith('www');
  
  if (isUrl) {
    return (
      <a 
        href={source} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors hover:underline ${isDarkMode ? 'bg-indigo-900/30 border-indigo-700 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-2.5 h-2.5" />
        Source
      </a>
    );
  }

  // Assume internal file or generic text
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
       <FileText className="w-2.5 h-2.5" />
       {source.length > 20 ? source.substring(0, 20) + '...' : source}
    </span>
  );
};

export const ResultCards: React.FC<ResultCardsProps> = ({ result, loading, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('Summary');

  const tabs = [
    { id: 'Summary', label: 'Executive Summary', icon: <FileText className="w-3.5 h-3.5"/> },
    { id: 'Market', label: 'Market', icon: null },
    { id: 'Clinical', label: 'Clinical', icon: null },
    { id: 'IP', label: 'IP', icon: null },
    { id: 'EXIM', label: 'EXIM', icon: null },
    { id: 'Strategy', label: 'SWOT', icon: <Lightbulb className="w-3.5 h-3.5"/> },
    { id: 'GTM', label: 'GTM', icon: <Rocket className="w-3.5 h-3.5"/> },
    { id: 'Expansion', label: 'Expansion', icon: <Dna className="w-3.5 h-3.5"/> },
  ];

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text("MoleculeX Strategic Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);
    doc.line(14, 30, pageWidth - 14, 30);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Executive Summary", 14, 40);
    
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(result.summary.replace(/\*\*/g, ''), pageWidth - 28);
    doc.text(summaryLines, 14, 50);
    
    let yPos = 50 + (summaryLines.length * 5) + 10;
    
    // Add sections (simplified PDF generation logic)
    const addSection = (title: string, tableConfig: any) => {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text(title, 14, yPos);
        yPos += 8;
        autoTable(doc, { startY: yPos, ...tableConfig });
        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 15;
    }

    if(result.market) {
        addSection("Market Analysis", {
            head: [['Metric', 'Value']],
            body: [
                ['Market Size', `$${result.market.sales_mn_usd} Mn`],
                ['CAGR', `${(result.market.cagr * 100).toFixed(1)}%`],
                ['Region', result.market.country],
                ['Competitors', result.market.top_competitors.join(', ')]
            ]
        });
    }

    doc.save(`MoleculeX_Report_${Date.now()}.pdf`);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
             <p className="text-lg font-medium text-slate-800 dark:text-slate-200">Orchestrating Strategic Swarm...</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Analyzing mechanism of action, clinical guidelines, off-label usage, and adoption barriers.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={`rounded-2xl shadow-sm border transition-all duration-300 flex flex-col min-h-[800px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* Header */}
      <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'}`}>
         <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              Strategic Intelligence Report
              <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                 AI Generated
              </span>
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               Comprehensive analysis based on {result.web_findings?.length} verified sources.
            </p>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={generatePDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
         </div>
      </div>

      {/* Tabs */}
      <div className={`px-6 pt-2 border-b overflow-x-auto ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
         <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-indigo-500 text-indigo-600 dark:text-indigo-400`
                    : `border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300`
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* Content Area - Added pb-32 for ChatBot spacing */}
      <div className="p-6 flex-1 overflow-y-auto pb-32">
        
        {/* EXECUTIVE SUMMARY VIEW */}
        {activeTab === 'Summary' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Key Metrics Grid (Bento Style) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Market Score */}
                  <div className={`p-4 rounded-xl border relative overflow-hidden group ${isDarkMode ? 'bg-indigo-900/10 border-indigo-900/30' : 'bg-indigo-50/50 border-indigo-100'}`}>
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Activity className="w-12 h-12 text-indigo-600" />
                      </div>
                      <p className="text-xs uppercase font-bold text-indigo-500 mb-1">Market Potential</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>${result.market.sales_mn_usd}M</p>
                      <div className="flex justify-between items-center mt-1">
                          <p className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>CAGR: {Math.round(result.market.cagr * 100)}%</p>
                          <SourceBadge source={result.market.source} isDarkMode={isDarkMode} />
                      </div>
                  </div>

                  {/* GTM Score */}
                  <div className={`p-4 rounded-xl border relative overflow-hidden group ${isDarkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Rocket className="w-12 h-12 text-emerald-600" />
                      </div>
                      <p className="text-xs uppercase font-bold text-emerald-500 mb-1">Launch Viability</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>{result.go_to_market.launch_viability_score}/100</p>
                      <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Strategy: {result.go_to_market.recommended_strategy}</p>
                  </div>

                   {/* Repurposing Score */}
                  <div className={`p-4 rounded-xl border relative overflow-hidden group ${isDarkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50/50 border-amber-100'}`}>
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Dna className="w-12 h-12 text-amber-600" />
                      </div>
                      <p className="text-xs uppercase font-bold text-amber-500 mb-1">Expansion Potential</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>{result.indication_expansion?.overall_repurposing_score}/100</p>
                      <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>New Indications Found</p>
                  </div>
              </div>

              {/* Main Summary Text */}
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                 <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Executive Analysis
                 </h3>
                 <div className={`prose prose-sm max-w-none leading-relaxed ${isDarkMode ? 'prose-invert text-slate-300' : 'text-slate-600'}`}>
                    {result.summary.split('\n').map((para, i) => (
                      <p key={i} className="mb-3" dangerouslySetInnerHTML={{ 
                        __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-400 font-semibold">$1</strong>') 
                      }} />
                    ))}
                 </div>
              </div>

              {/* Knowledge Base Footnote */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 text-teal-400' : 'bg-white text-teal-600 shadow-sm'}`}>
                       <Globe className="w-5 h-5" />
                    </div>
                    <div>
                       <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Knowledge Base Active</p>
                       <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{result.web_findings?.length || 0} Sources Verified across Scientific, Financial & Regulatory domains.</p>
                    </div>
                 </div>
                 <div className="flex -space-x-2">
                    {result.web_findings?.slice(0, 8).map((f, i) => (
                       <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-full border-2 overflow-hidden flex items-center justify-center bg-white hover:scale-110 transition-transform ${isDarkMode ? 'border-slate-900' : 'border-white'}`} title={f.title}>
                          <img 
                            src={getFaviconUrl(f.url)} 
                            alt={f.title.charAt(0)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className={`hidden w-full h-full flex items-center justify-center text-[10px] font-bold uppercase ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                             {f.title.substring(0,1)}
                          </div>
                       </a>
                    ))}
                    {result.web_findings?.length > 8 && (
                       <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'border-slate-900 bg-slate-800 text-slate-300' : 'border-white bg-slate-100 text-slate-600'}`}>
                          +{result.web_findings.length - 8}
                       </div>
                    )}
                 </div>
              </div>
           </div>
        )}

        {/* MARKET VIEW */}
        {activeTab === 'Market' && result.market && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <MarketChart data={result.market} isDarkMode={isDarkMode} />
                    <div className="mt-2 flex justify-end">
                       <SourceBadge source={result.market.source} isDarkMode={isDarkMode} />
                    </div>
                </div>
                {result.market_analysis && (
                    <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Activity className="w-4 h-4 text-indigo-500" /> Market Analysis
                         </h4>
                         <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                             {result.market_analysis}
                         </p>
                    </div>
                )}
                {result.competitors && result.competitors.length > 0 && (
                   <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                       <CompetitiveGridChart data={result.competitors} isDarkMode={isDarkMode} />
                   </div>
                )}
            </div>
        )}

        {activeTab === 'Strategy' && result.swot && <StrategyView swot={result.swot} competitors={result.competitors} isDarkMode={isDarkMode} />}
        
        {activeTab === 'GTM' && result.go_to_market && <GoToMarketView data={result.go_to_market} isDarkMode={isDarkMode} />}
        
        {activeTab === 'Expansion' && result.indication_expansion && <IndicationView data={result.indication_expansion} isDarkMode={isDarkMode} />}
        
        {/* CLINICAL VIEW */}
        {activeTab === 'Clinical' && result.trials && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <TrialsChart data={result.trials} isDarkMode={isDarkMode} />
                    </div>
                    <div className={`rounded-xl border p-4 overflow-y-auto max-h-[400px] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Recent Trials</h4>
                        <div className="space-y-2">
                            {result.trials.map((t,i) => (
                                <div key={i} className={`p-3 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex justify-between font-semibold mb-1">
                                    <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>{t.id}</span>
                                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{t.phase}</span>
                                    </div>
                                    <p className={`mb-1 line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.title}</p>
                                    <div className="flex justify-between mt-2">
                                    <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>{t.sponsor}</span>
                                    <span className={`px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{t.status}</span>
                                    </div>
                                    <div className="flex justify-end mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                       <SourceBadge source={t.source} isDarkMode={isDarkMode} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                  {result.clinical_analysis && (
                    <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <FlaskConical className="w-4 h-4 text-emerald-500" /> Clinical Landscape Summary
                         </h4>
                         <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                             {result.clinical_analysis}
                         </p>
                    </div>
                  )}
             </div>
        )}

        {/* IP VIEW */}
        {activeTab === 'IP' && result.patents && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <PatentTimelineChart data={result.patents} isDarkMode={isDarkMode} />
                </div>
                {result.ip_analysis && (
                    <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <ShieldCheck className="w-4 h-4 text-orange-500" /> Intellectual Property Insights
                         </h4>
                         <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                             {result.ip_analysis}
                         </p>
                    </div>
                )}
                {/* Patent List for Citations */}
                <div className="space-y-2">
                    {result.patents.slice(0, 3).map((p, i) => (
                        <div key={i} className={`flex justify-between items-center p-2 rounded border text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                           <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{p.patent_id}: {p.summary}</span>
                           <SourceBadge source={p.source} isDarkMode={isDarkMode} />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'EXIM' && result.exim && (
            <div className={`rounded-xl border p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <EximChart data={result.exim} isDarkMode={isDarkMode} />
                {/* Source Badge for EXIM */}
                {result.exim.length > 0 && result.exim[0].source && (
                  <div className="mt-2 flex justify-end">
                     <SourceBadge source={result.exim[0].source} isDarkMode={isDarkMode} />
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

// --- Re-export Sub-Views for ResultCards usage ---

export const GoToMarketView = ({ data, isDarkMode }: { data: GoToMarketData, isDarkMode: boolean }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-1 space-y-4">
                     <div className={`p-5 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <p className="text-xs uppercase font-bold text-slate-500 mb-2">Core Strategy</p>
                         <p className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {data.recommended_strategy}
                         </p>
                         <div className="my-3 h-px bg-slate-100 dark:bg-slate-700" />
                         <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {data.viability_reasoning}
                         </p>
                     </div>
                </div>
                <div className={`col-span-1 md:col-span-1 p-5 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                     <TierDistributionChart data={data.tier_distribution} isDarkMode={isDarkMode} />
                </div>
                <div className="col-span-1 md:col-span-1 space-y-4">
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Stethoscope className="w-4 h-4 text-blue-500" />
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Epidemiology</span>
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Prevalence</span>
                                <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{data.epidemiology?.prevalence}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Target Pop.</span>
                                <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{data.epidemiology?.patient_population}</span>
                             </div>
                             <div className="mt-2 flex justify-end">
                                <SourceBadge source={data.epidemiology?.source} isDarkMode={isDarkMode} />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const IndicationView = ({ data, isDarkMode }: { data: IndicationExpansionData, isDarkMode: boolean }) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {data.potential_indications.map((ind, i) => (
                <div key={i} className={`group p-5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800/30 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'}`}>
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-3">
                        <div>
                            <h4 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{ind.indication}</h4>
                            <p className={`text-sm mt-1 italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>"{ind.mechanism_link}"</p>
                        </div>
                        <span className={`self-start px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                            ind.evidence_strength === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            ind.evidence_strength === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                            {ind.evidence_strength} Evidence
                        </span>
                    </div>
                    
                    <div className={`flex items-center gap-6 pt-4 mt-2 border-t text-xs font-medium ${isDarkMode ? 'border-slate-700/50 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                            <span className="flex items-center gap-2">
                            <FlaskConical className="w-3.5 h-3.5" />
                            Est. Duration: <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{ind.estimated_duration}</span>
                            </span>
                            <span className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            Est. Cost: <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{ind.estimated_cost}</span>
                            </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export const StrategyView = ({ swot, competitors, isDarkMode }: { swot: any, competitors: any, isDarkMode: boolean }) => {
    if (!swot) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100'}`}>
                    <h4 className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider mb-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-2.5">
                        {swot.strengths?.map((item: string, i: number) => (
                            <li key={i} className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-emerald-100' : 'text-emerald-900'}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Weaknesses */}
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50 border-rose-100'}`}>
                    <h4 className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider mb-3 ${isDarkMode ? 'text-rose-400' : 'text-rose-800'}`}>
                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                    </h4>
                    <ul className="space-y-2.5">
                        {swot.weaknesses?.map((item: string, i: number) => (
                            <li key={i} className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-rose-100' : 'text-rose-900'}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Opportunities */}
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-sky-950/30 border-sky-900/50' : 'bg-sky-50 border-sky-100'}`}>
                    <h4 className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-800'}`}>
                        <Zap className="w-4 h-4" /> Opportunities
                    </h4>
                    <ul className="space-y-2.5">
                        {swot.opportunities?.map((item: string, i: number) => (
                            <li key={i} className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-sky-100' : 'text-sky-900'}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Threats */}
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-100'}`}>
                    <h4 className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider mb-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                        <ShieldAlert className="w-4 h-4" /> Threats
                    </h4>
                    <ul className="space-y-2.5">
                        {swot.threats?.map((item: string, i: number) => (
                            <li key={i} className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
             </div>
        </div>
    );
}