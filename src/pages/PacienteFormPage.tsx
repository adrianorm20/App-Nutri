import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  createPaciente,
  calculateAge,
  calculateIMC,
  formatTimeInput,
  formatPhoneNumber,
  type PacienteFormData
} from '../lib/pacientes';
import {
  User,
  HeartPulse,
  Coffee,
  Check,
  ChevronRight,
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  Sparkles,
  Save,
  Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

export const PacienteFormPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
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

  // Custom addition states
  const [customPatologia, setCustomPatologia] = useState('');
  const [customRestricao, setCustomRestricao] = useState('');
  const [customAlergia, setCustomAlergia] = useState('');

  // Derived values
  const age = calculateAge(formData.data_nascimento);
  const imcInfo = calculateIMC(formData.peso_inicial, formData.altura);

  const handleInputChange = (field: keyof PacienteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (
    field: 'objetivos' | 'patologias' | 'restricoes_alimentares' | 'alergias',
    item: string
  ) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (item === 'Nenhum') {
        return { ...prev, [field]: list.includes('Nenhum') ? [] : ['Nenhum'] };
      }
      const filtered = list.filter((i) => i !== 'Nenhum');
      if (filtered.includes(item)) {
        return { ...prev, [field]: filtered.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...filtered, item] };
      }
    });
  };

  const addCustomItem = (
    field: 'patologias' | 'restricoes_alimentares' | 'alergias',
    val: string,
    clearFn: (s: string) => void
  ) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const list = (prev[field] || []).filter((i) => i !== 'Nenhum');
      if (!list.includes(trimmed)) {
        return { ...prev, [field]: [...list, trimmed] };
      }
      return prev;
    });
    clearFn('');
  };

  const removeCustomItem = (
    field: 'patologias' | 'restricoes_alimentares' | 'alergias',
    item: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((i) => i !== item),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setErrorMessage('Por favor, informe o nome completo do paciente.');
      setActiveTab('pessoal');
      return;
    }

    if (!user?.email) {
      setErrorMessage('Sessão expirada. Faça login novamente.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const newId = await createPaciente(user.email, formData);
      setSuccessToast('Paciente cadastrado com sucesso!');
      setTimeout(() => {
        navigate(`/pacientes/${newId}`);
      }, 900);
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente:', err);
      setErrorMessage(err.message || 'Erro ao cadastrar paciente no banco de dados.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Fixa Desktop */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900 text-lg">
            Adriano <span className="text-emerald-600">Nutri</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Top Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/70">
            <div className="flex items-center gap-3">
              <Link
                to="/pacientes"
                className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                title="Voltar para a lista"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Novo Paciente
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Preencha as informações do paciente. Apenas o nome completo é obrigatório.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/pacientes"
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Salvar Paciente</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successToast && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fade-in shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successToast} Redirecionando para o perfil...</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('pessoal')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'pessoal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <User className="w-4 h-4" />
              <span>1. Pessoal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clinico')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'clinico'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>2. Clínico</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('habitos')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'habitos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>3. Hábitos</span>
            </button>
          </div>

          {/* Form Containers */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            {/* ========================================================
                ABA 1: DADOS PESSOAIS
               ======================================================== */}
            {activeTab === 'pessoal' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Informações Pessoais</h3>
                  <p className="text-xs text-slate-500">Dados de identificação e contato do paciente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome Completo */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nome Completo <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo da Silva"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Data de Nascimento & Idade */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Data de Nascimento
                      </label>
                      {age !== null && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {age} {age === 1 ? 'ano' : 'anos'}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Sexo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sexo
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Feminino', 'Masculino', 'Outro'].map((sexoOption) => {
                        const isSelected = formData.sexo === sexoOption;
                        return (
                          <button
                            key={sexoOption}
                            type="button"
                            onClick={() => handleInputChange('sexo', isSelected ? '' : sexoOption)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {sexoOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Telefone
                    </label>
                    <input
                      type="text"
                      placeholder="(00) 0000-0000"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', formatPhoneNumber(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="(00) 90000-0000"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', formatPhoneNumber(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="paciente@exemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('clinico')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Avançar para Clínico</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                ABA 2: DADOS CLÍNICOS
               ======================================================== */}
            {activeTab === 'clinico' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Avaliação Clínica & Objetivos</h3>
                  <p className="text-xs text-slate-500">Métricas corporais, condições de saúde e objetivos nutricionais.</p>
                </div>

                {/* Peso, Altura & IMC Calculado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Peso Atual
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="70.5"
                        value={formData.peso_inicial ?? ''}
                        onChange={(e) => handleInputChange('peso_inicial', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium bg-white"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        kg
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Altura
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        placeholder="175"
                        value={formData.altura ?? ''}
                        onChange={(e) => handleInputChange('altura', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium bg-white"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        cm
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      IMC (Automático)
                    </label>
                    <div className="h-[42px] px-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {imcInfo ? `${imcInfo.value} kg/m²` : '—'}
                      </span>
                      {imcInfo && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${imcInfo.color}`}>
                          {imcInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Objetivos (Múltipla escolha)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {OBJETIVOS_LIST.map((obj) => {
                      const isSelected = formData.objetivos?.includes(obj);
                      return (
                        <button
                          key={obj}
                          type="button"
                          onClick={() => toggleMultiSelect('objetivos', obj)}
                          className={`p-3 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{obj}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Outro objetivo específico ou observações sobre o plano..."
                    value={formData.objetivo_texto}
                    onChange={(e) => handleInputChange('objetivo_texto', e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm"
                  />
                </div>

                {/* Nível de Atividade Física */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nível de Atividade Física
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {ATIVIDADE_LIST.map((nivel) => {
                      const isSelected = formData.nivel_atividade === nivel;
                      return (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => handleInputChange('nivel_atividade', isSelected ? '' : nivel)}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {nivel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Patologias ou Condições de Saúde */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Patologias ou condições de saúde
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMultiSelect('patologias', 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        formData.patologias?.includes('Nenhum')
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Nenhum
                    </button>
                    {PATOLOGIAS_LIST.map((pat) => {
                      const isSelected = formData.patologias?.includes(pat);
                      return (
                        <button
                          key={pat}
                          type="button"
                          onClick={() => toggleMultiSelect('patologias', pat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pat}
                        </button>
                      );
                    })}
                    {/* Tags personalizadas */}
                    {formData.patologias
                      ?.filter((p) => !PATOLOGIAS_LIST.includes(p) && p !== 'Nenhum')
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCustomItem('patologias', custom)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex gap-2 max-w-sm mt-1">
                    <input
                      type="text"
                      placeholder="Outra condição..."
                      value={customPatologia}
                      onChange={(e) => setCustomPatologia(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomItem('patologias', customPatologia, setCustomPatologia);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomItem('patologias', customPatologia, setCustomPatologia)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </div>

                {/* Restrições Alimentares */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Restrições Alimentares
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMultiSelect('restricoes_alimentares', 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        formData.restricoes_alimentares?.includes('Nenhum')
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Nenhum
                    </button>
                    {RESTRICOES_LIST.map((rest) => {
                      const isSelected = formData.restricoes_alimentares?.includes(rest);
                      return (
                        <button
                          key={rest}
                          type="button"
                          onClick={() => toggleMultiSelect('restricoes_alimentares', rest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {rest}
                        </button>
                      );
                    })}
                    {formData.restricoes_alimentares
                      ?.filter((r) => !RESTRICOES_LIST.includes(r) && r !== 'Nenhum')
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCustomItem('restricoes_alimentares', custom)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex gap-2 max-w-sm mt-1">
                    <input
                      type="text"
                      placeholder="Outra restrição..."
                      value={customRestricao}
                      onChange={(e) => setCustomRestricao(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomItem('restricoes_alimentares', customRestricao, setCustomRestricao);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomItem('restricoes_alimentares', customRestricao, setCustomRestricao)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </div>

                {/* Alergias Alimentares */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Alergias Alimentares
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMultiSelect('alergias', 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        formData.alergias?.includes('Nenhum')
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Nenhum
                    </button>
                    {ALERGIAS_LIST.map((alerg) => {
                      const isSelected = formData.alergias?.includes(alerg);
                      return (
                        <button
                          key={alerg}
                          type="button"
                          onClick={() => toggleMultiSelect('alergias', alerg)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {alerg}
                        </button>
                      );
                    })}
                    {formData.alergias
                      ?.filter((a) => !ALERGIAS_LIST.includes(a) && a !== 'Nenhum')
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCustomItem('alergias', custom)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex gap-2 max-w-sm mt-1">
                    <input
                      type="text"
                      placeholder="Outra alergia..."
                      value={customAlergia}
                      onChange={(e) => setCustomAlergia(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomItem('alergias', customAlergia, setCustomAlergia);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomItem('alergias', customAlergia, setCustomAlergia)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </div>

                {/* Medicamentos & Suplementos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Medicamentos Contínuos
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Losartana 50mg pela manhã..."
                      value={formData.medicamentos}
                      onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Suplementos em Uso
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Creatina 5g, Vitamina D 2000UI..."
                      value={formData.suplementos}
                      onChange={(e) => handleInputChange('suplementos', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pessoal')}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    &larr; Voltar para Pessoal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('habitos')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Avançar para Hábitos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                ABA 3: HÁBITOS & ROTINA
               ======================================================== */}
            {activeTab === 'habitos' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Hábitos Diários & Rotina</h3>
                  <p className="text-xs text-slate-500">Refeições, horários de sono, hidratação e rotina de exercícios.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Refeições por dia */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Refeições / Dia
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Ex: 4"
                      value={formData.refeicoes_por_dia ?? ''}
                      onChange={(e) => handleInputChange('refeicoes_por_dia', e.target.value ? parseInt(e.target.value, 10) : null)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
                    />
                  </div>

                  {/* Horário que acorda */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Horário Acorda
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 6 → 06:00"
                      value={formData.horario_acorda}
                      onChange={(e) => handleInputChange('horario_acorda', e.target.value)}
                      onBlur={(e) => handleInputChange('horario_acorda', formatTimeInput(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
                    />
                    <span className="text-[10px] text-slate-400 block">Ex: 6 ou 630</span>
                  </div>

                  {/* Horário que dorme */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Horário Dorme
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 23 → 23:00"
                      value={formData.horario_dorme}
                      onChange={(e) => handleInputChange('horario_dorme', e.target.value)}
                      onBlur={(e) => handleInputChange('horario_dorme', formatTimeInput(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
                    />
                    <span className="text-[10px] text-slate-400 block">Ex: 23 ou 2230</span>
                  </div>

                  {/* Água por dia */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Água por Dia
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="2.5"
                        value={formData.litros_agua ?? ''}
                        onChange={(e) => handleInputChange('litros_agua', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full pr-14 pl-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        litros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pratica Atividade Física */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Pratica atividade física?</h4>
                      <p className="text-xs text-slate-500">Informe se o paciente realiza exercícios regulares.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange('atividade_fisica', false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          !formData.atividade_fisica
                            ? 'bg-slate-700 border-slate-700 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('atividade_fisica', true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          formData.atividade_fisica
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Sim
                      </button>
                    </div>
                  </div>

                  {formData.atividade_fisica && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5 animate-fade-in">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Qual atividade e frequência semanal?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Musculação 4x na semana e corrida aos sábados"
                        value={formData.atividade_fisica_descricao}
                        onChange={(e) => handleInputChange('atividade_fisica_descricao', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Observações Gerais */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Observações Gerais
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Informações adicionais relevantes sobre a rotina, preferências alimentares, histórico familiar, etc."
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('clinico')}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    &larr; Voltar para Clínico
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Finalizar e Salvar Paciente</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
};
