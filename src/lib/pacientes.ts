import { sql } from './neon';
import { getNutricionistaId } from './dashboard';

export interface PacienteListItem {
  id: string;
  nutricionista_id: string;
  nome: string;
  email?: string;
  whatsapp?: string;
  objetivos?: string[];
  objetivo_texto?: string;
  ultimaConsulta?: string | null;
  created_at: string;
}

export interface PacienteFormData {
  // Aba 1 - Pessoal
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;

  // Aba 2 - Clínico
  peso_inicial?: number | null;
  altura?: number | null;
  objetivos?: string[];
  objetivo_texto?: string;
  nivel_atividade?: string;
  patologias?: string[];
  restricoes_alimentares?: string[];
  alergias?: string[];
  medicamentos?: string;
  suplementos?: string;

  // Aba 3 - Hábitos
  refeicoes_por_dia?: number | null;
  horario_acorda?: string;
  horario_dorme?: string;
  litros_agua?: number | null;
  atividade_fisica?: boolean;
  atividade_fisica_descricao?: string;
  observacoes?: string;
}

/**
 * Lista todos os pacientes da nutricionista logada com o objetivo e a data da última consulta
 */
export async function fetchPacientes(nutricionistaEmail: string, search = ''): Promise<PacienteListItem[]> {
  if (!sql) return [];

  try {
    const nutriId = await getNutricionistaId(nutricionistaEmail);
    if (!nutriId) return [];

    const searchQuery = search.trim().toLowerCase();

    // Busca pacientes com última consulta sem interpolação dinâmica vazia no tagged template
    const rows = searchQuery
      ? await sql`
          SELECT 
            p.id,
            p.nutricionista_id,
            p.nome,
            p.email,
            p.whatsapp,
            p.objetivos,
            p.objetivo_texto,
            p.created_at,
            (
              SELECT MAX(c.data_consulta) 
              FROM consultas c 
              WHERE c.paciente_id = p.id
            ) as "ultimaConsulta"
          FROM pacientes p
          WHERE p.nutricionista_id = ${nutriId}
            AND LOWER(p.nome) LIKE ${'%' + searchQuery + '%'}
          ORDER BY p.created_at DESC
        `
      : await sql`
          SELECT 
            p.id,
            p.nutricionista_id,
            p.nome,
            p.email,
            p.whatsapp,
            p.objetivos,
            p.objetivo_texto,
            p.created_at,
            (
              SELECT MAX(c.data_consulta) 
              FROM consultas c 
              WHERE c.paciente_id = p.id
            ) as "ultimaConsulta"
          FROM pacientes p
          WHERE p.nutricionista_id = ${nutriId}
          ORDER BY p.created_at DESC
        `;

    return rows.map((r: any) => ({
      id: r.id,
      nutricionista_id: r.nutricionista_id,
      nome: r.nome,
      email: r.email || undefined,
      whatsapp: r.whatsapp || undefined,
      objetivos: r.objetivos || [],
      objetivo_texto: r.objetivo_texto || undefined,
      ultimaConsulta: r.ultimaConsulta 
        ? (typeof r.ultimaConsulta === 'string' ? r.ultimaConsulta : new Date(r.ultimaConsulta).toISOString().split('T')[0]) 
        : null,
      created_at: typeof r.created_at === 'string' ? r.created_at : new Date(r.created_at).toISOString(),
    }));
  } catch (err) {
    console.error('Erro ao listar pacientes:', err);
    return [];
  }
}

/**
 * Busca detalhes completos de um paciente pelo ID
 */
