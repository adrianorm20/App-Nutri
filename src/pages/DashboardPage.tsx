import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CalendarDays, 
  Clock, 
  RefreshCw, 
  ArrowRight,
  UserCheck,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardData, type DashboardMetrics } from '../lib/dashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const loadData = React.useCallback(async (showIndicator = false) => {
    if (!user?.email) return;
    if (showIndicator) setIsRefreshing(true);
    try {
      const data = await fetchDashboardData(user.email);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.email]);

  React.useEffect(() => {
    loadData();
    // Intervalo para atualizar em tempo real a cada 15 segundos
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

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

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Mobile */}
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

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Acompanhe o ritmo do seu consultório e seus pacientes em tempo real.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-emerald-700 shadow-2xs transition-all active:scale-95 disabled:opacity-60"
                title="Sincronizar dados agora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
              
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tempo Real
              </div>
            </div>
          </div>

          {/* Cards Principais (Grid de Informação) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 — Total de pacientes ativos */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Card 1
                  </span>
                  <h3 className="text-base font-semibold text-slate-700 mt-0.5">
                    Total de pacientes ativos
                  </h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
                    ) : (
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                        {metrics.totalPacientes}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">cadastrados</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Vinculados ao seu perfil
                </span>
                <Link to="/pacientes" className="text-emerald-600 font-semibold hover:underline flex items-center gap-0.5">
                  Ver todos &rarr;
                </Link>
              </div>

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
            </div>

            {/* Card 2 — Consultas da semana */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Card 2
                  </span>
                  <h3 className="text-base font-semibold text-slate-700 mt-0.5">
                    Consultas da semana
                  </h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
                    ) : (
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-green-600 transition-colors">
                        {metrics.consultasSemana}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">na semana atual</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100/80 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Registradas nesta semana</span>
                <span className="font-medium text-slate-700">Seg — Dom</span>
              </div>

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-teal-400" />
            </div>

            {/* Indicador adicional / resumo */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all group md:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Atenção
                  </span>
                  <h3 className="text-base font-semibold text-slate-700 mt-0.5">
                    Pacientes pendentes
                  </h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
                    ) : (
                      <span className="text-4xl font-extrabold text-amber-600 tracking-tight">
                        {metrics.pacientesSemRetorno.length}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">sem retorno</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Última consulta &gt; 30 dias</span>
                <span className="text-amber-600 font-medium">Requer contato</span>
              </div>

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            </div>

          </div>

          {/* Card 3 — Pacientes sem retorno (Lista Detalhada e Clicável) */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Card 3 — Pacientes sem retorno
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado.
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-center text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {metrics.pacientesSemRetorno.length} pendente(s)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-500">Consultando pacientes no banco de dados...</p>
                </div>
              ) : metrics.pacientesSemRetorno.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Nenhum paciente sem retorno no momento
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Excelente trabalho! Todos os seus pacientes atendidos recentemente possuem retornos marcados ou foram consultados nos últimos 30 dias.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <th className="py-3 px-6">Nome do Paciente</th>
                        <th className="py-3 px-6">Última Consulta</th>
                        <th className="py-3 px-6">Tempo sem Retorno</th>
                        <th className="py-3 px-6 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {metrics.pacientesSemRetorno.map((paciente) => (
                        <tr 
                          key={paciente.id} 
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <Link 
                              to={`/pacientes/${paciente.id}`}
                              className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors block"
                            >
                              {paciente.nome}
                            </Link>
                            {paciente.email && (
                              <span className="text-xs text-slate-400 block">{paciente.email}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {formatDate(paciente.ultimaConsulta)}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {paciente.diasSemConsulta} dias atrás
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              to={`/pacientes/${paciente.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                              <span>Ver Perfil</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {metrics.pacientesSemRetorno.length > 0 && (
              <div className="p-4 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 text-center">
                Clique no nome ou no botão de ação para abrir o perfil clínico do paciente.
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
