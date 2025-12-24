
import React, { useState, useEffect } from 'react';
import { ApiService } from './services/api';
import { JobStatus, StructuredResult, InternalFileData } from './types';
import { LandingPage } from './components/LandingPage';
import { ResultCards } from './components/ResultCards';
import { AgentPanel } from './components/AgentPanel';
import { ChatBot } from './components/ChatBot';
import { LayoutDashboard, Play, Upload, ChevronLeft, Moon, Sun, Loader2, X, CheckCircle2, FileType } from 'lucide-react';
import { readFileContent } from './utils/fileHelpers';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [query, setQuery] = useState('What are the emerging opportunities in cardiovascular drug development in Asia?');
  const [region, setRegion] = useState('Asia');
  const [molecule, setMolecule] = useState('');
  const [generatePdf, setGeneratePdf] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [finalResult, setFinalResult] = useState<StructuredResult | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    let pollInterval: any;
    if (currentJobId && (!jobStatus || !jobStatus.isComplete)) {
      pollInterval = setInterval(async () => {
        try {
          const status = await ApiService.getStatus(currentJobId);
          setJobStatus(status);
          if (status.isComplete) {
            clearInterval(pollInterval);
            fetchResult(currentJobId);
          }
        } catch (err) {
          console.error("Polling error", err);
          clearInterval(pollInterval);
        }
      }, 1000);
    }
    return () => clearInterval(pollInterval);
  }, [currentJobId, jobStatus?.isComplete]);

  const fetchResult = async (jobId: string) => {
    try {
      const result = await ApiService.getResult(jobId);
      setFinalResult(result);
    } catch (err) {
      console.error("Failed to fetch result", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setFile(null);
  };

  const handleRunOrchestration = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyModal(true);
      return;
    }
    
    setFinalResult(null);
    setJobStatus(null);
    
    let fileData: InternalFileData | undefined = undefined;

    if (file) {
      try {
        const content = await readFileContent(file);
        fileData = {
          name: file.name,
          content: content,
          type: file.type.includes('pdf') ? 'pdf' : 'txt'
        };
      } catch (err: any) {
        console.error("File read error", err);
        alert(err.message || "Failed to read file.");
        return;
      }
    }

    try {
      const { job_id } = await ApiService.startQuery({
        query,
        region,
        molecule: molecule || undefined,
        generate_pdf: generatePdf,
        fileData,
        apiKey
      });
      setCurrentJobId(job_id);
    } catch (err) {
      console.error("Failed to start query", err);
    }
  };

  const isProcessing = !!currentJobId && jobStatus && !jobStatus.isComplete;

  if (view === 'landing') {
    return (
      <LandingPage 
        onStart={() => setView('app')} 
        isDarkMode={darkMode} 
        toggleTheme={() => setDarkMode(!darkMode)} 
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Gemini API Key Required</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Please enter your Gemini API key to start the analysis.
            </p>
            <input
              type="password"
              placeholder="Enter your Gemini API key..."
              className={`w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 mb-4 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && apiKey.trim()) {
                  setShowApiKeyModal(false);
                  handleRunOrchestration();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    setShowApiKeyModal(false);
                    handleRunOrchestration();
                  }
                }}
                disabled={!apiKey.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${!apiKey.trim() ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className={`border-b sticky top-0 z-20 transition-colors duration-300 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
             <button onClick={() => setView('landing')} className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
               <ChevronLeft className="w-5 h-5" />
             </button>
            <div className="flex items-center gap-2">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
               <span className={`text-lg font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                 molecule<span className="text-indigo-600 dark:text-indigo-400">X</span>
               </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex flex-col lg:flex-row max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        
        {/* SETUP COLUMN */}
        <section className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className={`rounded-2xl p-5 shadow-sm border sticky top-24 transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <h2 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              Research Setup
            </h2>

            <div className="mb-5 space-y-1.5">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                1 · Research Objective
              </p>
              <textarea
                className={`mt-1 h-32 w-full resize-none rounded-lg border px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all leading-relaxed ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-800 focus:border-indigo-500 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500 placeholder-slate-400'}`}
                placeholder="Ask a research question…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="mb-5 space-y-2">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                2 · Scope
              </p>
              <div className="flex gap-2">
                <select 
                  className={`w-1/2 rounded-lg border px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-600 focus:border-indigo-500'}`}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={isProcessing}
                >
                  <option>India</option>
                  <option>Asia</option>
                  <option>Global</option>
                  <option>USA</option>
                  <option>Europe</option>
                </select>
                <input 
                  type="text"
                  placeholder="Molecule (Opt)"
                  className={`w-1/2 rounded-lg border px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-indigo-500 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-600 focus:border-indigo-500'}`}
                  value={molecule}
                  onChange={(e) => setMolecule(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                3 · Context
              </p>
              
              {!file ? (
                <label 
                  htmlFor="file-upload" 
                  className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-3 py-4 text-center transition-colors cursor-pointer group ${darkMode ? 'border-slate-700 bg-slate-800/30 hover:bg-slate-800' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className={`p-2 rounded-full shadow-sm mb-2 group-hover:scale-105 transition-transform ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <Upload className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Upload PDF / CSV
                  </span>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                    accept=".pdf,.csv,.txt" 
                    disabled={isProcessing} 
                  />
                </label>
              ) : (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
                   <div className="flex items-center gap-2 overflow-hidden">
                      <FileType className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className={`text-xs font-medium truncate max-w-[150px] ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{file.name}</span>
                   </div>
                   <button onClick={clearFile} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full" disabled={isProcessing}>
                      <X className={`w-3.5 h-3.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                   </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleRunOrchestration}
              disabled={isProcessing || !query.trim()}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200/50 transition-all active:scale-[0.98] ${isProcessing || !query.trim() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Orchestrating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Orchestration
                </>
              )}
            </button>
          </div>
        </section>

        {/* RESULTS COLUMN */}
        <section className="flex-1 min-w-0 flex flex-col xl:flex-row gap-6 h-full">
            {/* Main Result Card (Consolidated) */}
            <div className="flex-1 min-w-0">
               <ResultCards result={finalResult} loading={isProcessing} isDarkMode={darkMode} />
            </div>

            {/* Agent Panel (Side) */}
            <div className="w-full xl:w-80 h-[800px] flex-shrink-0">
               <AgentPanel jobStatus={jobStatus} />
            </div>
        </section>
      </main>
      
      <ChatBot context={finalResult} isDarkMode={darkMode} />
    </div>
  );
}
