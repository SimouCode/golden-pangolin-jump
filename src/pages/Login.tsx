"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (session && !isLoading) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">{t('loading')}...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">{t('welcome')}</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Only email/password by default
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light" // Use light theme for auth UI
          redirectTo={window.location.origin + '/'}
        />
      </div>
    </div>
  );
};

export default Login;