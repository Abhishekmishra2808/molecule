
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine, ScatterChart, Scatter, ZAxis, LabelList, ReferenceArea } from 'recharts';
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
    <div className="h-[280px] w-full">
      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Market Growth Projection (Mn USD)</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis dataKey="year" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
          <Tooltip 
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               borderRadius: '8px', 
               color: isDarkMode ? '#f1f5f9' : '#0f172a',
               boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
             }}
          />
          <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sales (USD Mn)" />
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
    <div className="h-[340px] w-full flex flex-col">
      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Clinical Trials by Phase</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
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
               fontSize: '12px'
             }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b' }} 
            verticalAlign="bottom"
            height={36}
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
    <div className="h-[300px] w-full">
      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Import vs Export Volume (Last 5 Years)</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis dataKey="year" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
          <Tooltip 
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               borderRadius: '8px', 
               color: isDarkMode ? '#f1f5f9' : '#0f172a',
               fontSize: '12px'
             }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="import_volume" fill="#ef4444" name="Imports" radius={[4, 4, 0, 0]} />
          <Bar dataKey="export_volume" fill="#10b981" name="Exports" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PatentTimelineChartProps extends ChartProps {
  data: PatentData[];
}

const CustomPatentTooltip = ({ active, payload, label, baseYear, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.realStart || !data.realEnd) return null;
    
    return (
      <div className={`p-3 border shadow-xl rounded-lg text-sm z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
        <p className="font-bold mb-1">{data.patent_id}</p>
        <p className={`text-xs mb-2 max-w-[200px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{data.molecule}</p>
        <div className="flex gap-4 text-xs">
          <div className="flex flex-col">
            <span className={`uppercase text-[10px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Filing</span>
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{data.realStart}</span>
          </div>
          <div className="flex flex-col">
            <span className={`uppercase text-[10px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expiry</span>
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{data.realEnd}</span>
          </div>
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
  // 1. Robust Validation
  const currentYear = new Date().getFullYear();
  const validData = data.filter(p => {
    const start = getYear(p.filing_date);
    const end = getYear(p.expiry);
    return (
        start !== null && 
        end !== null && 
        end > start && 
        start > 1980 && 
        end < 2100
    );
  });

  const allYears = validData.flatMap(p => {
      const s = getYear(p.filing_date)!;
      const e = getYear(p.expiry)!;
      return [s, e];
  });
  
  if (allYears.length === 0) {
      return (
          <div className={`h-full w-full min-h-[250px] flex flex-col items-center justify-center rounded-lg border border-dashed ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Timeline data unavailable</p>
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Dates missing or invalid</p>
          </div>
      );
  }

  const minYear = Math.min(...allYears) - 1;
  const maxYear = Math.max(...allYears) + 2;
  const range = maxYear - minYear;

  const chartData = validData.map(p => {
    const start = getYear(p.filing_date)!;
    const end = getYear(p.expiry)!;
    return {
      patent_id: p.patent_id,
      molecule: p.molecule,
      realStart: start,
      realEnd: end,
      offset: start - minYear,
      duration: end - start
    };
  });

  return (
    <div className="h-[280px] w-full">
      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Patent Expiry Timeline</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis 
            type="number" 
            domain={[0, range]} 
            tickFormatter={(val) => Math.round(val + minYear).toString()} 
            tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            type="category" 
            dataKey="patent_id" 
            width={90} 
            tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#475569', fontWeight: 500 }} 
          />
          <Tooltip 
            content={<CustomPatentTooltip baseYear={minYear} isDarkMode={isDarkMode} />} 
            cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.5}} 
          />
          <Bar dataKey="offset" stackId="a" fill="transparent" />
          <Bar 
            dataKey="duration" 
            stackId="a" 
            fill="url(#colorGradient)" 
            radius={[0, 4, 4, 0]} 
            barSize={14} 
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
          
          {currentYear > minYear && currentYear < maxYear && (
            <ReferenceLine x={currentYear - minYear} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Today', fill: '#ef4444', fontSize: 9, position: 'top' }} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


interface CompetitiveGridProps extends ChartProps {
  data: CompetitorData[];
}

export const CompetitiveGridChart: React.FC<CompetitiveGridProps> = ({ data, isDarkMode }) => {
  // Use fixed 0-100 domain for the 2x2 matrix
  const domain = [0, 100];

  return (
    <div className="h-full w-full min-h-[350px]">
      <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Competitive Landscape</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
          <XAxis 
            type="number" 
            dataKey="market_share_index" 
            name="Market Share" 
            domain={domain}
            label={{ value: 'Market Share Index', position: 'bottom', offset: 0, fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
          />
          <YAxis 
            type="number" 
            dataKey="innovation_index" 
            name="Innovation" 
            domain={domain}
            label={{ value: 'Innovation Score', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
          />
          <ZAxis type="category" dataKey="name" name="Company" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className={`p-2 border rounded shadow-lg text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <p className="font-bold">{d.name}</p>
                    <p>Share: {d.market_share_index}</p>
                    <p>Innovation: {d.innovation_index}</p>
                    <p className="italic text-[10px] mt-1 text-slate-500">{d.type}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Quadrant Background Labels using ReferenceArea for cleaner look or ReferenceLines */}
          <ReferenceLine x={50} stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeDasharray="3 3" />
          <ReferenceLine y={50} stroke={isDarkMode ? '#475569' : '#cbd5e1'} strokeDasharray="3 3" />
          
          {/* Corner Labels */}
          <ReferenceLine y={95} x={95} stroke="none" label={{ value: "LEADERS", position: 'insideTopRight', fill: isDarkMode ? '#4ade80' : '#15803d', fontSize: 11, fontWeight: 'bold' }} />
          <ReferenceLine y={95} x={5} stroke="none" label={{ value: "INNOVATORS", position: 'insideTopLeft', fill: isDarkMode ? '#60a5fa' : '#1d4ed8', fontSize: 11, fontWeight: 'bold' }} />
          <ReferenceLine y={5} x={95} stroke="none" label={{ value: "ESTABLISHED", position: 'insideBottomRight', fill: isDarkMode ? '#facc15' : '#a16207', fontSize: 11, fontWeight: 'bold' }} />
          <ReferenceLine y={5} x={5} stroke="none" label={{ value: "NICHE", position: 'insideBottomLeft', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'bold' }} />

          <Scatter name="Competitors" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899'][index % 4]} />
            ))}
            <LabelList dataKey="name" position="top" offset={10} style={{ fontSize: 10, fill: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: 500 }} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
