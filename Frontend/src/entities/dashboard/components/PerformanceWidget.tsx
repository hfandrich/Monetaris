/**
 * PerformanceWidget Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '@/shared/components/ui';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

interface PerformanceWidgetProps {
  loading?: boolean;
}

const defaultData = [
  { subject: 'Score A', A: 120, fullMark: 150 },
  { subject: 'Score B', A: 98, fullMark: 150 },
  { subject: 'Score C', A: 86, fullMark: 150 },
  { subject: 'Score D', A: 99, fullMark: 150 },
  { subject: 'Score E', A: 65, fullMark: 150 },
];

const SkeletonPerformance = () => (
  <Card className="h-full dark:bg-[#0A0A0A]">
    <div className="animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
      <div className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded"></div>
    </div>
  </Card>
);

export const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({ loading }) => {
  if (loading) {
    return <SkeletonPerformance />;
  }

  return (
    <Card className="h-full dark:bg-[#0A0A0A]">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Shield className="text-blue-500" size={18}/> Portfolio Risiko DNA
      </h3>
      <div className="h-[300px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={defaultData}>
            <PolarGrid stroke="#e2e8f0" className="dark:stroke-white/10" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar name="Debtors" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
            <Tooltip contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff'}} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
