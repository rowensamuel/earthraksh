import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtext,
  trend,
  icon
}) => {
  return (
    <div className="bg-white border border-[#dbe3d8] p-4 sm:p-5 rounded-none transition-colors min-w-0 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
          <span className="text-[11px] sm:text-xs font-medium text-[#5c6e5f] uppercase tracking-wider truncate">
            {label}
          </span>
          {icon && <span className="text-[#3c5240] shrink-0">{icon}</span>}
        </div>

        <div className="flex items-baseline gap-1.5 mb-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#14291a] tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-[#6b7d6e] truncate">
              {unit}
            </span>
          )}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#607363] min-w-0 flex-wrap">
          {trend && (
            <span className={`font-semibold tabular-nums shrink-0 ${trend.isPositive ? 'text-[#1b5e20]' : 'text-[#b91c1c]'}`}>
              {trend.value}
            </span>
          )}
          {trend && subtext && <span aria-hidden="true">·</span>}
          {subtext && <span className="truncate text-[11px] sm:text-xs">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
