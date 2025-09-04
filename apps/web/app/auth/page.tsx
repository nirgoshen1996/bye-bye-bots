'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { AuthForm } from '@/components/auth/auth-form';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <Container>
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to BotCleaner</h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard and processing history
            </p>
          </div>
          <AuthForm mode={mode} onModeChange={setMode} />
        </div>
      </Container>
    </div>
  );
}

