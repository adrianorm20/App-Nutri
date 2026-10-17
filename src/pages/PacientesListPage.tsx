import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { fetchPacientes, formatDate, type PacienteListItem } from '../lib/pacientes';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Target, 
  ChevronRight, 
  UserPlus,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PacientesListPage: React.FC = () => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadPacientes = useCallback(async (search = '', showRefreshing = false) => {
    if (!user?.email) return;
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await fetchPacientes(user.email, search);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadPacientes(searchTerm);
  }, [loadPacientes, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop Fixa */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar className="w-full h-full border-r-0" />
          </div>
        </div>
      )}

      {/* Container Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900 text-lg">Adriano <span className="text-emerald-600">Nutri</span></span>
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header & Botão Novo Paciente */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/70">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pacientes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Gerencie seus pacientes cadastrados e acesse o prontuário nutricional.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadPacientes(searchTerm, true)}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
                title="Recarregar"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <Link
                to="/pacientes/novo"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Paciente</span>
              </Link>
            </div>
          </div>

          {/* Campo de Busca por Nome */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Listagem de Pacientes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-500">Carregando pacientes cadastrados...</p>
              </div>
            ) : pacientes.length === 0 ? (
              <div className="p-12 sm:p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {searchTerm ? 'Nenhum paciente encontrado com esse nome' : 'Nenhum paciente cadastrado ainda'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchTerm 
                      ? 'Tente buscar com outro termo ou limpe o campo de pesquisa.' 
                      : 'Cadastre seu primeiro paciente para começar a montar planos alimentares e registrar consultas.'}
                  </p>
                </div>
                {!searchTerm && (
                  <div className="pt-2">
                    <Link
                      to="/pacientes/novo"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastrar Primeiro Paciente</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pacientes.map((paciente) => {
                  const objetivosText = paciente.objetivos && paciente.objetivos.length > 0 
                    ? paciente.objetivos.join(', ') 
                    : (paciente.objetivo_texto || 'Não informado');

                  return (
                    <Link
                      key={paciente.id}
                      to={`/pacientes/${paciente.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/80 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center border border-emerald-100/80 group-hover:scale-105 transition-transform shrink-0">
                          {paciente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                            {paciente.nome}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[240px] sm:max-w-xs">{objetivosText}</span>
                            </span>
                            {paciente.whatsapp && (
                              <span className="hidden sm:inline text-slate-400">
                                {paciente.whatsapp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-15 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Última Consulta
                          </span>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 sm:justify-end">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : 'Sem consultas registradas'}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer count info */}
          {pacientes.length > 0 && (
            <div className="text-xs text-slate-500 px-1 text-right">
              Total de <strong>{pacientes.length}</strong> {pacientes.length === 1 ? 'paciente exibido' : 'pacientes exibidos'}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
