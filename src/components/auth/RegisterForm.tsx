import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, error: contextError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validação em tempo real dos requisitos de senha (mínimo 9 caracteres)
  const isMinLength = password.length >= 9;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearError();

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de email válido.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentError = errorMessage || contextError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        label="Nome completo"
        type="text"
        placeholder="Dra. Mariana Silva"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<User className="w-4 h-4" />}
        autoComplete="name"
        required
      />

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
          label="Senha"
          isPassword
          placeholder="Mínimo 9 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />
        
        {/* Indicador visual de tamanho mínimo de 9 caracteres */}
        {password.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 text-xs transition-colors">
            <div className={`p-0.5 rounded-full ${isMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
              <Check className="w-3 h-3" />
            </div>
            <span className={isMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
              Mínimo de 9 caracteres ({password.length}/9)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Input
          label="Confirmar senha"
          isPassword
          placeholder="Repita a senha digitada"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />
        {confirmPassword.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            <div className={`p-0.5 rounded-full ${passwordsMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              <Check className="w-3 h-3" />
            </div>
            <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>
              {passwordsMatch ? 'As senhas coincidem' : 'As senhas não coincidem'}
            </span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-3 group"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
      >
        Criar conta
      </Button>

      <div className="text-center pt-3 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Já tem conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            Faça login
          </Link>
        </p>
      </div>
    </form>
  );
};
