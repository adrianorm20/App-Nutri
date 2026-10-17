import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Crie sua conta profissional"
      subtitle="Cadastre-se para ter acesso completo ao sistema NutriAdriano"
    >
      <RegisterForm />
    </AuthLayout>
  );
};
