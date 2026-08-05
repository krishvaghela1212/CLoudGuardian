import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      login(res.data.data.token, res.data.data);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-text overflow-hidden relative">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Panel – Brand/Decorative */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-muted/10 bg-surface/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-background" />
          </div>
          <span className="text-text font-bold text-2xl tracking-wide uppercase">
            CloudGuardian
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl xl:text-6xl font-serif text-text leading-tight mb-6">
            Secure your cloud.
            <br />
            <span className="text-primary italic">Maximize savings.</span>
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-12">
            The elegant AI-powered FinOps platform that scans your AWS infrastructure to identify cost optimization opportunities and generate human-friendly remediation guidance.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-surface border border-muted/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <span className="text-text font-medium text-lg">Deterministic IAM Security</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-surface border border-muted/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-text font-medium text-lg">Instant FinOps Rule Engine</span>
            </div>
          </div>
        </div>

        <p className="text-muted text-sm font-medium tracking-wide">
          &copy; {new Date().getFullYear()} CloudGuardian AI
        </p>
      </div>

      {/* Right Panel – Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 sm:px-12 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-12">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-background" />
            </div>
            <span className="text-text font-bold text-2xl tracking-wide uppercase">
              CloudGuardian
            </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-serif text-text mb-3">
              Welcome back
            </h2>
            <p className="text-muted text-base">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:text-secondary transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-3" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-text mb-2 tracking-wide uppercase"
              >
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-muted/20 rounded-xl text-base text-text placeholder:text-muted/50 transition-all outline-none focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary/50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text mb-2 tracking-wide uppercase"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-muted/20 rounded-xl text-base text-text placeholder:text-muted/50 transition-all outline-none focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-secondary text-background font-semibold text-sm tracking-[0.1em] uppercase rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 overflow-hidden mt-4"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? "Authenticating..." : "Sign in to CloudGuardian"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
