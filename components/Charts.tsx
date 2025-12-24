
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ReferenceLine, ScatterChart, Scatter, ZAxis, LabelList, ReferenceArea 
} from 'recharts';
import { MarketData, TrialData, PatentData, EximData, CompetitorData } from '../types';

interface ChartProps {
  isDarkMode?: boolean;
}

interface MarketChartProps extends ChartProps {
  data: MarketData;
}

export const MarketChart: React.FC<MarketChartProps> = ({ data, isDarkMode }) => {
  // Synthesize some trend data based on the single point for visualization
  const trendData = [
    { year: data.year - 2, sales: Math.round(data.sales_mn_usd * 0.85) },
    { year: data.year - 1, sales: Math.round(data.sales_mn_usd * 0.92) },
    { year: data.year, sales: data.sales_mn_usd },
    { year: data.year + 1, sales: Math.round(data.sales_mn_usd * (1 + data.cagr)) },
    { year: data.year + 2, sales: Math.round(data.sales_mn_usd * (1 + data.cagr) ** 2) },
  ];

  return (
    <div className="h-[320px] w-full p-2">
      <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Market Growth Projection (Mn USD)</h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={trendData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis 
            dataKey="year" 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
            axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               borderRadius: '8px', 
               color: isDarkMode ? '#f1f5f9' : '#0f172a',
               boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
             }}
             cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.4 }}
          />
          <Bar 
            dataKey="sales" 
            fill="#3b82f6" 
            radius={[6, 6, 0, 0]} 
            name="Sales (USD Mn)"
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TrialsChartProps extends ChartProps {
  data: TrialData[];
}

