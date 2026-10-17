import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL || '';

export const sql = databaseUrl ? neon(databaseUrl) : null;

export interface Nutricionista {
  id: string;
  nome: string;
  email: string;
  created_at?: string;
}

/**
 * Salva ou atualiza o nutricionista na tabela `nutricionistas` do Neon
 */
export async function syncNutricionista(user: { id?: string; nome: string; email: string }): Promise<Nutricionista | null> {
  if (!sql) {
    console.warn('VITE_DATABASE_URL não configurada no ambiente.');
    return null;
  }

  try {
    // Se o id do auth for passado e for uuid válido, podemos usar ou deixar gerar uuid
    // Vamos verificar se já existe por email
    const existing = await sql`
      SELECT id, nome, email, created_at FROM nutricionistas WHERE email = ${user.email} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return existing[0] as Nutricionista;
    }

    // Inserir novo nutricionista
    const result = await sql`
      INSERT INTO nutricionistas (nome, email)
      VALUES (${user.nome}, ${user.email})
      ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
      RETURNING id, nome, email, created_at
    `;

    return (result && result.length > 0) ? (result[0] as Nutricionista) : null;
  } catch (error) {
    console.error('Erro ao sincronizar nutricionista no banco:', error);
    // Não interrompe o fluxo de autenticação se falhar a sincronização
    return null;
  }
}
