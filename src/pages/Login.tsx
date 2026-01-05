"use client";

import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const { t } = useTranslation();
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    if (session && !isLoading) {
      navigate('/');
    }
    
    // Check if Supabase client is properly initialized
    try {
      if (!supabase) {
        setSupabaseError('Supabase client failed to initialize. Please check your environment configuration.');
      }
    } catch (error) {
      setSupabaseError('Error initializing Supabase client: ' + (error as Error).message);
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">{t('loading')}...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">{t('welcome')}</h2>
        
        {supabaseError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>
              {supabaseError}
            </AlertDescription>
          </Alert>
        )}
        
        {!supabaseError ? (
          <Auth
            supabaseClient={supabase}
            providers={[]}
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
            theme="light"
            redirectTo={window.location.origin + '/'}
          />
        ) : (
          <div className="text-center text-red-500">
            <p>{t('supabase_config_error')}</p>
            <p className="text-sm mt-2">{t('check_env_file')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;