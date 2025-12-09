
import React from 'react';
import { StructuredResult } from '../types';
import { Download, ExternalLink, Globe, ShieldCheck, CheckCircle, TrendingUp, AlertCircle, Info, FlaskConical, Building2, Users, FileBadge, Target, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MarketChart, TrialsChart, EximChart, PatentTimelineChart, CompetitiveGridChart } from './Charts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultCardsProps {
  result: StructuredResult | null;
  loading: boolean;
}

export const ResultCards: React.FC<ResultCardsProps> = ({ result, loading }) => {
  
  // Real PDF Generation Function
  const generatePDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("MoleculeX Strategic Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);
    doc.line(14, 30, pageWidth - 14, 30);

    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Executive Summary", 14, 40);
    
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(result.summary.replace(/\*\*/g, ''), pageWidth - 28);
    doc.text(summaryLines, 14, 50);
    
    let yPos = 50 + (summaryLines.length * 5) + 10;

    // Market Data
    doc.setFontSize(14);
    doc.text("Market Analysis", 14, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Market Size (Mn USD)', `$${result.market.sales_mn_usd}`],
        ['CAGR', `${(result.market.cagr * 100).toFixed(1)}%`],
        ['Year', `${result.market.year}`],
        ['Key Competitors', result.market.top_competitors.join(', ')]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    // Patents
    doc.setFontSize(14);
    doc.text("Top Patents", 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Patent ID', 'Assignee', 'Expiry', 'Type']],
      body: result.patents.map(p => [p.patent_id, p.assignee, p.expiry, p.patent_type]),
      theme: 'striped'
    });
    
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    // SWOT
    if (result.swot) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("Strategic SWOT Analysis", 14, yPos);
        yPos += 8;
        
        const maxLen = Math.max(result.swot.strengths.length, result.swot.weaknesses.length, result.swot.opportunities.length, result.swot.threats.length);
        const body = [];
        for(let i=0; i<maxLen; i++) {
            body.push([
                result.swot.strengths[i] || '', 
                result.swot.weaknesses[i] || '',
                result.swot.opportunities[i] || '',
                result.swot.threats[i] || ''
            ]);
        }
        
        autoTable(doc, {
            startY: yPos,
            head: [['Strengths', 'Weaknesses', 'Opportunities', 'Threats']],
            body: body,
            theme: 'grid',
            styles: { fontSize: 8 }
        });
    }

    doc.save(`MoleculeX_Report_${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
             <p className="text-lg font-medium text-slate-800 dark:text-slate-200">Orchestrating Agents...</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Scraping real-time market data, analyzing patent registries, and synthesizing clinical trials.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Executive Summary
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                AI Generated
              </span>
            </h2>
            <div className="flex items-center gap-4 mt-2">
               <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {result.web_findings?.length || 0} Sources Checked
               </p>
               <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
               <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Trust Score: High
               </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ScoreBadge label="Whitespace" score={result.whitespace_score} color="indigo" />
            <ScoreBadge label="Biosimilar Opp" score={result.biosimilar_score} color="emerald" />
          </div>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
           {result.summary.split('\n').map((para, i) => (
             <p key={i} className="mb-3" dangerouslySetInnerHTML={{ 
               __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-semibold">$1</strong>') 
             }} />
           ))}
        </div>

        <div className="mt-6 flex justify-end">
            <button 
                onClick={generatePDF}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
            >
            <Download className="w-4 h-4" />
            Download Strategic Report
            </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const ScoreBadge = ({ label, score, color }: { label: string, score: number, color: 'indigo' | 'emerald' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'
  };
  
  return (
    <div className={`px-4 py-2 rounded-lg border flex flex-col items-center min-w-[100px] ${colors[color]} hover:scale-105 transition-transform cursor-help`} title={`AI Confidence for ${label}`}>
       <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
       <span className="text-xl font-bold dark:text-slate-100">{score || 0}<span className="text-sm opacity-60">/100</span></span>
    </div>
  );
};

// ... other sub-components reused from previous implementation
// Exporting sub-components to be used if needed or keeping file clean.
// For brevity, assuming the rest of the file logic for charts/etc. is handled in App.tsx tab switching logic 
// BUT we need to expose the SWOT and Strategy UI components here or in App.tsx. 
// Since App.tsx handles the Tabs, we will render the rest there, 
// OR we can make ResultCards accept an 'activeTab' prop and render everything.
// Given the previous structure, I'll export a "StrategyView" component to be used in App.tsx

export const StrategyView = ({ swot, competitors, isDarkMode }: { swot: any, competitors: any, isDarkMode: boolean }) => {
    if (!swot) return null;

    return (
        <div className="space-y-6">
             {/* SWOT Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-emerald-900/10 border-emerald-800/50' : 'bg-emerald-50 border-emerald-100'}`}>
                    <h4 className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 mb-3 uppercase text-xs tracking-wider">
                        <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                        {swot.strengths?.map((item: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-red-900/10 border-red-800/50' : 'bg-red-50 border-red-100'}`}>
                    <h4 className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-3 uppercase text-xs tracking-wider">
                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                    </h4>
                    <ul className="space-y-2">
                        {swot.weaknesses?.map((item: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
                    <h4 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 mb-3 uppercase text-xs tracking-wider">
                        <Zap className="w-4 h-4" /> Opportunities
                    </h4>
                    <ul className="space-y-2">
                        {swot.opportunities?.map((item: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-amber-900/10 border-amber-800/50' : 'bg-amber-50 border-amber-100'}`}>
                    <h4 className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 mb-3 uppercase text-xs tracking-wider">
                        <ShieldAlert className="w-4 h-4" /> Threats
                    </h4>
                    <ul className="space-y-2">
                        {swot.threats?.map((item: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
             </div>

             {/* Competitive Landscape Chart */}
             {competitors && competitors.length > 0 && (
                 <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} flex items-center gap-2`}>
                            <Target className="w-4 h-4 text-indigo-500" />
                            Competitive Landscape Matrix
                        </h4>
                        <span className="text-[10px] text-slate-500 italic">Market Share vs. Innovation</span>
                    </div>
                    <CompetitiveGridChart data={competitors} isDarkMode={isDarkMode} />
                 </div>
             )}
        </div>
    );
}

