import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';

export default function Login() {
  const { signIn, signUp, error } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice('');
    const ok = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    if (ok && mode === 'signup') {
      setNotice('Account created. Check your email to confirm, then sign in.');
      setMode('signin');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="font-display text-2xl font-semibold text-forest-700">ZCSIF</p>
          <p className="text-sm text-ink/60 mt-1">Engagement Tracker</p>
        </div>
        <Card className="p-6">
          <h1 className="font-display text-lg font-semibold mb-4">
            {mode === 'signin' ? 'Sign in' : 'Create an account'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@zcsif.org"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-rust-600">{error}</p>}
            {notice && <p className="text-sm text-forest-700">{notice}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </form>
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="mt-4 text-sm text-forest-700 hover:underline w-full text-center"
          >
            {mode === 'signin' ? "Need an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </Card>
      </div>
    </div>
  );
}
