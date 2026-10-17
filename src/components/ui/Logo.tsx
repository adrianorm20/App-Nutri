import React from 'react';
import { Leaf } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', showSubtitle = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/20">
        <Leaf className={cn(iconSizes[size], 'stroke-[2.2]')} />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-white animate-pulse" />
      </div>
      <div>
        <div className={cn('font-bold tracking-tight text-slate-900 leading-none flex items-center', textSizes[size])}>
          <span>Adriano</span>
          <span className="text-emerald-600 ml-1">Nutri</span>
        </div>
        {showSubtitle && (
          <p className="text-xs font-medium text-slate-500 mt-0.5 tracking-wide">
            Gestão Nutricional Inteligente
          </p>
        )}
      </div>
    </div>
  );
};
