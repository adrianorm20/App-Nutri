import { sql } from './neon';

export interface DashboardMetrics {
  totalPacientes: number;
  consultasSemana: number;
  pacientesSemRetorno: PacienteSemRetorno[];
}

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  email?: string;
  whatsapp?: string;
  ultimaConsulta: string;
  diasSemConsulta: number;
}

/**
 * Busca o ID do nutricionista a partir do email/id
 */
export async function getNutricionistaId(email: string): Promise<string | null> {
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT id FROM nutricionistas WHERE email = ${email} LIMIT 1
    `;
    return rows.length > 0 ? (rows[0].id as string) : null;
  } catch (err) {
    console.error('Erro ao buscar ID do nutricionista:', err);
    return null;
  }
}

/**
 * Carrega as métricas do Dashboard em tempo real do banco de dados Neon/Postgres
 */
export async function fetchDashboardData(nutricionistaEmail: string): Promise<DashboardMetrics> {
  const emptyMetrics: DashboardMetrics = {
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  };

  if (!sql) {
    console.warn('Banco de dados não configurado.');
    return emptyMetrics;
  }

  try {
    // 1. Obter o nutricionista_id
    const nutriId = await getNutricionistaId(nutricionistaEmail);
    if (!nutriId) {
      return emptyMetrics;
    }

    // 2. Card 1 — Total de pacientes ativos (cadastrados pela nutricionista logada)
    const countPacientesRes = await sql`
      SELECT count(*)::int as total
      FROM pacientes
      WHERE nutricionista_id = ${nutriId}
    `;
    const totalPacientes = Number(countPacientesRes[0]?.total || 0);

    // 3. Card 2 — Consultas da semana atual
    // Semana atual definida por date_trunc('week', current_date) até o final da semana
    const countConsultasSemanaRes = await sql`
      SELECT count(*)::int as total
      FROM consultas c
      JOIN pacientes p ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutriId}
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
        AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + interval '6 days 23 hours 59 minutes')
    `;
    const consultasSemana = Number(countConsultasSemanaRes[0]?.total || 0);

    // 4. Card 3 — Pacientes sem retorno
    // Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado (ou proximo_retorno é nulo / no passado)
    const pacientesSemRetornoRes = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          c.paciente_id,
          MAX(c.data_consulta) as ultima_data,
          MAX(c.proximo_retorno) as ultimo_retorno_agendado
        FROM consultas c
        JOIN pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutriId}
        GROUP BY c.paciente_id
      )
      SELECT 
        p.id,
        p.nome,
        p.email,
        p.whatsapp,
        uc.ultima_data as "ultimaConsulta",
        (CURRENT_DATE - uc.ultima_data)::int as "diasSemConsulta"
      FROM ultimas_consultas uc
      JOIN pacientes p ON uc.paciente_id = p.id
      WHERE uc.ultima_data < (CURRENT_DATE - interval '30 days')
        AND (uc.ultimo_retorno_agendado IS NULL OR uc.ultimo_retorno_agendado < CURRENT_DATE)
      ORDER BY uc.ultima_data ASC
    `;

    const pacientesSemRetorno: PacienteSemRetorno[] = pacientesSemRetornoRes.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      email: row.email || undefined,
      whatsapp: row.whatsapp || undefined,
      ultimaConsulta: typeof row.ultimaConsulta === 'string' 
        ? row.ultimaConsulta 
        : new Date(row.ultimaConsulta).toISOString().split('T')[0],
      diasSemConsulta: Number(row.diasSemConsulta || 0),
    }));

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return emptyMetrics;
  }
}
