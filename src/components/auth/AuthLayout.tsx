import React from 'react';
import { Logo } from '../ui/Logo';
import { Sparkles, ShieldCheck, HeartPulse, Apple } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-emerald-50/60 via-slate-50 to-green-50/40 relative overflow-hidden">
      {/* Decorative background glows & shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-green-200/40 blur-3xl pointer-events-none" />
      
      {/* Decorative subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 min-h-screen">
        
        {/* Left Side: Brand presentation (Visible on desktop) */}
        <div className="hidden lg:flex flex-col justify-between flex-1 pr-12 py-8">
          <div className="space-y-6">
            <Logo size="lg" showSubtitle={true} />
            
            <div className="space-y-4 pt-8">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Plataforma completa para a sua prática{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  nutricional clínica
                </span>
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-lg">
                Gerencie pacientes, consultas antropométricas e elabore planos alimentares personalizados com agilidade e segurança total dos dados.
              </p>
            </div>

            {/* Benefit Badges */}
            <div className="grid grid-cols-1 gap-3.5 pt-4 max-w-md">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 border border-emerald-100 shadow-xs backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Acompanhamento Clínico</h4>
                  <p className="text-xs text-slate-500">Histórico de consultas e evolução corporal dos pacientes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 border border-emerald-100 shadow-xs backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-green-100 text-green-700">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Planos Alimentares Ágeis</h4>
                  <p className="text-xs text-slate-500">Estruturação completa de cardápios e prescrições</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 border border-emerald-100 shadow-xs backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Segurança com RLS e Neon</h4>
                  <p className="text-xs text-slate-500">Isolamento absoluto de dados por profissional</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Sistema desenvolvido para alta performance em nutrição</span>
          </div>
        </div>

        {/* Right Side: Auth Form Box */}
        <div className="w-full max-w-md my-auto">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <Logo size="md" showSubtitle={true} />
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/5 relative">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>

            {children}
          </div>

          {/* Footer Copyright */}
          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} NutriAdriano. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </div>
  );
};
