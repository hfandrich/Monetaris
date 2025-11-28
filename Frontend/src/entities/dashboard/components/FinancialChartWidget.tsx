/**
 * FinancialChartWidget Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '@/shared/components/ui';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { FinancialData } from '../types/dashboard.types';

interface FinancialChartWidgetProps {
  data?: FinancialData[];
  loading?: boolean;
}

const defaultData: FinancialData[] = [
  { name: 'Jan', actual: 4000, projected: 4200 },
  { name: 'Feb', actual: 3000, projected: 3500 },
  { name: 'Mär', actual: 5500, projected: 5000 },
  { name: 'Apr', actual: 4800, projected: 5200 },
  { name: 'Mai', actual: 7200, projected: 6800 },
  { name: 'Jun', actual: 6100, projected: 6500 },
  { name: 'Jul', actual: 8900, projected: 8500 },
  { name: 'Aug', actual: 9500, projected: 9000 },
];

const SkeletonChart = () => (
  <Card className="h-full dark:bg-[#0A0A0A]">
    <div className="animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
      <div className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded"></div>
    </div>
  </Card>
);

export const FinancialChartWidget: React.FC<FinancialChartWidgetProps> = ({ data, loading }) => {
  if (loading) {
    return <SkeletonChart />;
  }

  const chartData = data || defaultData;

  return (
    <Card className="h-full dark:bg-[#0A0A0A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={18}/> Cashflow Pulse
        </h3>
        <div className="flex gap-4 text-xs font-bold">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ist
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div> Soll (AI)
          </span>
        </div>
      </div>
      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-white/5" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{fill: '#64748B', fontSize: 12}}
              dy={10}
              minTickGap={20}
            />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(val) => `€${val/1000}k`} />
            <Tooltip
              contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff'}}
              itemStyle={{color: '#10B981'}}
            />
            <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            <Line type="monotone" dataKey="projected" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