export const TrialsChart: React.FC<TrialsChartProps> = ({ data, isDarkMode }) => {
  const phaseCounts = data.reduce((acc, curr) => {
    acc[curr.phase] = (acc[curr.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(phaseCounts).map(phase => ({
    name: phase,
    value: phaseCounts[phase]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="h-[340px] w-full flex flex-col p-2">
      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Clinical Trials by Phase</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name} (${value})`}
            labelLine={{ stroke: isDarkMode ? '#64748b' : '#94a3b8' }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDarkMode ? '#1e293b' : '#fff'} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               borderRadius: '8px', 
               color: isDarkMode ? '#f1f5f9' : '#0f172a',
             }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', paddingTop: '10px' }} 
            verticalAlign="bottom"
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface EximChartProps extends ChartProps {
  data: EximData[];
}

export const EximChart: React.FC<EximChartProps> = ({ data, isDarkMode }) => {
  return (
    <div className="h-[320px] w-full p-2">
      <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Import vs Export Volume</h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis dataKey="year" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }} />
          <YAxis tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               borderRadius: '8px', 
               color: isDarkMode ? '#f1f5f9' : '#0f172a',
             }}
             cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <Bar dataKey="import_volume" fill="#ef4444" name="Imports" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="export_volume" fill="#10b981" name="Exports" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- PATENT CHART ---

interface PatentTimelineChartProps extends ChartProps {
  data: PatentData[];
}

const CustomPatentTooltip = ({ active, payload, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    // Note: Recharts payload structure for stacked bars can be nested
    const data = payload[1]?.payload || payload[0]?.payload; 
    
    if (!data) return null;

    return (
      <div className={`p-3 border shadow-xl rounded-lg text-sm z-50 max-w-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
        <p className="font-bold mb-1 text-indigo-500">{data.patent_id}</p>
        <p className="font-semibold text-xs mb-2">{data.assignee}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
           <div className="opacity-70">Filed:</div>
           <div>{data.realStart}</div>
           <div className="opacity-70">Expires:</div>
           <div className="text-red-500 font-medium">{data.realEnd}</div>
        </div>
        <div className={`text-[10px] p-1.5 rounded bg-opacity-10 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
           <span className="font-bold opacity-70">Type: </span>{data.type}
        </div>
      </div>
    );
  }
  return null;
};

// Helper to safely extract year
const getYear = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date.getFullYear();
    const match = dateStr.match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : null;
};

export const PatentTimelineChart: React.FC<PatentTimelineChartProps> = ({ data, isDarkMode }) => {
  const currentYear = new Date().getFullYear();
  
  // Filter and Process Data
  const processedData = data
    .map(p => {
      const start = getYear(p.filing_date);
      const end = getYear(p.expiry);
      
      if (!start || !end || end <= start) return null;
      
      return {
        ...p,
        realStart: start,
        realEnd: end,
        type: p.patent_type || 'Patent',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.realStart - b!.realStart) as (PatentData & { realStart: number, realEnd: number, type: string })[];

  if (processedData.length === 0) {
      return (
          <div className={`h-[300px] w-full flex flex-col items-center justify-center rounded-lg border border-dashed ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Timeline data unavailable</p>
          </div>
      );
  }

  const minYear = Math.min(...processedData.map(d => d.realStart)) - 1;
  const maxYear = Math.max(...processedData.map(d => d.realEnd)) + 2;
  
  // Prepare chart data with offsets for stacked bar
  const chartData = processedData.map(d => ({
    ...d,
    startOffset: d.realStart - minYear,
    duration: d.realEnd - d.realStart,
    displayLabel: `${d.patent_id} (${d.assignee ? d.assignee.substring(0, 15) + '...' : 'Unknown'})`
  }));

  // Dynamic Height Calculation: 60px per patent row + buffer
  const chartHeight = Math.max(400, chartData.length * 60);

  // Color mapping based on type
  const getColor = (type: string) => {
    const t = type ? type.toLowerCase() : '';
    if (t.includes('composition')) return '#8884d8'; // Purple
    if (t.includes('method')) return '#82ca9d'; // Green
    if (t.includes('formulation')) return '#ffc658'; // Orange
    return '#3b82f6'; // Blue
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-2">
        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Patent Lifespan Analysis</h4>
        <div className="flex gap-3 text-[10px] flex-wrap">
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8884d8]"></span> Composition</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#82ca9d]"></span> Method</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffc658]"></span> Formulation</span>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto overflow-y-hidden">
        <div style={{ height: `${chartHeight}px`, minWidth: '600px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 30, left: 150, bottom: 20 }}
              barCategoryGap={10}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
              <XAxis 
                type="number" 
                domain={[0, maxYear - minYear]} 
                tickFormatter={(val) => (minYear + val).toString()} 
                tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                orientation="top"
                axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
              />
              <YAxis 
                type="category" 
                dataKey="displayLabel" 
                width={140} 
                tick={{ fontSize: 11, fill: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: 500 }} 
              />
              <Tooltip 
                content={<CustomPatentTooltip isDarkMode={isDarkMode} />} 
                cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.5}} 
              />
              
              {/* Transparent Start Bar to offset the real bar */}
              <Bar dataKey="startOffset" stackId="a" fill="transparent" />
              
              {/* Visible Duration Bar */}
              <Bar 
                dataKey="duration" 
                stackId="a" 
                radius={[0, 4, 4, 0]} 
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
                ))}
              </Bar>
              
              {/* Current Year Line */}
              <ReferenceLine x={currentYear - minYear} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Today', fill: '#ef4444', fontSize: 10, position: 'insideBottom' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- COMPETITIVE CHART ---

interface CompetitiveGridProps extends ChartProps {
  data: CompetitorData[];
}

export const CompetitiveGridChart: React.FC<CompetitiveGridProps> = ({ data, isDarkMode }) => {
  // Fixed 0-100 domain for consistent quadrants
  const domain = [0, 100];

  return (
    <div className="h-[500px] w-full p-2 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Competitive Landscape Matrix</h4>
        <div className={`text-[10px] px-2 py-1 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
           Size = Market Influence
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
            
            {/* Quadrant Backgrounds */}
            {/* Top Right: Leaders */}
            <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill={isDarkMode ? "#064e3b" : "#dcfce7"} fillOpacity={0.15} />
            {/* Top Left: Innovators */}
            <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill={isDarkMode ? "#1e3a8a" : "#dbeafe"} fillOpacity={0.15} />
            {/* Bottom Right: Established */}
            <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill={isDarkMode ? "#713f12" : "#fef9c3"} fillOpacity={0.15} />
            {/* Bottom Left: Niche */}
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill={isDarkMode ? "#374151" : "#f3f4f6"} fillOpacity={0.15} />

            <XAxis 
              type="number" 
              dataKey="market_share_index" 
              name="Market Share" 
              domain={domain}
              label={{ value: 'Market Share Index →', position: 'bottom', offset: 0, fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
            />
            <YAxis 
              type="number" 
              dataKey="innovation_index" 
              name="Innovation" 
              domain={domain}
              label={{ value: 'Innovation Score ↑', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
            />
            <ZAxis type="category" dataKey="name" name="Company" />
            
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className={`p-3 border rounded-lg shadow-xl backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-800'}`}>
                      <p className="font-bold text-sm mb-1">{d.name}</p>
                      <div className="text-xs space-y-1">
                        <p>Share Index: <span className="font-mono font-semibold">{d.market_share_index}</span></p>
                        <p>Innovation: <span className="font-mono font-semibold">{d.innovation_index}</span></p>
                        <p className={`italic mt-2 pt-1 border-t ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>{d.type}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Quadrant Labels */}
            <ReferenceLine y={98} x={98} stroke="none" label={{ value: "LEADERS", position: 'insideTopRight', fill: isDarkMode ? '#4ade80' : '#15803d', fontSize: 12, fontWeight: '900', opacity: 0.6 }} />
            <ReferenceLine y={98} x={2} stroke="none" label={{ value: "INNOVATORS", position: 'insideTopLeft', fill: isDarkMode ? '#60a5fa' : '#1d4ed8', fontSize: 12, fontWeight: '900', opacity: 0.6 }} />
            <ReferenceLine y={2} x={98} stroke="none" label={{ value: "ESTABLISHED", position: 'insideBottomRight', fill: isDarkMode ? '#facc15' : '#a16207', fontSize: 12, fontWeight: '900', opacity: 0.6 }} />
            <ReferenceLine y={2} x={2} stroke="none" label={{ value: "NICHE", position: 'insideBottomLeft', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: '900', opacity: 0.6 }} />

            {/* Axes Lines */}
            <ReferenceLine x={50} stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={50} stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeDasharray="3 3" strokeWidth={2} />
            
            <Scatter name="Competitors" data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- GTM TIER CHART ---

interface TierChartProps extends ChartProps {
  data: { tier1: number; tier2: number; tier3: number };
}

export const TierDistributionChart: React.FC<TierChartProps> = ({ data, isDarkMode }) => {
  const chartData = [
    { name: 'Metro / Tier 1', value: data.tier1, fill: '#6366f1' },
    { name: 'Tier 2', value: data.tier2, fill: '#8b5cf6' },
    { name: 'Rural / Tier 3', value: data.tier3, fill: '#ec4899' },
  ];

  return (
    <div className="h-[200px] w-full p-2">
      <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target City Tier Distribution</h4>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 600 }} 
            width={90}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
             cursor={{fill: 'transparent'}}
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               borderRadius: '8px', 
               color: isDarkMode ? '#f1f5f9' : '#0f172a'
             }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 11, formatter: (val: number) => `${val}%` }}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};