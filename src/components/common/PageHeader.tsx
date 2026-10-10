import React from 'react';

interface PageHeaderProps {
  title: string;
  category?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  category,
  description,
  actions
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#dbe3d8]">
      <div className="min-w-0 flex-1">
        {category && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a705e] uppercase tracking-wider mb-1">
            <span>{category}</span>
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-bold font-display text-[#112417] tracking-tight break-words">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[#5e7362] mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
