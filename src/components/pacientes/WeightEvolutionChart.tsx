import React, { useState } from 'react';
import { formatDate } from '../../lib/pacientes';

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightEvolutionChartProps {
  initialWeight?: number | null;
  initialDate?: string | null;
  consultas: { data_consulta: string; peso: number | null }[];
}

export const WeightEvolutionChart: React.FC<WeightEvolutionChartProps> = ({
  initialWeight,
  initialDate,
  consultas,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WeightDataPoint | null>(null);

  // Monta a série de pontos cronologicamente ordenada (antigo -> recente)
  const points: WeightDataPoint[] = [];

  // Se houver peso inicial, adiciona como ponto de partida
  if (initialWeight && Number(initialWeight) > 0) {
    points.push({
      date: initialDate || 'Início',
      weight: Number(initialWeight),
    });
  }

  // Pega as consultas com peso válido e ordena por data crescente
  const sortedConsultas = [...consultas]
    .filter((c) => c.peso !== null && Number(c.peso) > 0)
    .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime());

  sortedConsultas.forEach((c) => {
    points.push({
      date: c.data_consulta,
      weight: Number(c.peso),
    });
  });

  if (points.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">Nenhuma consulta registrada ainda</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Cadastre uma nova consulta para acompanhar a curva de peso do paciente ao longo do tempo.
        </p>
      </div>
    );
  }

  // Dimensões do SVG
  const width = 800;
  const height = 240;
  const paddingX = 50;
  const paddingY = 40;

  const weights = points.map((p) => p.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const weightSpan = maxW - minW || 5;

  const yMin = Math.max(0, Math.floor(minW - weightSpan * 0.15));
  const yMax = Math.ceil(maxW + weightSpan * 0.15);

  const getX = (index: number) => {
    if (points.length === 1) return width / 2;
    return paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  };

  const getY = (w: number) => {
    return height - paddingY - ((w - yMin) / (yMax - yMin)) * (height - paddingY * 2);
  };

  // Gerar o path SVG
  const pathData = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.weight)}`)
    .join(' ');

  // Gerar o gradiente fechado sob a curva
  const areaData = points.length > 1
    ? `${pathData} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`
    : '';

  // Variação total
  const firstW = points[0].weight;
  const lastW = points[points.length - 1].weight;
  const diff = Number((lastW - firstW).toFixed(1));

  return (
    <div className="space-y-4">
      {/* Top badges com resumo */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500 font-medium">Peso Inicial:</span>
            <span className="font-bold text-slate-800">{firstW} kg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
            <span className="text-slate-500 font-medium">Peso Atual:</span>
            <span className="font-bold text-slate-800">{lastW} kg</span>
          </div>
        </div>

        {points.length > 1 && (
          <div className={`px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1 ${
            diff < 0 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : diff > 0 
              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
              : 'bg-slate-100 text-slate-700'
          }`}>
            <span>{diff < 0 ? '↓ Redução' : diff > 0 ? '↑ Ganho' : '— Manutenção'}:</span>
            <span>{Math.abs(diff)} kg</span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="relative bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 sm:h-64 overflow-visible">
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade Horizontais */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = yMin + (yMax - yMin) * ratio;
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-semibold"
                >
                  {val.toFixed(0)} kg
                </text>
              </g>
            );
          })}

          {/* Área com gradiente */}
          {areaData && (
            <path d={areaData} fill="url(#weightGradient)" />
          )}

          {/* Linha principal da evolução */}
          {points.length > 1 && (
            <path
              d={pathData}
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Marcadores em cada ponto */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.weight);
            const isHovered = hoveredPoint?.date === p.date && hoveredPoint?.weight === p.weight;

            return (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 5}
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth={isHovered ? 4 : 2.5}
                  className="transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Label da data no eixo X */}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {formatDate(p.date)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip interativo */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl text-xs shadow-lg pointer-events-none flex items-center gap-2">
            <span className="font-semibold text-emerald-400">{hoveredPoint.weight} kg</span>
            <span className="text-slate-300">({formatDate(hoveredPoint.date)})</span>
          </div>
        )}
      </div>
    </div>
  );
};
