import React, { useState } from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { type ConsultaFormData } from '../../lib/consultas';

interface NovaConsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ConsultaFormData) => Promise<void>;
  lastWeight?: number | null;
}

export const NovaConsultaModal: React.FC<NovaConsultaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lastWeight,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<ConsultaFormData>({
    data_consulta: todayStr,
    peso: lastWeight || null,
    cintura: null,
    quadril: null,
    percentual_gordura: null,
    observacoes: '',
    proximo_retorno: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.data_consulta) {
      setErrorMessage('A data da consulta é obrigatória.');
      return;
    }

    if (formData.peso === null || isNaN(Number(formData.peso)) || Number(formData.peso) <= 0) {
      setErrorMessage('Informe um peso válido para a consulta.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        peso: Number(formData.peso),
        cintura: formData.cintura ? Number(formData.cintura) : null,
        quadril: formData.quadril ? Number(formData.quadril) : null,
        percentual_gordura: formData.percentual_gordura ? Number(formData.percentual_gordura) : null,
        observacoes: formData.observacoes?.trim() || undefined,
        proximo_retorno: formData.proximo_retorno || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar consulta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registrar Nova Consulta</h3>
            <p className="text-xs text-slate-500 mt-0.5">Preencha as métricas corporais e anotações do retorno</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Data da consulta & Peso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Data da Consulta *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.data_consulta}
                  onChange={(e) => setFormData({ ...formData, data_consulta: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Peso Atual (kg) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ex: 72.5"
                  value={formData.peso ?? ''}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">kg</span>
              </div>
            </div>
          </div>

          {/* Cintura & Quadril */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Cintura (cm) <span className="text-slate-400 font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 80"
                  value={formData.cintura ?? ''}
                  onChange={(e) => setFormData({ ...formData, cintura: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Quadril (cm) <span className="text-slate-400 font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 102"
                  value={formData.quadril ?? ''}
                  onChange={(e) => setFormData({ ...formData, quadril: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">cm</span>
              </div>
            </div>
          </div>

          {/* % Gordura & Próximo Retorno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                % Gordura <span className="text-slate-400 font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 18.5"
                  value={formData.percentual_gordura ?? ''}
                  onChange={(e) => setFormData({ ...formData, percentual_gordura: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Próximo Retorno
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.proximo_retorno ?? ''}
                  onChange={(e) => setFormData({ ...formData, proximo_retorno: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Observações e Evolução
            </label>
            <textarea
              rows={3}
              placeholder="Descreva a adesão à dieta, queixas, conquistas ou orientações passadas ao paciente..."
              value={formData.observacoes ?? ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Salvar consulta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
