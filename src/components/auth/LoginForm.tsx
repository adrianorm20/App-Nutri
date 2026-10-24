import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: contextError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as any)?.message || null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearError();

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu email.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentError = errorMessage || contextError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && !currentError && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {currentError && (
        <Alert
          type="error"
          message={currentError}
          onClose={() => {
            setErrorMessage(null);
            clearError();
          }}
        />
      )}

      <Input
        label="Email profissional"
        type="email"
        placeholder="seu.email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4" />}
        autoComplete="email"
        required
      />

      <div className="space-y-1">
        <Input
          label="Senha de acesso"
          isPassword
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2 group"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
      >
        Entrar
      </Button>

      <div className="text-center pt-3 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Não tem conta?{' '}
          <Link
            to="/cadastro"
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </form>
  );
};
