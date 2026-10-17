import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { fetchPacienteById, calculateAge, calculateIMC, formatDate } from '../lib/pacientes';
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Phone, 
  Scale, 
  Ruler, 
  Heart, 
  Activity, 
  Utensils,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export const PacientePerfilPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [paciente, setPaciente] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!id) return;
      if (!user?.email) {
        // Se ainda está carregando a sessão, aguarda
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchPacienteById(id, user.email);
        if (isMounted) {
          setPaciente(data);
        }
      } catch (err: any) {
        console.error('Erro ao carregar paciente:', err);
        if (isMounted) {
          setLoadError(err.message || 'Erro ao carregar os dados do paciente.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, user?.email]);

  const age = calculateAge(paciente?.data_nascimento);
  const imcInfo = calculateIMC(paciente?.peso_inicial, paciente?.altura);

  return (
    <div className="min-h-screen bg-slate-50 flex">
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

        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Top Breadcrumb */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-200/70">
            <Link
              to="/pacientes"
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? 'Carregando perfil...' : paciente?.nome || 'Paciente não encontrado'}
                </h1>
                {paciente?.sexo && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {paciente.sexo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Prontuário e ficha clínica nutricional
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500">Buscando dados do paciente...</p>
            </div>
          ) : loadError ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-rose-200">
              <h3 className="text-lg font-bold text-rose-800">Falha ao carregar dados do paciente</h3>
              <p className="text-xs text-slate-500">{loadError}</p>
              <div className="pt-2">
                <Link to="/pacientes" className="text-xs font-semibold text-emerald-600 hover:underline">
                  Voltar para lista de pacientes
                </Link>
              </div>
            </div>
          ) : !paciente ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-800">Paciente não encontrado</h3>
              <p className="text-xs text-slate-500">
                O paciente solicitado não existe ou você não possui permissão para acessá-lo.
              </p>
              <div className="pt-2">
                <Link to="/pacientes" className="text-xs font-semibold text-emerald-600 hover:underline">
                  Voltar para lista de pacientes
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Card do Paciente */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center border border-emerald-200 shrink-0">
                    {paciente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{paciente.nome}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      {paciente.data_nascimento && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(paciente.data_nascimento)} {age !== null && `(${age} anos)`}
                        </span>
                      )}
                      {paciente.whatsapp && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {paciente.whatsapp}
                        </span>
                      )}
                      {paciente.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {paciente.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <UserCheck className="w-4 h-4" />
                    Paciente Ativo
                  </span>
                </div>
              </div>

              {/* Grid de 3 Colunas: Métricas Clínicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peso Inicial</span>
                    <Scale className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900">
                    {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '—'}
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Altura</span>
                    <Ruler className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900">
                    {paciente.altura ? `${paciente.altura} cm` : '—'}
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">IMC Inicial</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {imcInfo ? `${imcInfo.value}` : '—'}
                    </span>
                    {imcInfo && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${imcInfo.color}`}>
                        {imcInfo.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalhes Clínicos e Hábitos em Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Clínico */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <h3 className="text-base font-bold text-slate-900">Avaliação Clínica & Objetivos</h3>
                  </div>

                  {/* Objetivos */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Objetivos</span>
                    <div className="flex flex-wrap gap-1.5">
                      {paciente.objetivos && paciente.objetivos.length > 0 ? (
                        paciente.objetivos.map((obj: string) => (
                          <span key={obj} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {obj}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Nenhum objetivo listado</span>
                      )}
                    </div>
                    {paciente.objetivo_texto && (
                      <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{paciente.objetivo_texto}"
                      </p>
                    )}
                  </div>

                  {/* Nível de Atividade */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Nível de Atividade Física</span>
                    <p className="text-xs font-semibold text-slate-800">{paciente.nivel_atividade || 'Não informado'}</p>
                  </div>

                  {/* Patologias */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Patologias / Condições</span>
                    <p className="text-xs text-slate-700">
                      {paciente.patologias && paciente.patologias.length > 0 ? paciente.patologias.join(', ') : 'Nenhuma'}
                    </p>
                  </div>

                  {/* Restrições */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Restrições Alimentares</span>
                    <p className="text-xs text-slate-700">
                      {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? paciente.restricoes_alimentares.join(', ') : 'Nenhuma'}
                    </p>
                  </div>

                  {/* Alergias */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Alergias Alimentares</span>
                    <p className="text-xs text-slate-700">
                      {paciente.alergias && paciente.alergias.length > 0 ? paciente.alergias.join(', ') : 'Nenhuma'}
                    </p>
                  </div>

                  {/* Medicamentos & Suplementos */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs">
                      <span className="font-bold text-slate-700">Medicamentos contínuos: </span>
                      <span className="text-slate-600">{paciente.medicamentos || 'Nenhum'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-700">Suplementos em uso: </span>
                      <span className="text-slate-600">{paciente.suplementos || 'Nenhum'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Hábitos & Rotina */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">Hábitos Diários & Rotina</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block">Refeições ao dia:</span>
                      <span className="font-bold text-slate-800 text-sm">{paciente.refeicoes_por_dia || '—'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block">Ingestão de água:</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {paciente.litros_agua ? `${paciente.litros_agua} L` : '—'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block">Horário acorda:</span>
                      <span className="font-bold text-slate-800 text-sm">{paciente.horario_acorda || '—'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block">Horário dorme:</span>
                      <span className="font-bold text-slate-800 text-sm">{paciente.horario_dorme || '—'}</span>
                    </div>
                  </div>

                  {/* Exercício */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">Prática de Atividade Física</span>
                    <p className="text-xs text-slate-600">
                      {paciente.atividade_fisica 
                        ? (paciente.atividade_fisica_descricao || 'Sim (atividade regular)') 
                        : 'Não pratica atividade física'}
                    </p>
                  </div>

                  {/* Observações */}
                  {paciente.observacoes && (
                    <div className="space-y-1 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Observações Gerais</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {paciente.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Informações de Cadastro */}
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                    <span>Cadastrado em {formatDate(paciente.created_at)}</span>
                    <span>Última consulta: {formatDate(paciente.ultimaConsulta)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
