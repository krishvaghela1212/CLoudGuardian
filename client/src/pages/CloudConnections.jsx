import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Plus, Trash2, Zap, CheckCircle2, XCircle, Clock,
  ArrowLeft, Loader2, ChevronRight, Globe, Server, RefreshCw,
} from 'lucide-react';
import {
  listConnections,
  createConnection,
  deleteConnection,
  testConnection,
} from '../services/cloudConnectionsApi';

// ── AWS Regions ────────────────────────────────────────────────────────────────
const AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
  'ap-southeast-1', 'ap-southeast-2',
  'ca-central-1',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'sa-east-1',
  'af-south-1', 'me-south-1',
];

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const configs = {
    CONNECTED: { icon: CheckCircle2, label: 'Connected', color: '#10B981', bg: '#10B98115' },
    FAILED:    { icon: XCircle,      label: 'Failed',    color: '#EF4444', bg: '#EF444415' },
    PENDING:   { icon: Clock,        label: 'Pending',   color: '#F59E0B', bg: '#F59E0B15' },
  };
  const { icon: Icon, label, color, bg } = configs[status] || configs.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color, background: bg, border: `1px solid ${color}30` }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// ── Test Progress Steps ────────────────────────────────────────────────────────
const TEST_STEPS = [
  'Connecting...',
  'Assuming IAM Role...',
  'Verifying AWS Account...',
];

