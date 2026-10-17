import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Users, Plus, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const PacientesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar className="hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="text-slate-400 hover:text-slate-700">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {id ? `Perfil do Paciente` : 'Pacientes'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {id ? `ID do Paciente: ${id}` : 'Gerenciamento de prontuários e consultas'}
              </p>
            </div>

            {!id && (
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors">
                <Plus className="w-4 h-4" />
                <span>Novo Paciente</span>
              </button>
            )}
          </div>

          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {id ? 'Ficha do Paciente' : 'Lista Geral de Pacientes'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Módulo de prontuário e cadastro detalhado de pacientes pronto para expansão.
            </p>
            <div className="pt-2">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
              >
                Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
