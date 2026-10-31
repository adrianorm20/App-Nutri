import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Loader2,
  Calendar,
  Coffee,
  Sun,
  UtensilsCrossed,
  Cookie,
  Moon,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { formatDate } from '../../lib/pacientes';
import {
  createPlanoAlimentar,
  type PlanoAlimentarItem
} from '../../lib/consultas';
import { gerarPlanoComGemini } from '../../lib/gemini';

export interface DiaPlano {
  dia: string;
  refeicoes: {
    cafe_da_manha: string[];
    lanche_manha: string[];
    almoco: string[];
    lanche_tarde: string[];
    jantar: string[];
  };
}

export interface PlanoAlimentarSemanal {
  plano_semanal: DiaPlano[];
}

interface PlanoAlimentarSectionProps {
  pacienteId: string;
  pacienteData: any;
  planos: PlanoAlimentarItem[];
  onPlanoSaved: (novoPlano: PlanoAlimentarItem) => void;
}

const DIAS_PADRAO = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

const REFEICOES_CONFIG = [
  { key: 'cafe_da_manha', label: 'Café da Manhã', icon: Coffee, color: 'text-amber-600 bg-amber-50' },
  { key: 'lanche_manha', label: 'Lanche da Manhã', icon: Sun, color: 'text-orange-600 bg-orange-50' },
  { key: 'almoco', label: 'Almoço', icon: UtensilsCrossed, color: 'text-emerald-700 bg-emerald-50' },
  { key: 'lanche_tarde', label: 'Lanche da Tarde', icon: Cookie, color: 'text-teal-700 bg-teal-50' },
  { key: 'jantar', label: 'Jantar', icon: Moon, color: 'text-indigo-700 bg-indigo-50' },
] as const;

export function criarPlanoManualVazio(): PlanoAlimentarSemanal {
  return {
    plano_semanal: DIAS_PADRAO.map((dia) => ({
      dia,
      refeicoes: {
        cafe_da_manha: [
          'Ovos mexidos com azeite de oliva e orégano',
          'Pão 100% integral ou tapioca com queijo branco',
          'Mamão papaia com sementes de chia',
          'Café sem açúcar ou com canela',
          'Suco verde natural sem açúcar (couve, limão e gengibre)',
        ],
        lanche_manha: [
          'Iogurte natural desnatado com aveia em flocos',
          '1 maçã fatiada com canela em pó',
          'Mix de castanhas (3 castanhas-do-pará e 4 nozes)',
          'Banana com pasta de amendoim integral',
          'Pera fresca higienizada',
        ],
        almoco: [
          'Arroz integral (4 colheres de sopa) com feijão carioca (1 concha)',
          'Filé de peito de frango grelhado com ervas',
          'Salada de folhas verdes à vontade (alface, rúcula, agrião)',
          'Legumes no vapor (cenoura, abobrinha e brócolis)',
          '1 colher de sobremesa de azeite de oliva extravirgem',
        ],
        lanche_tarde: [
          'Crepioca recheada com queijo cottage',
          'Vitamina de leite vegetal com morango e aveia',
          'Sanduíche natural de atum com folhas',
          '1 taça de salada de frutas com sementes de linhaça',
          'Bolo caseiro de banana sem açúcar com aveia',
        ],
        jantar: [
          'Sopa de legumes com cubos de patinho desfiado',
          'Filé de tilápia grelhado com purê de mandioquinha',
          'Omelete recheado com espinafre e tomate cereja',
          'Prato de salada colorida com grão-de-bico cozido',
          'Mix de vegetais assados com azeite e ervas finas',
        ],
      },
    })),
  };
}

