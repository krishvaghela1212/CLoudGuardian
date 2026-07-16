import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { fullName, email, password });
      login(res.data.data.token, res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      {/* Left Panel – Decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 60%, #047857 100%)' }}>
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">CloudGuardian AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start optimizing<br />your cloud today.
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Join thousands of engineers and FinOps teams who trust CloudGuardian AI to reduce AWS costs and improve cloud security.
          </p>

          <div className="mt-10 space-y-4">
            {['Real-time Cloud Scanning', 'AI-Generated Remediation', 'MongoDB-backed History'].map((f) => (
              <div key={f} className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-white font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-emerald-200 text-sm">&copy; {new Date().getFullYear()} CloudGuardian AI</p>
      </div>

      {/* Right Panel – Form */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center space-x-2 mb-10">
            <div className="p-2 rounded-xl" style={{ background: 'var(--color-primary)' }}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>CloudGuardian AI</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--color-text)' }}>
            Create your account
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
              Sign in instead
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-muted)', color: 'var(--color-text)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-muted)'}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-muted)', color: 'var(--color-text)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-muted)'}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-muted)', color: 'var(--color-text)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-muted)'}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
              style={{ background: loading ? 'var(--color-muted)' : 'var(--color-primary)' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
