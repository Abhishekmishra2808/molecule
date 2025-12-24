
import React, { useEffect, useRef, useState } from 'react';
import { AgentStatus, AgentType, JobStatus } from '../types';
import { CheckCircle2, Clock, XCircle, BrainCircuit, Activity, FileText, Globe, FlaskConical, Container, TrendingUp, Cpu, Loader2, Circle, Users, Scale, Truck, Tag, Dna, Library, HardHat, Gavel, FileCheck, ThumbsUp, Microscope, Newspaper, Radio, List, Terminal, Sparkles, ShieldCheck, SearchCode, ScaleIcon, BarChart3, Pill } from 'lucide-react';

interface AgentPanelProps {
  jobStatus: JobStatus | null;
}

const AgentIcon = ({ type, className }: { type: AgentType | string; className?: string }) => {
  switch (type) {
    case AgentType.COUNCIL_HEAD: return <BrainCircuit className={className} />;
    case AgentType.COUNCIL_CRITIC: return <ScaleIcon className={className} />;
    case AgentType.COUNCIL_JUDGE: return <ShieldCheck className={className} />;
    case AgentType.MASTER: return <Sparkles className={className} />;
    case AgentType.MARKET: return <TrendingUp className={className} />;
    case AgentType.PRICING: return <Tag className={className} />;
    case AgentType.EXIM: return <Truck className={className} />;
    case AgentType.FINANCIAL: return <BarChart3 className={className} />;
    case AgentType.PATENT: return <FileText className={className} />;
    case AgentType.POLICY: return <Gavel className={className} />;
    case AgentType.REGULATORY_UPDATES: return <Radio className={className} />;
    case AgentType.TRIALS: return <FlaskConical className={className} />;
    case AgentType.SCIENTIFIC: return <Microscope className={className} />;
    case AgentType.BIOLOGY: return <Dna className={className} />;
    case AgentType.LITERATURE: return <Library className={className} />;
    case AgentType.EPIDEMIOLOGY: return <Users className={className} />;
    case AgentType.FEASIBILITY: return <FileCheck className={className} />;
    case AgentType.REPORT: return <Activity className={className} />;
    default: return <Circle className={className} />;
  }
};

const StatusIcon = ({ status }: { status: AgentStatus }) => {
  switch (status) {
    case AgentStatus.COMPLETED: 
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case AgentStatus.RUNNING: 
      return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
    case AgentStatus.FAILED: 
      return <XCircle className="w-4 h-4 text-red-500" />;
    case AgentStatus.WAITING: 
      return <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600" />;
    default: 
      return <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600" />;
  }
};

export const AgentPanel: React.FC<AgentPanelProps> = ({ jobStatus }) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'logs'>('agents');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [jobStatus?.logs, activeTab]);

  if (!jobStatus) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center p-8 text-slate-400">
        <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-sm font-medium">System Idle. Initiate a query to start the swarm.</p>
      </div>
    );
  }

  const sections = [
    { 
      title: 'Strategic Council', 
      icon: <Sparkles className="w-3 h-3 text-amber-500" />,
      agents: [AgentType.COUNCIL_HEAD, AgentType.COUNCIL_CRITIC, AgentType.COUNCIL_JUDGE] 
    },
    { 
      title: 'Market Intelligence Swarm', 
      icon: <TrendingUp className="w-3 h-3 text-blue-500" />,
      agents: [AgentType.MARKET, AgentType.PRICING, AgentType.EXIM, AgentType.FINANCIAL] 
    },
    { 
      title: 'Scientific Swarm', 
      icon: <Microscope className="w-3 h-3 text-emerald-500" />,
      agents: [AgentType.TRIALS, AgentType.SCIENTIFIC, AgentType.BIOLOGY, AgentType.LITERATURE, AgentType.EPIDEMIOLOGY] 
    },
    { 
      title: 'Regulatory & Policy Swarm', 
      icon: <ShieldCheck className="w-3 h-3 text-orange-500" />,
      agents: [AgentType.PATENT, AgentType.POLICY, AgentType.REGULATORY_UPDATES, AgentType.FEASIBILITY] 
    },
    { 
      title: 'Synthesis', 
      icon: <Activity className="w-3 h-3 text-indigo-500" />,
      agents: [AgentType.REPORT] 
    }
  ];

  const renderAgent = (agentType: AgentType) => {
    const status = jobStatus.agents[agentType] || AgentStatus.IDLE;
    const thought = jobStatus.agentThoughts[agentType];
    const isRunning = status === AgentStatus.RUNNING;

    return (
      <div key={agentType} className={`flex items-start justify-between p-2.5 rounded-lg border transition-all mb-1.5 ${
        isRunning ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
      }`}>
        <div className="flex items-start gap-3 overflow-hidden">
          <div className={`p-1.5 rounded-md mt-0.5 ${isRunning ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <AgentIcon type={agentType} className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-semibold ${isRunning ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{agentType}</span>
            {isRunning && thought && (
              <span className="text-[9px] text-indigo-500 italic truncate animate-pulse">{thought}</span>
            )}
          </div>
        </div>
        <StatusIcon status={status} />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Swarm Orchestrator
          </h3>
          <div className="h-1.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${jobStatus.progress}%` }} />
          </div>
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setActiveTab('agents')} className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'agents' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Active Swarm</button>
          <button onClick={() => setActiveTab('logs')} className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>System Logs</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'agents' ? (
          <div className="space-y-6 pb-20">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2 mb-2">
                  {section.icon} {section.title}
                </h4>
                {section.agents.map(renderAgent)}
              </div>
            ))}
          </div>
        ) : (
          <div ref={scrollRef} className="space-y-2 font-mono text-[9px] pb-20">
            {jobStatus.logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-indigo-500 font-bold">{log.agent}:</span>
                <span className="text-slate-700 dark:text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