export const PlanoAlimentarSection: React.FC<PlanoAlimentarSectionProps> = ({
  pacienteId,
  pacienteData,
  planos,
  onPlanoSaved,
}) => {
  // Estado do plano em edição / gerado
  const [planoEmEdicao, setPlanoEmEdicao] = useState<PlanoAlimentarSemanal | null>(null);
  const [diaAtivo, setDiaAtivo] = useState<string>('Segunda-feira');

  // Loading com mensagens dinâmicas
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Analisando perfil do paciente...');
  const [isSaving, setIsSaving] = useState(false);

  // Mensagens e feedbacks
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Plano selecionado do histórico para visualização
  const [selectedHistoricoPlano, setSelectedHistoricoPlano] = useState<PlanoAlimentarItem | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Gerador com IA via Serverless Function
  const handleGerarComIA = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setToastMessage(null);
    setLoadingStepText('Buscando dados e histórico do paciente...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStepText('IA calculando metas calóricas e restrições...');
    }, 2000);

    const stepTimer2 = setTimeout(() => {
      setLoadingStepText('Montando cardápio semanal variado (culinária brasileira)...');
    }, 5500);

    const stepTimer3 = setTimeout(() => {
      setLoadingStepText('Finalizando estrutura e opções de substituição...');
    }, 9000);

    try {
      // Prepara payload detalhado com base nos dados do paciente
      const payloadPaciente = {
        nome: pacienteData.nome,
        idade: pacienteData.data_nascimento,
        sexo: pacienteData.sexo,
        peso_atual_kg: pacienteData.peso_inicial,
        altura_cm: pacienteData.altura,
        objetivos: pacienteData.objetivos,
        objetivo_especifico: pacienteData.objetivo_texto,
        nivel_atividade_fisica: pacienteData.nivel_atividade,
        patologias: pacienteData.patologias,
        restricoes_alimentares: pacienteData.restricoes_alimentares,
        alergias: pacienteData.alergias,
        medicamentos_em_uso: pacienteData.medicamentos,
        suplementos: pacienteData.suplementos,
        refeicoes_diarias: pacienteData.refeicoes_por_dia,
        agua_litros: pacienteData.litros_agua,
        observacoes_clinicas: pacienteData.observacoes,
      };

      let parsed: PlanoAlimentarSemanal;

      // Tenta primeiro via endpoint de API (produção Vercel)
      try {
        const response = await fetch('/api/gerar-plano', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dadosPaciente: payloadPaciente }),
        });

        if (response.ok) {
          const data = await response.json();
          parsed = typeof data === 'string' ? JSON.parse(data) : data;
        } else if (response.status === 404) {
          // Em ambiente local do Vite (onde a Vercel serverless function não está rodando diretamente),
          // executa a geração direta pelo Gemini SDK com a chave local
          parsed = await gerarPlanoComGemini(payloadPaciente);
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Falha no serviço (${response.status})`);
        }
      } catch (endpointError: any) {
        // Se a chamada para /api falhar ou retornar erro, tenta fallback direto com Gemini SDK
        if (endpointError?.message?.includes('404') || endpointError?.message?.includes('Failed to fetch')) {
          parsed = await gerarPlanoComGemini(payloadPaciente);
        } else {
          throw endpointError;
        }
      }

      if (!parsed || !Array.isArray(parsed.plano_semanal) || parsed.plano_semanal.length === 0) {
        throw new Error('A resposta gerada não contém a estrutura de plano semanal.');
      }

      setPlanoEmEdicao(parsed);
      setDiaAtivo(parsed.plano_semanal[0]?.dia || 'Segunda-feira');
      setSelectedHistoricoPlano(null);
      showToast('Plano alimentar gerado com sucesso pela IA! Você pode editar as opções abaixo.', 'success');
    } catch (err: any) {
      console.error('Erro na chamada da API do Gemini:', err);
      const msg = err?.message && !err.message.includes('Failed to fetch')
        ? err.message
        : 'Não foi possível gerar o plano com IA no momento. Deseja tentar novamente ou criar um Plano Manual?';
      showToast(msg, 'warning');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsGenerating(false);
    }
  };

  // Criação de plano manual caso a IA falhe ou nutricionista prefira
  const handleCriarPlanoManual = () => {
    const novoPlano = criarPlanoManualVazio();
    setPlanoEmEdicao(novoPlano);
    setDiaAtivo('Segunda-feira');
    setSelectedHistoricoPlano(null);
    showToast('Estrutura de plano semanal criada! Ajuste as opções conforme a necessidade do paciente.', 'success');
  };

  // Alteração de um item específico do plano em edição
  const handleItemChange = (
    diaNome: string,
    refeicaoKey: 'cafe_da_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
    index: number,
    novoTexto: string
  ) => {
    if (!planoEmEdicao) return;

    setPlanoEmEdicao((prev) => {
      if (!prev) return prev;
      const updatedDias = prev.plano_semanal.map((diaObj) => {
        if (diaObj.dia !== diaNome) return diaObj;

        const currentOptions = [...(diaObj.refeicoes[refeicaoKey] || [])];
        currentOptions[index] = novoTexto;

        return {
          ...diaObj,
          refeicoes: {
            ...diaObj.refeicoes,
            [refeicaoKey]: currentOptions,
          },
        };
      });

      return {
        ...prev,
        plano_semanal: updatedDias,
      };
    });
  };

  // Persistência no Neon (tabela planos_alimentares)
  const handleSalvarPlano = async () => {
    if (!planoEmEdicao || isSaving) return;

    setIsSaving(true);
    setToastMessage(null);

    try {
      const saved = await createPlanoAlimentar(pacienteId, planoEmEdicao);
      onPlanoSaved(saved);
      showToast('Plano alimentar salvo com sucesso no prontuário do paciente!', 'success');
      // Limpa a tela de edição e seleciona o recém-salvo no histórico
      setPlanoEmEdicao(null);
      setSelectedHistoricoPlano(saved);
    } catch (err: any) {
      console.error('Erro ao salvar plano no banco:', err);
      showToast(err.message || 'Erro ao persistir o plano alimentar no banco de dados.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Dia atualmente selecionado na aba de edição
  const diaSelecionadoObj = planoEmEdicao?.plano_semanal.find((d) => d.dia === diaAtivo);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>

          {toastMessage.type === 'warning' && !planoEmEdicao && (
            <button
              type="button"
              onClick={handleCriarPlanoManual}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
            >
              Criar Plano Manual
            </button>
          )}
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Prescrição e Planos Alimentares</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Gere cardápios semanais balanceados com inteligência artificial adaptados aos objetivos, alergias e hábitos do paciente, com 5 opções por refeição.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Botão de Plano Manual se desejar */}
            {!planoEmEdicao && (
              <button
                type="button"
                onClick={handleCriarPlanoManual}
                disabled={isGenerating}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                + Plano Manual
              </button>
            )}

            {/* Botão Principal: Gerar Plano com IA */}
            <button
              type="button"
              onClick={handleGerarComIA}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  <span>Gerar Plano com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress State */}
        {isGenerating && (
          <div className="mt-5 p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                Processamento Inteligente Gemini
              </span>
              <span className="text-xs font-semibold text-emerald-700">Cardápio Semanal</span>
            </div>
            <p className="text-sm font-medium text-emerald-800">{loadingStepText}</p>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-2/3 animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* INTERFACE DE EDIÇÃO EM ABAS (SE HOUVER PLANO GERADO) */}
      {/* ========================================================= */}
      {planoEmEdicao && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  Modo de Edição Ativo
                </span>
                <h4 className="text-base font-bold text-slate-900">Cardápio Semanal em Ajuste</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere qualquer uma das opções diretamente nos campos antes de salvar no prontuário.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlanoEmEdicao(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Descartar
              </button>

              <button
                type="button"
                onClick={handleSalvarPlano}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando no Banco...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Plano Alimentar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Abas dos Dias da Semana */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {planoEmEdicao.plano_semanal.map((diaObj) => {
              const isActive = diaObj.dia === diaAtivo;
              return (
                <button
                  key={diaObj.dia}
                  type="button"
                  onClick={() => setDiaAtivo(diaObj.dia)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {diaObj.dia}
                </button>
              );
            })}
          </div>

          {/* Conteúdo do Dia Ativo: 5 Refeições com 5 inputs cada */}
          {diaSelecionadoObj ? (
            <div className="space-y-6">
              {REFEICOES_CONFIG.map(({ key, label, icon: Icon, color }) => {
                const opcoes = diaSelecionadoObj.refeicoes[key] || [];

                return (
                  <div
                    key={key}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-xl ${color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <h5 className="font-bold text-sm text-slate-900">{label}</h5>
                      <span className="text-[11px] text-slate-400 font-medium">
                        ({opcoes.length} opções cadastradas)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {opcoes.map((opcaoTexto, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={opcaoTexto}
                            onChange={(e) =>
                              handleItemChange(
                                diaSelecionadoObj.dia,
                                key as any,
                                idx,
                                e.target.value
                              )
                            }
                            className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-2xs"
                            placeholder={`Opção ${idx + 1} de ${label.toLowerCase()}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Botão de Salvar no Rodapé da Edição */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Total de 25 opções customizáveis para {diaSelecionadoObj.dia}.
                </span>
                <button
                  type="button"
                  onClick={handleSalvarPlano}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Plano Alimentar
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================= */}
      {/* HISTÓRICO DE PLANOS ALIMENTARES PERSISTIDOS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-base text-slate-900">
              Histórico de Planos Salvos ({planos.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">Do mais recente para o mais antigo</span>
        </div>

        {planos.length === 0 ? (
          <div className="p-14 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Nenhum plano alimentar gerado ainda</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clique em "✨ Gerar Plano com IA" para criar o primeiro cardápio semanal completo para este paciente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lista dos Planos Salvos */}
            <div className="space-y-2.5 md:col-span-1 border-r border-slate-100 pr-4">
              {planos.map((plano) => {
                const isSelected = selectedHistoricoPlano?.id === plano.id;
                return (
                  <div
                    key={plano.id}
                    onClick={() => {
                      setSelectedHistoricoPlano(plano);
                      setPlanoEmEdicao(null);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        Plano gerado em {formatDate(plano.created_at)}
                      </span>
                      <FileText className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      7 dias de cardápio completo
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Visualização Completa do Plano Selecionado */}
            <div className="md:col-span-2">
              {selectedHistoricoPlano ? (
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">
                        Cardápio de {formatDate(selectedHistoricoPlano.created_at)}
                      </h5>
                      <span className="text-[11px] text-slate-500">Visualização do plano salvo</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Carrega o plano salvo no editor para novas alterações
                        try {
                          const conteudoObj = typeof selectedHistoricoPlano.conteudo === 'string'
                            ? JSON.parse(selectedHistoricoPlano.conteudo)
                            : selectedHistoricoPlano.conteudo;
                          if (conteudoObj && conteudoObj.plano_semanal) {
                            setPlanoEmEdicao(conteudoObj);
                            setDiaAtivo(conteudoObj.plano_semanal[0]?.dia || 'Segunda-feira');
                            showToast('Plano carregado no editor para ajustes!', 'success');
                          }
                        } catch (e) {
                          console.error('Erro ao ler plano para edição:', e);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      Editar como Novo Plano
                    </button>
                  </div>

                  {/* Renderização Estruturada dos Dias */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                    {(() => {
                      let conteudoFormatado: PlanoAlimentarSemanal | null = null;
                      try {
                        conteudoFormatado = typeof selectedHistoricoPlano.conteudo === 'string'
                          ? JSON.parse(selectedHistoricoPlano.conteudo)
                          : selectedHistoricoPlano.conteudo;
                      } catch {
                        conteudoFormatado = null;
                      }

                      if (!conteudoFormatado || !conteudoFormatado.plano_semanal) {
                        return (
                          <pre className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(selectedHistoricoPlano.conteudo, null, 2)}
                          </pre>
                        );
                      }

                      return conteudoFormatado.plano_semanal.map((diaObj) => (
                        <div
                          key={diaObj.dia}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="font-extrabold text-xs text-slate-900">{diaObj.dia}</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-xs">
                            {REFEICOES_CONFIG.map(({ key, label }) => {
                              const opts = diaObj.refeicoes?.[key] || [];
                              if (opts.length === 0) return null;
                              return (
                                <div key={key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="font-bold text-slate-800 text-[11px] block mb-1">
                                    {label}:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                                    {opts.map((op, i) => (
                                      <li key={i}>{op}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-200/80 p-6 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Nenhum plano selecionado</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Selecione um dos planos do histórico à esquerda para visualizar seu cardápio semanal completo.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
