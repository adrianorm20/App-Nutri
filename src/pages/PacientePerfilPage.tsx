import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  fetchPacienteById,
  calculateAge,
  calculateIMC,
  formatDate,
  formatPhoneNumber,
  type PacienteFormData
} from '../lib/pacientes';
import {
  fetchConsultasByPaciente,
  createConsulta,
  fetchPlanosByPaciente,
  updatePaciente,
  type Consulta,
  type ConsultaFormData,
  type PlanoAlimentarItem
} from '../lib/consultas';
import { WeightEvolutionChart } from '../components/pacientes/WeightEvolutionChart';
import { NovaConsultaModal } from '../components/pacientes/NovaConsultaModal';
import { PlanoAlimentarSection } from '../components/pacientes/PlanoAlimentarSection';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Scale,
  Utensils,
  Plus,
  Save,
  CheckCircle2,
  UserCheck,
  Menu,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

const OBJETIVOS_LIST = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
];

const ATIVIDADE_LIST = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
];

const PATOLOGIAS_LIST = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
];

const RESTRICOES_LIST = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
];

const ALERGIAS_LIST = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
];

export const PacientePerfilPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<'dados' | 'consultas' | 'planos'>('dados');
  const [activeDataTab, setActiveDataTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal');

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Dados do paciente
  const [paciente, setPaciente] = useState<any | null>(null);
  const [formData, setFormData] = useState<PacienteFormData>({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: null,
    altura: null,
    objetivos: [],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [],
    restricoes_alimentares: [],
    alergias: [],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: null,
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: null,
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: '',
  });

  // Salvar alterações
  const [isSavingData, setIsSavingData] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Custom tags
  const [customPatologia, setCustomPatologia] = useState('');
  const [customRestricao, setCustomRestricao] = useState('');
  const [customAlergia, setCustomAlergia] = useState('');

  // Consultas
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isConsultaModalOpen, setIsConsultaModalOpen] = useState<boolean>(false);

  // Planos Alimentares
  const [planos, setPlanos] = useState<PlanoAlimentarItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      if (!id || !user?.email) return;

      setLoading(true);
      setLoadError(null);

      try {
        const [pacienteData, consultasList, planosList] = await Promise.all([
          fetchPacienteById(id, user.email),
          fetchConsultasByPaciente(id),
          fetchPlanosByPaciente(id),
        ]);

        if (!isMounted) return;

        if (pacienteData) {
          setPaciente(pacienteData);
          setFormData({
            nome: pacienteData.nome || '',
            data_nascimento: pacienteData.data_nascimento 
              ? (typeof pacienteData.data_nascimento === 'string' ? pacienteData.data_nascimento.split('T')[0] : new Date(pacienteData.data_nascimento).toISOString().split('T')[0])
              : '',
            sexo: pacienteData.sexo || '',
            telefone: pacienteData.whatsapp || '',
            whatsapp: pacienteData.whatsapp || '',
            email: pacienteData.email || '',
            peso_inicial: pacienteData.peso_inicial !== null ? parseFloat(pacienteData.peso_inicial) : null,
            altura: pacienteData.altura !== null ? parseFloat(pacienteData.altura) : null,
            objetivos: Array.isArray(pacienteData.objetivos) ? pacienteData.objetivos : [],
            objetivo_texto: pacienteData.objetivo_texto || '',
            nivel_atividade: pacienteData.nivel_atividade || '',
            patologias: Array.isArray(pacienteData.patologias) ? pacienteData.patologias : [],
            restricoes_alimentares: Array.isArray(pacienteData.restricoes_alimentares) ? pacienteData.restricoes_alimentares : [],
            alergias: Array.isArray(pacienteData.alergias) ? pacienteData.alergias : [],
            medicamentos: pacienteData.medicamentos || '',
            suplementos: pacienteData.suplementos || '',
            refeicoes_por_dia: pacienteData.refeicoes_por_dia !== null ? parseInt(pacienteData.refeicoes_por_dia, 10) : null,
            horario_acorda: pacienteData.horario_acorda || '',
            horario_dorme: pacienteData.horario_dorme || '',
            litros_agua: pacienteData.litros_agua !== null ? parseFloat(pacienteData.litros_agua) : null,
            atividade_fisica: !!pacienteData.atividade_fisica,
            atividade_fisica_descricao: pacienteData.atividade_fisica_descricao || '',
            observacoes: pacienteData.observacoes || '',
          });
        }

        setConsultas(consultasList);
        setPlanos(planosList);
      } catch (err: any) {
        console.error('Erro ao carregar dados completos do paciente:', err);
        if (isMounted) {
          setLoadError(err.message || 'Erro ao carregar os dados do paciente.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [id, user?.email]);

  // Handler para salvar edição dos dados
  const handleSaveDados = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user?.email) return;

    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    if (!formData.nome.trim()) {
      setSaveErrorMsg('O nome do paciente é obrigatório.');
      return;
    }

    setIsSavingData(true);
    try {
      await updatePaciente(id, user.email, formData);
      setPaciente((prev: any) => ({ ...prev, ...formData }));
      setSaveSuccessMsg('Alterações salvas com sucesso!');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Erro ao salvar alterações do paciente.');
    } finally {
      setIsSavingData(false);
    }
  };

  // Handler para salvar nova consulta
  const handleSaveConsulta = async (data: ConsultaFormData) => {
    if (!id) return;
    const nova = await createConsulta(id, data);
    setConsultas((prev) => [nova, ...prev]);
  };

  // Funções de toggle de tags
  const toggleArrayItem = (field: 'objetivos' | 'patologias' | 'restricoes_alimentares' | 'alergias', item: string) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const addCustomItem = (field: 'patologias' | 'restricoes_alimentares' | 'alergias', value: string, clearFn: (s: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(trimmed)) return prev;
      return { ...prev, [field]: [...current, trimmed] };
    });
    clearFn('');
  };

  // Cálculos derivados
  const age = calculateAge(formData.data_nascimento);
  const currentWeight = consultas.length > 0 && consultas[0].peso ? consultas[0].peso : formData.peso_inicial;
  const imcInfo = calculateIMC(currentWeight, formData.altura);

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
          {/* Top Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
            <div className="flex items-center gap-3">
              <Link
                to="/pacientes"
                className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                title="Voltar para Pacientes"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? 'Carregando perfil...' : formData.nome || 'Paciente'}
                  </h1>
                  {formData.sexo && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {formData.sexo}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prontuário completo, histórico de consultas e evolução
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            {!loading && paciente && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsConsultaModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nova Consulta
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-500">Buscando dados do paciente e prontuário...</p>
            </div>
          ) : loadError || !paciente ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-rose-200 shadow-xs">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-rose-800">Paciente não encontrado</h3>
              <p className="text-xs text-slate-500">{loadError || 'Este registro não existe ou não pertence à sua conta.'}</p>
              <div className="pt-2">
                <Link to="/pacientes" className="text-xs font-semibold text-emerald-600 hover:underline">
                  Voltar para lista de pacientes
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Card com Resumo Vital */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center border border-emerald-200 shrink-0">
                    {formData.nome ? formData.nome.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{formData.nome}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      {formData.data_nascimento && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(formData.data_nascimento)} {age !== null && `(${age} anos)`}
                        </span>
                      )}
                      {formData.whatsapp && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {formData.whatsapp}
                        </span>
                      )}
                      {formData.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {formData.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultas</span>
                    <span className="text-base font-extrabold text-slate-800">{consultas.length}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Peso Atual</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      {currentWeight ? `${currentWeight} kg` : '—'}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">IMC</span>
                    <span className="text-base font-extrabold text-slate-800">
                      {imcInfo ? imcInfo.value : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seletor Principal de Seções (3 Abas Principais) */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSection('dados')}
                  className={`pb-3.5 px-5 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeSection === 'dados'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Dados do Paciente
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('consultas')}
                  className={`pb-3.5 px-5 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeSection === 'consultas'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  Consultas ({consultas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('planos')}
                  className={`pb-3.5 px-5 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeSection === 'planos'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  Planos Alimentares ({planos.length})
                </button>
              </div>

              {/* ========================================================= */}
              {/* SEÇÃO 1: DADOS DO PACIENTE (EDITÁVEIS EM 3 ABAS) */}
              {/* ========================================================= */}
              {activeSection === 'dados' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                  {/* Toast de Feedback */}
                  {saveSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      {saveSuccessMsg}
                    </div>
                  )}

                  {saveErrorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      {saveErrorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveDados} className="space-y-6">
                    {/* Sub-abas: Pessoal / Clínico / Hábitos */}
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-md">
                      <button
                        type="button"
                        onClick={() => setActiveDataTab('pessoal')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          activeDataTab === 'pessoal'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Pessoal
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDataTab('clinico')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          activeDataTab === 'clinico'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Clínico
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDataTab('habitos')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          activeDataTab === 'habitos'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Hábitos
                      </button>
                    </div>

                    {/* ABA 1: DADOS PESSOAIS */}
                    {activeDataTab === 'pessoal' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Nome Completo *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.nome}
                              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Data de Nascimento
                            </label>
                            <input
                              type="date"
                              value={formData.data_nascimento ?? ''}
                              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Sexo
                            </label>
                            <select
                              value={formData.sexo ?? ''}
                              onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            >
                              <option value="">Selecione...</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              WhatsApp / Telefone
                            </label>
                            <input
                              type="text"
                              placeholder="(00) 00000-0000"
                              value={formData.whatsapp ?? ''}
                              onChange={(e) => setFormData({ ...formData, whatsapp: formatPhoneNumber(e.target.value) })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Email
                            </label>
                            <input
                              type="email"
                              placeholder="paciente@exemplo.com"
                              value={formData.email ?? ''}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ABA 2: DADOS CLÍNICOS */}
                    {activeDataTab === 'clinico' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Peso Inicial (kg)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={formData.peso_inicial ?? ''}
                              onChange={(e) => setFormData({ ...formData, peso_inicial: e.target.value ? parseFloat(e.target.value) : null })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Altura (cm)
                            </label>
                            <input
                              type="number"
                              step="1"
                              value={formData.altura ?? ''}
                              onChange={(e) => setFormData({ ...formData, altura: e.target.value ? parseFloat(e.target.value) : null })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Objetivos */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            Objetivos Nutricionais
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {OBJETIVOS_LIST.map((obj) => {
                              const isSelected = formData.objetivos?.includes(obj);
                              return (
                                <button
                                  key={obj}
                                  type="button"
                                  onClick={() => toggleArrayItem('objetivos', obj)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {obj}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-3">
                            <input
                              type="text"
                              placeholder="Detalhes ou observações sobre o objetivo..."
                              value={formData.objetivo_texto ?? ''}
                              onChange={(e) => setFormData({ ...formData, objetivo_texto: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Nível de Atividade */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Nível de Atividade Física
                          </label>
                          <select
                            value={formData.nivel_atividade ?? ''}
                            onChange={(e) => setFormData({ ...formData, nivel_atividade: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          >
                            <option value="">Selecione...</option>
                            {ATIVIDADE_LIST.map((ativ) => (
                              <option key={ativ} value={ativ}>{ativ}</option>
                            ))}
                          </select>
                        </div>

                        {/* Patologias */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            Patologias / Condições Médicas
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {PATOLOGIAS_LIST.map((pat) => {
                              const isSelected = formData.patologias?.includes(pat);
                              return (
                                <button
                                  key={pat}
                                  type="button"
                                  onClick={() => toggleArrayItem('patologias', pat)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {pat}
                                </button>
                              );
                            })}
                          </div>
                          {/* Custom patologias adicionadas */}
                          {formData.patologias && formData.patologias.some((p) => !PATOLOGIAS_LIST.includes(p)) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {formData.patologias.filter((p) => !PATOLOGIAS_LIST.includes(p)).map((custom) => (
                                <span key={custom} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                                  {custom}
                                  <button type="button" onClick={() => toggleArrayItem('patologias', custom)}>
                                    <X className="w-3 h-3 text-rose-500 hover:text-rose-800" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Outra patologia..."
                              value={customPatologia}
                              onChange={(e) => setCustomPatologia(e.target.value)}
                              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => addCustomItem('patologias', customPatologia, setCustomPatologia)}
                              className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>

                        {/* Restrições Alimentares */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            Restrições Alimentares
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {RESTRICOES_LIST.map((rest) => {
                              const isSelected = formData.restricoes_alimentares?.includes(rest);
                              return (
                                <button
                                  key={rest}
                                  type="button"
                                  onClick={() => toggleArrayItem('restricoes_alimentares', rest)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {rest}
                                </button>
                              );
                            })}
                          </div>
                          {formData.restricoes_alimentares && formData.restricoes_alimentares.some((r) => !RESTRICOES_LIST.includes(r)) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {formData.restricoes_alimentares.filter((r) => !RESTRICOES_LIST.includes(r)).map((custom) => (
                                <span key={custom} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                                  {custom}
                                  <button type="button" onClick={() => toggleArrayItem('restricoes_alimentares', custom)}>
                                    <X className="w-3 h-3 text-amber-500 hover:text-amber-800" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Outra restrição..."
                              value={customRestricao}
                              onChange={(e) => setCustomRestricao(e.target.value)}
                              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => addCustomItem('restricoes_alimentares', customRestricao, setCustomRestricao)}
                              className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>

                        {/* Alergias */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            Alergias Alimentares
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {ALERGIAS_LIST.map((alg) => {
                              const isSelected = formData.alergias?.includes(alg);
                              return (
                                <button
                                  key={alg}
                                  type="button"
                                  onClick={() => toggleArrayItem('alergias', alg)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {alg}
                                </button>
                              );
                            })}
                          </div>
                          {formData.alergias && formData.alergias.some((a) => !ALERGIAS_LIST.includes(a)) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {formData.alergias.filter((a) => !ALERGIAS_LIST.includes(a)).map((custom) => (
                                <span key={custom} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                                  {custom}
                                  <button type="button" onClick={() => toggleArrayItem('alergias', custom)}>
                                    <X className="w-3 h-3 text-purple-500 hover:text-purple-800" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Outra alergia..."
                              value={customAlergia}
                              onChange={(e) => setCustomAlergia(e.target.value)}
                              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => addCustomItem('alergias', customAlergia, setCustomAlergia)}
                              className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>

                        {/* Medicamentos & Suplementos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Medicamentos Contínuos
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Losartana 50mg, Metformina"
                              value={formData.medicamentos ?? ''}
                              onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Suplementos em Uso
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Creatina, Whey Protein, Vitamina D"
                              value={formData.suplementos ?? ''}
                              onChange={(e) => setFormData({ ...formData, suplementos: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ABA 3: HÁBITOS */}
                    {activeDataTab === 'habitos' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Refeições ao Dia
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              placeholder="Ex: 4"
                              value={formData.refeicoes_por_dia ?? ''}
                              onChange={(e) => setFormData({ ...formData, refeicoes_por_dia: e.target.value ? parseInt(e.target.value, 10) : null })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Água Diária (Litros)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 2.5"
                              value={formData.litros_agua ?? ''}
                              onChange={(e) => setFormData({ ...formData, litros_agua: e.target.value ? parseFloat(e.target.value) : null })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Horário que Acorda
                            </label>
                            <input
                              type="text"
                              placeholder="07:00"
                              value={formData.horario_acorda ?? ''}
                              onChange={(e) => setFormData({ ...formData, horario_acorda: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                              Horário que Dorme
                            </label>
                            <input
                              type="text"
                              placeholder="23:00"
                              value={formData.horario_dorme ?? ''}
                              onChange={(e) => setFormData({ ...formData, horario_dorme: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Atividade física */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!formData.atividade_fisica}
                              onChange={(e) => setFormData({ ...formData, atividade_fisica: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Pratica atividade física regularmente?
                            </span>
                          </label>

                          {formData.atividade_fisica && (
                            <div>
                              <input
                                type="text"
                                placeholder="Qual modalidade e frequência? (Ex: Musculação 4x na semana)"
                                value={formData.atividade_fisica_descricao ?? ''}
                                onChange={(e) => setFormData({ ...formData, atividade_fisica_descricao: e.target.value })}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          )}
                        </div>

                        {/* Observações */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Observações Gerais
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Anotações adicionais do paciente..."
                            value={formData.observacoes ?? ''}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Botão de Salvar Alterações */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={isSavingData}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50"
                      >
                        {isSavingData ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Salvar alterações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================= */}
              {/* SEÇÃO 2: CONSULTAS (GRÁFICO + LISTA + MODAL) */}
              {/* ========================================================= */}
              {activeSection === 'consultas' && (
                <div className="space-y-6">
                  {/* Gráfico de Evolução de Peso sempre visível */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Evolução do Peso Corporal</h3>
                        <p className="text-xs text-slate-500">Histórico de pesagem ao longo das consultas realizadas</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsConsultaModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xs hover:bg-emerald-700 transition-colors self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Nova Consulta
                      </button>
                    </div>

                    <WeightEvolutionChart
                      initialWeight={formData.peso_inicial}
                      initialDate={paciente.created_at}
                      consultas={consultas}
                    />
                  </div>

                  {/* Lista de Consultas Cronológica Decrescente */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">
                        Histórico de Consultas ({consultas.length})
                      </h3>
                      <span className="text-xs text-slate-400">Ordenadas da mais recente para a mais antiga</span>
                    </div>

                    {consultas.length === 0 ? (
                      <div className="p-12 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-sm font-semibold text-slate-700">Nenhuma consulta realizada</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Clique em "Nova Consulta" para registrar o primeiro retorno, peso e medidas deste paciente.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setIsConsultaModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Registrar Consulta
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {consultas.map((c) => (
                          <div
                            key={c.id}
                            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-200 transition-all shadow-2xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs">
                                  <Calendar className="w-4 h-4" />
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 text-sm">
                                    Consulta em {formatDate(c.data_consulta)}
                                  </span>
                                  {c.proximo_retorno && (
                                    <p className="text-[11px] text-emerald-700 font-medium">
                                      Próximo retorno: {formatDate(c.proximo_retorno)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-sm">
                                  {c.peso ? `${c.peso} kg` : 'Sem peso'}
                                </span>
                              </div>
                            </div>

                            {/* Medidas Corporais */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cintura</span>
                                <span className="font-bold text-slate-800 text-sm">{c.cintura ? `${c.cintura} cm` : '—'}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quadril</span>
                                <span className="font-bold text-slate-800 text-sm">{c.quadril ? `${c.quadril} cm` : '—'}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">% Gordura</span>
                                <span className="font-bold text-slate-800 text-sm">{c.percentual_gordura ? `${c.percentual_gordura}%` : '—'}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registrado em</span>
                                <span className="font-medium text-slate-600 text-xs">{formatDate(c.created_at)}</span>
                              </div>
                            </div>

                            {/* Observações da Consulta */}
                            {c.observacoes && (
                              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700">
                                <span className="font-bold text-slate-900 block mb-1">Observações da Consulta:</span>
                                <p className="whitespace-pre-line leading-relaxed">{c.observacoes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SEÇÃO 3: PLANOS ALIMENTARES COM IA GEMINI */}
              {/* ========================================================= */}
              {activeSection === 'planos' && (
                <PlanoAlimentarSection
                  pacienteId={id!}
                  pacienteData={paciente}
                  planos={planos}
                  onPlanoSaved={(novoPlano) => {
                    setPlanos((prev) => [novoPlano, ...prev]);
                  }}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal de Nova Consulta */}
      <NovaConsultaModal
        isOpen={isConsultaModalOpen}
        onClose={() => setIsConsultaModalOpen(false)}
        onSave={handleSaveConsulta}
        lastWeight={currentWeight}
      />
    </div>
  );
};