// ── Empty Form State ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', accountId: '', roleArn: '', region: 'us-east-1', description: '',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE CONNECTION MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const CreateModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStep, setTestStep] = useState(-1);      // index into TEST_STEPS
  const [testResult, setTestResult] = useState(null); // { success, accountId?, error? }
  const [savedId, setSavedId] = useState(null);       // ID after first save (for test)
  const [apiError, setApiError] = useState('');

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
    setApiError('');
  };

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Connection name is required.';
    if (!/^\d{12}$/.test(form.accountId.trim())) errs.accountId = 'Must be exactly 12 digits.';
    if (!/^arn:aws:iam::\d{12}:role\/.+$/.test(form.roleArn.trim()))
      errs.roleArn = 'Invalid ARN format. Expected: arn:aws:iam::<account>:role/<name>';
    if (!form.region) errs.region = 'Region is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save (create) ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const res = await createConnection(form);
      setSavedId(res.data.data._id);
      onSaved(); // refresh parent list
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create connection.');
    } finally {
      setSaving(false);
    }
  };

  // ── Test Connection ────────────────────────────────────────────────────────
  const handleTest = async () => {
    if (!validate()) return;
    setTesting(true);
    setTestResult(null);
    setApiError('');

    // If not yet saved, save first silently to get an ID
    let id = savedId;
    if (!id) {
      try {
        const res = await createConnection(form);
        id = res.data.data._id;
        setSavedId(id);
        onSaved(); // refresh list so it shows immediately
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to create connection before testing.');
        setTesting(false);
        return;
      }
    }

    // Animate through steps
    for (let i = 0; i < TEST_STEPS.length; i++) {
      setTestStep(i);
      await new Promise((r) => setTimeout(r, 900));
    }

    try {
      const res = await testConnection(id);
      setTestResult({ success: true, ...res.data.data });
      onSaved(); // refresh to show CONNECTED status
    } catch (err) {
      const msg = err.response?.data?.data?.error || err.response?.data?.message || 'Connection test failed.';
      setTestResult({ success: false, error: msg });
      onSaved();
    } finally {
      setTesting(false);
      setTestStep(-1);
    }
  };

  const inputClass = (field) => `
    w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all
    border ${errors[field] ? 'border-red-400' : 'border-muted/30'}
  `;
  const inputStyle = { background: 'var(--color-background)', color: 'var(--color-text)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-muted)30' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-muted)20' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'var(--color-primary)15' }}>
              <Globe className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Add Cloud Connection</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors text-xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {apiError}
            </div>
          )}

          {/* Connection Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Connection Name *</label>
            <input
              value={form.name} onChange={set('name')} placeholder="e.g. Production AWS"
              className={inputClass('name')} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = errors.name ? '#F87171' : 'var(--color-muted)50'}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* AWS Account ID */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>AWS Account ID *</label>
            <input
              value={form.accountId} onChange={set('accountId')} placeholder="123456789012"
              className={inputClass('accountId')} style={inputStyle} maxLength={12}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = errors.accountId ? '#F87171' : 'var(--color-muted)50'}
            />
            {errors.accountId && <p className="text-xs text-red-500 mt-1">{errors.accountId}</p>}
          </div>

          {/* Role ARN */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>IAM Role ARN *</label>
            <input
              value={form.roleArn} onChange={set('roleArn')} placeholder="arn:aws:iam::123456789012:role/CloudGuardianRole"
              className={inputClass('roleArn')} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = errors.roleArn ? '#F87171' : 'var(--color-muted)50'}
            />
            {errors.roleArn && <p className="text-xs text-red-500 mt-1">{errors.roleArn}</p>}
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Region *</label>
            <select
              value={form.region} onChange={set('region')}
              className={inputClass('region')} style={inputStyle}
            >
              {AWS_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Description</label>
            <textarea
              value={form.description} onChange={set('description')} rows={2}
              placeholder="Optional — e.g. Production account for team X"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-muted/30 resize-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-muted)50'}
            />
          </div>

          {/* Test Progress */}
          {testing && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--color-background)', border: '1px solid var(--color-primary)30' }}>
              {TEST_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  {i < testStep ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                  ) : i === testStep ? (
                    <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <div className="w-4 h-4 flex-shrink-0 rounded-full border-2" style={{ borderColor: 'var(--color-muted)' }} />
                  )}
                  <span className="text-sm" style={{ color: i <= testStep ? 'var(--color-text)' : 'var(--color-muted)' }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Test Result */}
          {testResult && !testing && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                background: testResult.success ? '#10B98110' : '#EF444410',
                border: `1px solid ${testResult.success ? '#10B98130' : '#EF444430'}`,
                color: testResult.success ? '#059669' : '#DC2626',
              }}
            >
              {testResult.success ? (
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Connected successfully!</p>
                  <p className="text-xs opacity-80">Account: {testResult.accountId} · ARN: {testResult.arn}</p>
                </div>
              ) : (
                <p className="font-semibold flex items-center gap-2"><XCircle className="w-4 h-4" /> {testResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--color-muted)20' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--color-background)', color: 'var(--color-muted)', border: '1px solid var(--color-muted)30' }}
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={testing || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)', border: '1px solid var(--color-primary)40' }}
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={saving || testing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const CloudConnections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [error, setError] = useState('');

  const fetchConnections = useCallback(async () => {
    try {
      const res = await listConnections();
      setConnections(res.data.data);
    } catch {
      setError('Failed to load cloud connections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cloud connection? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteConnection(id);
      setConnections((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert('Failed to delete connection.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    setTestResults((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await testConnection(id);
      setTestResults((prev) => ({ ...prev, [id]: { success: true } }));
      // Refresh to show new status
      fetchConnections();
    } catch (err) {
      const msg = err.response?.data?.data?.error || 'Test failed.';
      setTestResults((prev) => ({ ...prev, [id]: { success: false, error: msg } }));
      fetchConnections();
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: 'var(--color-surface)CC', borderColor: 'var(--color-muted)20' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <div className="w-px h-5" style={{ background: 'var(--color-muted)30' }} />
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Cloud Connections</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchConnections}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-muted)' }}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md"
              style={{ background: 'var(--color-primary)' }}
            >
              <Plus className="w-4 h-4" />
              Add Connection
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--color-text)' }}>
            AWS Cloud Connections
          </h1>
          <p className="text-base" style={{ color: 'var(--color-muted)' }}>
            Connect your AWS accounts using IAM Roles. CloudGuardian uses STS to assume roles securely — no long-lived credentials stored.
          </p>
        </div>

        {/* How it works banner */}
        <div
          className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: 'var(--color-primary)08', border: '1px solid var(--color-primary)25' }}
        >
          <Shield className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>How it works</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Create an IAM Role in your AWS account with a trust policy allowing CloudGuardian to assume it.
              Provide the Role ARN here. CloudGuardian will never store or use long-lived credentials.
            </p>
          </div>
          <a
            href="https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap shrink-0 hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            AWS Docs <ChevronRight className="w-3 h-3" />
          </a>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : connections.length === 0 ? (
          /* Empty State */
          <div
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20 text-center"
            style={{ borderColor: 'var(--color-muted)30' }}
          >
            <div className="p-5 rounded-2xl mb-5" style={{ background: 'var(--color-primary)10' }}>
              <Globe className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>No connections yet</h3>
            <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
              Add your first AWS account to start scanning for cost optimization opportunities.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <Plus className="w-4 h-4" />
              Add Connection
            </button>
          </div>
        ) : (
          /* Connections Table */
          <div
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{ border: '1px solid var(--color-muted)20' }}
          >
            {/* Table Header */}
            <div
              className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider"
              style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', borderBottom: '1px solid var(--color-muted)15' }}
            >
              <span className="col-span-3">Connection Name</span>
              <span className="col-span-2">Provider</span>
              <span className="col-span-2">AWS Account</span>
              <span className="col-span-2">Region</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            {/* Rows */}
            {connections.map((conn) => (
              <div
                key={conn._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors"
                style={{
                  background: 'var(--color-surface)',
                  borderBottom: '1px solid var(--color-muted)10',
                }}
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'var(--color-primary)10' }}>
                      <Server className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{conn.name}</p>
                      {conn.description && (
                        <p className="text-xs mt-0.5 truncate max-w-[140px]" style={{ color: 'var(--color-muted)' }}>{conn.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-sm font-mono font-semibold" style={{ color: 'var(--color-text)' }}>{conn.provider}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-sm font-mono" style={{ color: 'var(--color-muted)' }}>{conn.accountId}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>{conn.region}</span>
                </div>

                <div className="col-span-1">
                  <StatusBadge status={conn.status} />
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  {/* Test Button */}
                  <button
                    onClick={() => handleTest(conn._id)}
                    disabled={testingId === conn._id}
                    title="Test Connection"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'var(--color-primary)10', color: 'var(--color-primary)', border: '1px solid var(--color-primary)30' }}
                  >
                    {testingId === conn._id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Zap className="w-3.5 h-3.5" />}
                    {testingId === conn._id ? 'Testing...' : 'Test'}
                  </button>

                  {/* Scan Button */}
                  <button
                    onClick={() => navigate('/scanner', { state: { connectionId: conn._id, connectionName: conn.name } })}
                    title="Scan this connection"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Scan
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(conn._id)}
                    disabled={deletingId === conn._id}
                    title="Delete"
                    className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                    style={{ color: '#EF4444', background: '#EF444410' }}
                  >
                    {deletingId === conn._id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Inline test result */}
                {testResults[conn._id] && (
                  <div className="col-span-12 text-xs mt-1 px-1">
                    {testResults[conn._id].success ? (
                      <span style={{ color: '#10B981' }}>✓ Test passed</span>
                    ) : (
                      <span style={{ color: '#EF4444' }}>✗ {testResults[conn._id].error}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onSaved={fetchConnections}
        />
      )}
    </div>
  );
};

export default CloudConnections;
