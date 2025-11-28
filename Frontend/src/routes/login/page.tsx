import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/entities/auth';
import { Logo, Button, Input } from '@/shared/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <Logo size="lg" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Anmelden
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inkasso & Mahnwesen Management
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </Button>
        </form>
      </div>
    </div>
  );
}
