import { sql } from './neon';
import { getNutricionistaId } from './dashboard';

export interface Consulta {
  id: string;
  paciente_id: string;
  data_consulta: string;
  peso: number | null;
  cintura: number | null;
  quadril: number | null;
  percentual_gordura: number | null;
  observacoes: string | null;
  proximo_retorno: string | null;
  created_at: string;
}

export interface ConsultaFormData {
  data_consulta: string;
  peso: number | null;
  cintura?: number | null;
  quadril?: number | null;
  percentual_gordura?: number | null;
  observacoes?: string;
  proximo_retorno?: string | null;
}

export interface PlanoAlimentarItem {
  id: string;
  paciente_id: string;
  conteudo: any;
  created_at: string;
}

/**
 * Atualiza os dados cadastrais de um paciente
 */
export async function updatePaciente(
  pacienteId: string,
  nutricionistaEmail: string,
  data: Partial<any>
): Promise<boolean> {
  if (!sql) {
    throw new Error('Banco de dados não configurado.');
  }

  const nutriId = await getNutricionistaId(nutricionistaEmail);
  if (!nutriId) {
    throw new Error('Nutricionista não encontrado.');
  }

  const result = await sql`
    UPDATE pacientes
    SET
      nome = COALESCE(${data.nome ? data.nome.trim() : null}, nome),
      data_nascimento = ${data.data_nascimento || null},
      sexo = ${data.sexo || null},
      whatsapp = ${data.whatsapp || data.telefone || null},
      email = ${data.email || null},
      peso_inicial = ${data.peso_inicial ?? null},
      altura = ${data.altura ?? null},
      objetivos = ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null},
      objetivo_texto = ${data.objetivo_texto || null},
      nivel_atividade = ${data.nivel_atividade || null},
      patologias = ${data.patologias && data.patologias.length > 0 ? data.patologias : null},
      restricoes_alimentares = ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null},
      alergias = ${data.alergias && data.alergias.length > 0 ? data.alergias : null},
      medicamentos = ${data.medicamentos || null},
      suplementos = ${data.suplementos || null},
      refeicoes_por_dia = ${data.refeicoes_por_dia ?? null},
      horario_acorda = ${data.horario_acorda || null},
      horario_dorme = ${data.horario_dorme || null},
      litros_agua = ${data.litros_agua ?? null},
      atividade_fisica = ${data.atividade_fisica ?? false},
      atividade_fisica_descricao = ${data.atividade_fisica_descricao || null},
      observacoes = ${data.observacoes || null}
    WHERE id = ${pacienteId} AND nutricionista_id = ${nutriId}
    RETURNING id
  `;

  return result && result.length > 0;
}

/**
 * Busca todas as consultas de um paciente em ordem cronológica decrescente
 */
export async function fetchConsultasByPaciente(pacienteId: string): Promise<Consulta[]> {
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT 
        id,
        paciente_id,
        data_consulta,
        peso,
        cintura,
        quadril,
        percentual_gordura,
        observacoes,
        proximo_retorno,
        created_at
      FROM consultas
      WHERE paciente_id = ${pacienteId}
      ORDER BY data_consulta DESC, created_at DESC
    `;

    return rows.map((r: any) => ({
      id: r.id,
      paciente_id: r.paciente_id,
      data_consulta: typeof r.data_consulta === 'string' ? r.data_consulta : new Date(r.data_consulta).toISOString().split('T')[0],
      peso: r.peso !== null && r.peso !== undefined ? parseFloat(r.peso) : null,
      cintura: r.cintura !== null && r.cintura !== undefined ? parseFloat(r.cintura) : null,
      quadril: r.quadril !== null && r.quadril !== undefined ? parseFloat(r.quadril) : null,
      percentual_gordura: r.percentual_gordura !== null && r.percentual_gordura !== undefined ? parseFloat(r.percentual_gordura) : null,
      observacoes: r.observacoes || null,
      proximo_retorno: r.proximo_retorno 
        ? (typeof r.proximo_retorno === 'string' ? r.proximo_retorno : new Date(r.proximo_retorno).toISOString().split('T')[0]) 
        : null,
      created_at: typeof r.created_at === 'string' ? r.created_at : new Date(r.created_at).toISOString(),
    }));
  } catch (err) {
    console.error('Erro ao buscar consultas do paciente:', err);
    return [];
  }
}

/**
 * Cadastra uma nova consulta
 */
export async function createConsulta(pacienteId: string, data: ConsultaFormData): Promise<Consulta> {
  if (!sql) {
    throw new Error('Banco de dados não configurado.');
  }

  if (!data.data_consulta) {
    throw new Error('A data da consulta é obrigatória.');
  }

  const result = await sql`
    INSERT INTO consultas (
      paciente_id,
      data_consulta,
      peso,
      cintura,
      quadril,
      percentual_gordura,
      observacoes,
      proximo_retorno
    ) VALUES (
      ${pacienteId},
      ${data.data_consulta},
      ${data.peso ?? null},
      ${data.cintura ?? null},
      ${data.quadril ?? null},
      ${data.percentual_gordura ?? null},
      ${data.observacoes || null},
      ${data.proximo_retorno || null}
    )
    RETURNING 
      id,
      paciente_id,
      data_consulta,
      peso,
      cintura,
      quadril,
      percentual_gordura,
      observacoes,
      proximo_retorno,
      created_at
  `;

  if (!result || result.length === 0) {
    throw new Error('Falha ao salvar a consulta.');
  }

  const r = result[0];
  return {
    id: r.id,
    paciente_id: r.paciente_id,
    data_consulta: typeof r.data_consulta === 'string' ? r.data_consulta : new Date(r.data_consulta).toISOString().split('T')[0],
    peso: r.peso !== null && r.peso !== undefined ? parseFloat(r.peso) : null,
    cintura: r.cintura !== null && r.cintura !== undefined ? parseFloat(r.cintura) : null,
    quadril: r.quadril !== null && r.quadril !== undefined ? parseFloat(r.quadril) : null,
    percentual_gordura: r.percentual_gordura !== null && r.percentual_gordura !== undefined ? parseFloat(r.percentual_gordura) : null,
    observacoes: r.observacoes || null,
    proximo_retorno: r.proximo_retorno 
      ? (typeof r.proximo_retorno === 'string' ? r.proximo_retorno : new Date(r.proximo_retorno).toISOString().split('T')[0]) 
      : null,
    created_at: typeof r.created_at === 'string' ? r.created_at : new Date(r.created_at).toISOString(),
  };
}

/**
 * Busca histórico de planos alimentares do paciente
 */
export async function fetchPlanosByPaciente(pacienteId: string): Promise<PlanoAlimentarItem[]> {
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT id, paciente_id, conteudo, created_at
      FROM planos_alimentares
      WHERE paciente_id = ${pacienteId}
      ORDER BY created_at DESC
    `;

    return rows.map((r: any) => ({
      id: r.id,
      paciente_id: r.paciente_id,
      conteudo: r.conteudo,
      created_at: typeof r.created_at === 'string' ? r.created_at : new Date(r.created_at).toISOString(),
    }));
  } catch (err) {
    console.error('Erro ao buscar planos alimentares:', err);
    return [];
  }
}
