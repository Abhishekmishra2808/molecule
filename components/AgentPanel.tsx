import React, { useEffect, useRef } from 'react';
import { AgentStatus, AgentType, JobStatus } from '../types';
import { CheckCircle2, Clock, XCircle, BrainCircuit, Activity, FileText, Globe, FlaskConical, Container, TrendingUp, Cpu, Loader2, Circle } from 'lucide-react';

interface AgentPanelProps {
  jobStatus: JobStatus | null;
}

const AgentIcon = ({ type, className }: { type: AgentType | string; className?: string }) => {
  switch (type) {
    case AgentType.MASTER: return <BrainCircuit className={className} />;
    case AgentType.MARKET: return <TrendingUp className={className} />;
    case AgentType.PATENT: return <FileText className={className} />;
    case AgentType.TRIALS: return <FlaskConical className={className} />;
    case AgentType.EXIM: return <Container className={className} />;
    case AgentType.WEB: return <Globe className={className} />;
    case AgentType.INTERNAL: return <Cpu className={className} />;
    case AgentType.REPORT: return <Activity className={className} />;
    default: return <Circle className={className} />;
  }
};

const StatusIcon = ({ status }: { status: AgentStatus }) => {
  switch (status) {
    case AgentStatus.COMPLETED: 
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    case AgentStatus.RUNNING: 
      return <Loader2 className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />;
    case AgentStatus.FAILED: 
      return <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
    case AgentStatus.WAITING: 
      return <Clock className="w-5 h-5 text-slate-300 dark:text-slate-600" />;
    default: 
      return <Clock className="w-5 h-5 text-slate-300 dark:text-slate-600" />;
  }
};

export const AgentPanel: React.FC<AgentPanelProps> = ({ jobStatus }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [jobStatus?.logs]);

  if (!jobStatus) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center p-8 text-slate-400 dark:text-slate-500">
        <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
        <p>System Idle. Initiate a query to start agents.</p>
      </div>
    );
  }

  const agentList = [
    AgentType.MASTER,
    AgentType.MARKET,
    AgentType.WEB,
    AgentType.PATENT,
    AgentType.TRIALS,
    AgentType.EXIM,
    AgentType.REPORT
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Agent Orchestration
        </h3>
        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
          JOB: {jobStatus.jobId.slice(-6)}
        </span>
      </div>

      {/* Agents Grid */}
      <div className="p-4 grid grid-cols-1 gap-3 border-b border-slate-100 dark:border-slate-800">
        {agentList.map((agentType) => {
          const status = jobStatus.agents[agentType] || AgentStatus.IDLE;
          const isActive = status === AgentStatus.RUNNING;
          const isDone = status === AgentStatus.COMPLETED;
          const isFailed = status === AgentStatus.FAILED;
          
          let borderColor = 'border-slate-100 dark:border-slate-800';
          let bgColor = 'bg-white dark:bg-slate-900';
          let iconBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
          let textColor = 'text-slate-500 dark:text-slate-400';

          if (isActive) {
            borderColor = 'border-blue-200 dark:border-blue-900/50';
            bgColor = 'bg-blue-50 dark:bg-blue-900/10';
            iconBg = 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            textColor = 'text-blue-700 dark:text-blue-300';
          } else if (isDone) {
            borderColor = 'border-green-100 dark:border-green-900/50';
            bgColor = 'bg-green-50 dark:bg-green-900/10';
            iconBg = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            textColor = 'text-green-700 dark:text-green-300';
          } else if (isFailed) {
            borderColor = 'border-red-100 dark:border-red-900/50';
            bgColor = 'bg-red-50 dark:bg-red-900/10';
            iconBg = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            textColor = 'text-red-700 dark:text-red-300';
          }
          
          return (
            <div key={agentType} className={`flex items-center justify-between p-2 rounded-lg border ${borderColor} ${bgColor}`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${iconBg}`}>
                   <AgentIcon type={agentType} className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${textColor}`}>
                  {agentType}
                </span>
              </div>
              <StatusIcon status={status} />
            </div>
          );
        })}
      </div>

      {/* Live Logs */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="p-2 border-b border-slate-800 text-xs font-mono text-slate-500 uppercase tracking-wider bg-slate-950/50">
          System Activity Log
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
          {jobStatus.logs.length === 0 && (
             <span className="text-slate-600 italic">Waiting for events...</span>
          )}
          {[...jobStatus.logs].reverse().map((log) => (
            <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-slate-600 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
              </span>
              <div>
                <span className={`font-bold mr-2 ${log.agent === AgentType.MASTER ? 'text-purple-400' : 'text-blue-400'}`}>
                  [{log.agent}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};