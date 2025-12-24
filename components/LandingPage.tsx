
import React from 'react';
import { Play, FlaskConical, FileText, Globe, Bot, ArrowRight, CheckCircle2, Moon, Sun } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isDarkMode, toggleTheme }) => {
  return (
    <div className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className={`absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full blur-3xl animate-pulse ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-200/40'}`} style={{ animationDuration: '8s' }}></div>
        <div className={`absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-3xl animate-pulse ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-200/30'}`} style={{ animationDuration: '10s' }}></div>
        <div className={`absolute bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full blur-3xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-200/30'}`}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto max-w-7xl px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
           <span className="text-xl font-bold tracking-tight">molecule<span className="text-indigo-600 dark:text-indigo-400">X</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Platform</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Solutions</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Research</a>
        </div>
        
        <div className="flex items-center gap-4">
          {toggleTheme && (
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          )}
          <button onClick={onStart} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Log in
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center">
        <div className={`mb-8 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur ${isDarkMode ? 'border-indigo-900 bg-slate-900/80 text-indigo-400' : 'border-indigo-100 bg-white/80 text-indigo-600'}`}>
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2"></span>
          Now powered by Gemini 3 Pro
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight mb-6 sm:text-7xl">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-violet-400 via-indigo-400 to-blue-400' : 'from-violet-600 via-indigo-600 to-blue-600'}`}>
            MoleculeX
          </span>
        </h1>
        
        <h2 className={`mx-auto max-w-2xl text-2xl font-semibold mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          AI-Powered Pharmaceutical Intelligence
        </h2>

        <p className={`mx-auto max-w-2xl text-lg mb-10 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Unlock breakthrough insights with advanced AI analysis of clinical trials, patent landscapes, and scientific literature—all unified in one powerful platform.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border text-sm font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <FlaskConical className="w-4 h-4 text-green-500" />
            Clinical Trials
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border text-sm font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <FileText className="w-4 h-4 text-orange-500" />
            Patent Analysis
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border text-sm font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Globe className="w-4 h-4 text-blue-500" />
            Literature Review
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border text-sm font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Bot className="w-4 h-4 text-purple-500" />
            AI-Powered
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a 
            href="https://youtu.be/VOU2sL3VK7Y"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-semibold text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Play className="w-4 h-4" />
            Watch Live Demo
          </a>

          <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Start Analysis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
          <div>
             <div className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>1000+</div>
             <div className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Trials Analyzed</div>
          </div>
          <div>
             <div className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>500+</div>
             <div className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Patents Reviewed</div>
          </div>
          <div>
             <div className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>99.9%</div>
             <div className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Accuracy</div>
          </div>
        </div>
      </main>
      
      <div className={`absolute bottom-0 w-full h-24 bg-gradient-to-t ${isDarkMode ? 'from-slate-950 to-transparent' : 'from-white to-transparent'}`}></div>
    </div>
  );
};