export async function fetchPacienteById(pacienteId: string, nutricionistaEmail: string): Promise<any | null> {
  if (!sql) return null;

  try {
    const nutriId = await getNutricionistaId(nutricionistaEmail);
    if (!nutriId) return null;

    const rows = await sql`
      SELECT 
        p.*,
        (
          SELECT MAX(c.data_consulta) 
          FROM consultas c 
          WHERE c.paciente_id = p.id
        ) as "ultimaConsulta"
      FROM pacientes p
      WHERE p.id = ${pacienteId} AND p.nutricionista_id = ${nutriId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) return null;
    return rows[0];
  } catch (err) {
    console.error('Erro ao buscar paciente:', err);
    return null;
  }
}

/**
 * Cria um novo paciente vinculado à nutricionista logada
 */
export async function createPaciente(nutricionistaEmail: string, data: PacienteFormData): Promise<string> {
  if (!sql) {
    throw new Error('Banco de dados não configurado.');
  }

  const nutriId = await getNutricionistaId(nutricionistaEmail);
  if (!nutriId) {
    throw new Error('Nutricionista não encontrado para vincular o paciente.');
  }

  if (!data.nome || !data.nome.trim()) {
    throw new Error('O nome completo do paciente é obrigatório.');
  }

  const result = await sql`
    INSERT INTO pacientes (
      nutricionista_id,
      nome,
      data_nascimento,
      sexo,
      whatsapp,
      email,
      peso_inicial,
      altura,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    ) VALUES (
      ${nutriId},
      ${data.nome.trim()},
      ${data.data_nascimento || null},
      ${data.sexo || null},
      ${data.whatsapp || data.telefone || null},
      ${data.email || null},
      ${data.peso_inicial ?? null},
      ${data.altura ?? null},
      ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null},
      ${data.objetivo_texto || null},
      ${data.nivel_atividade || null},
      ${data.patologias && data.patologias.length > 0 ? data.patologias : null},
      ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null},
      ${data.alergias && data.alergias.length > 0 ? data.alergias : null},
      ${data.medicamentos || null},
      ${data.suplementos || null},
      ${data.refeicoes_por_dia ?? null},
      ${data.horario_acorda || null},
      ${data.horario_dorme || null},
      ${data.litros_agua ?? null},
      ${data.atividade_fisica ?? false},
      ${data.atividade_fisica_descricao || null},
      ${data.observacoes || null}
    )
    RETURNING id
  `;

  if (!result || result.length === 0) {
    throw new Error('Falha ao inserir o paciente no banco de dados.');
  }

  return result[0].id as string;
}

/**
 * Utilitários de formatação e cálculo
 */
export function formatDate(dateVal?: string | Date | null): string {
  if (!dateVal) return '—';
  try {
    if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return '—';
      return dateVal.toLocaleDateString('pt-BR');
    }
    const str = String(dateVal).trim();
    if (!str) return '—';
    if (str.includes('T')) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
    }
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toLocaleDateString('pt-BR');
  } catch {
    return String(dateVal);
  }
}

export function calculateAge(birthDateVal?: string | Date | null): number | null {
  if (!birthDateVal) return null;
  const birthDate = birthDateVal instanceof Date ? birthDateVal : new Date(birthDateVal);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function calculateIMC(peso?: number | string | null, alturaCm?: number | string | null): { value: number; label: string; color: string } | null {
  if (peso === undefined || peso === null || alturaCm === undefined || alturaCm === null) return null;
  const p = typeof peso === 'string' ? parseFloat(peso) : peso;
  const a = typeof alturaCm === 'string' ? parseFloat(alturaCm) : alturaCm;

  if (isNaN(p) || isNaN(a) || p <= 0 || a <= 0) return null;

  const alturaMetros = a / 100;
  if (alturaMetros <= 0) return null;

  const imc = p / (alturaMetros * alturaMetros);
  if (!isFinite(imc) || isNaN(imc)) return null;

  const rounded = Number(imc.toFixed(1));

  if (rounded < 18.5) {
    return { value: rounded, label: 'Abaixo do peso', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  } else if (rounded < 24.9) {
    return { value: rounded, label: 'Peso ideal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  } else if (rounded < 29.9) {
    return { value: rounded, label: 'Sobrepeso', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  } else if (rounded < 34.9) {
    return { value: rounded, label: 'Obesidade Grau I', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  } else {
    return { value: rounded, label: 'Obesidade Grau II/III', color: 'text-red-800 bg-red-50 border-red-200' };
  }
}

/**
 * Converte entradas livres de horas (ex: "6" -> "06:00", "630" -> "06:30", "23" -> "23:00")
 */
export function formatTimeInput(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 1) {
    return `0${digits}:00`;
  }
  if (digits.length === 2) {
    const num = parseInt(digits, 10);
    if (num <= 23) {
      return `${digits}:00`;
    }
    return `0${digits[0]}:${digits[1]}0`;
  }
  if (digits.length === 3) {
    return `0${digits[0]}:${digits.slice(1, 3)}`;
  }
  if (digits.length >= 4) {
    let hours = parseInt(digits.slice(0, 2), 10);
    let mins = parseInt(digits.slice(2, 4), 10);
    if (hours > 23) hours = 23;
    if (mins > 59) mins = 59;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
  return val;
}

/**
 * Formata números de telefone/whatsapp brasileiro
 */
export function formatPhoneNumber(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
