import { syncNutricionista } from './neon';

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-quiet-rice-b6upjywk.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';
const SESSION_KEY = 'nutriadriano_auth_session';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: string;
  nutricionistaId?: string;
}

export interface AuthSession {
  user: AuthUser;
  token?: string;
  expiresAt?: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AUTH_URL.replace(/\/+$/, '');
  }

  /**
   * Salva a sessão localmente para persistência
   */
  public saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Falha ao salvar sessão localmente:', e);
    }
  }

  /**
   * Obtém a sessão salva no armazenamento local
   */
  public getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as AuthSession;
    } catch (e) {
      console.error('Falha ao ler sessão local:', e);
      return null;
    }
  }

  /**
   * Remove a sessão local
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Falha ao limpar sessão local:', e);
    }
  }

  /**
   * Realiza o cadastro via Neon Auth e sincroniza com a tabela nutricionistas
   */
  async signUp(data: SignUpData): Promise<{ user: AuthUser; session: AuthSession }> {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedName = data.name.trim();

    if (data.password.length < 9) {
      throw new Error('A senha deve ter no mínimo 9 caracteres.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: trimmedEmail,
          password: data.password,
          name: trimmedName,
        }),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = resData?.message || resData?.error?.message || resData?.error;
        if (response.status === 422 || (errorMsg && errorMsg.includes('already exists'))) {
          throw new Error('Este email já está cadastrado no sistema.');
        }
        throw new Error(errorMsg || 'Não foi possível realizar o cadastro. Verifique os dados informados.');
      }

      // Extrai os dados retornados pelo Neon Auth
      const user = resData?.user || {
        id: resData?.id || `user_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
      };

      const token = resData?.token || resData?.session?.token;

      // Sincroniza na tabela nutricionistas no Neon
      const dbNutri = await syncNutricionista({
        id: user.id,
        nome: trimmedName,
        email: trimmedEmail,
      });

      const authUser: AuthUser = {
        id: user.id,
        name: trimmedName,
        email: trimmedEmail,
        nutricionistaId: dbNutri?.id,
      };

      const session: AuthSession = {
        user: authUser,
        token: token,
      };

      this.saveSession(session);
      return { user: authUser, session };
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      throw new Error(err.message || 'Erro inesperado ao conectar com o serviço de autenticação.');
    }
  }

  /**
   * Realiza o login via Neon Auth
   */
  async signIn(data: SignInData): Promise<{ user: AuthUser; session: AuthSession }> {
    const trimmedEmail = data.email.trim().toLowerCase();

    try {
      const response = await fetch(`${this.baseUrl}/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: trimmedEmail,
          password: data.password,
        }),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = resData?.message || resData?.error?.message || resData?.error;
        if (response.status === 401 || response.status === 400 || (errorMsg && errorMsg.toLowerCase().includes('invalid'))) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
        }
        throw new Error(errorMsg || 'Falha ao autenticar. Tente novamente.');
      }

      const user = resData?.user || {
        id: resData?.id,
        name: resData?.name || trimmedEmail.split('@')[0],
        email: trimmedEmail,
      };

      const token = resData?.token || resData?.session?.token;

      // Garante sincronização com a tabela nutricionistas
      const dbNutri = await syncNutricionista({
        id: user.id,
        nome: user.name || trimmedEmail.split('@')[0],
        email: trimmedEmail,
      });

      const authUser: AuthUser = {
        id: user.id,
        name: user.name || dbNutri?.nome || 'Nutricionista',
        email: trimmedEmail,
        nutricionistaId: dbNutri?.id,
      };

      const session: AuthSession = {
        user: authUser,
        token: token,
      };

      this.saveSession(session);
      return { user: authUser, session };
    } catch (err: any) {
      console.error('Erro no login:', err);
      throw new Error(err.message || 'Erro de conexão ao tentar fazer login.');
    }
  }

  /**
   * Verifica e restaura a sessão ativa
   */
  async checkSession(): Promise<AuthSession | null> {
    const stored = this.getStoredSession();
    if (!stored) return null;

    try {
      const headers: Record<string, string> = {};
      if (stored.token) {
        headers['Authorization'] = `Bearer ${stored.token}`;
      }

      const response = await fetch(`${this.baseUrl}/get-session`, {
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.user) {
          const updatedSession: AuthSession = {
            ...stored,
            user: {
              ...stored.user,
              id: data.user.id,
              name: data.user.name || stored.user.name,
              email: data.user.email || stored.user.email,
            },
          };
          this.saveSession(updatedSession);
          return updatedSession;
        }
      }
      
      // Se a validação no servidor falhar mas temos a sessão local e token válido, mantemos
      return stored;
    } catch (e) {
      // Se falhar rede, mantém sessão local salva
      return stored;
    }
  }

  /**
   * Realiza logout
   */
  async signOut(): Promise<void> {
    const stored = this.getStoredSession();
    try {
      const headers: Record<string, string> = {};
      if (stored?.token) {
        headers['Authorization'] = `Bearer ${stored.token}`;
      }
      await fetch(`${this.baseUrl}/sign-out`, {
        method: 'POST',
        headers,
        credentials: 'include',
      }).catch(() => {});
    } finally {
      this.clearSession();
    }
  }
}

export const authService = new AuthService();
