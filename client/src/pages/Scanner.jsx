import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, CheckCircle2, Circle, Loader2, AlertCircle, ArrowLeft, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listConnections } from '../services/cloudConnectionsApi';

// Define the exact sequence of steps the user requested
const STEPS_SEQUENCE = [
  'Connecting...',
  'Scanning EC2...',
  'Scanning S3...',
  'Scanning RDS...',
  'Scanning Lambda...',
  'Analyzing Resources...',
  'Saving Report...',
  'Completed.',
];

const Scanner = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, completed, error
  const [scanData, setScanData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Connections
  const [connections, setConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [loadingConnections, setLoadingConnections] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Connect to Socket.IO server
    const socketUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    const newSocket = io(socketUrl || 'http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('scan_progress', (data) => {
      setCurrentStep(data.step);
      
      if (data.status === 'completed') {
        setScanStatus('completed');
        setScanData(data.data);
      }
    });

    newSocket.on('scan_error', (data) => {
      setScanStatus('error');
      setErrorMessage(data.message || 'The scan encountered an error. Please try again.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch connections on mount
  useEffect(() => {
    const fetchConns = async () => {
      try {
        const res = await listConnections();
        const conns = res.data.data;
        setConnections(conns);

        // Pre-select if passed via state
        if (location.state?.connectionId) {
          setSelectedConnectionId(location.state.connectionId);
        } else if (conns.length > 0) {
          // Pre-select first connected one if possible, otherwise first one
          const connected = conns.find(c => c.status === 'CONNECTED');
          setSelectedConnectionId(connected ? connected._id : conns[0]._id);
        }
      } catch (err) {
        setErrorMessage('Failed to load cloud connections.');
      } finally {
        setLoadingConnections(false);
      }
    };
    fetchConns();
  }, [location.state]);

  const startScan = () => {
    if (!selectedConnectionId) {
      setErrorMessage('Please select a cloud connection first.');
      return;
    }

    if (socket && isConnected) {
      setScanStatus('scanning');
      setScanData(null);
      setErrorMessage('');
      setCurrentStep(STEPS_SEQUENCE[0]); // Optimistic update
      socket.emit('start_scan', { userId: user?._id, connectionId: selectedConnectionId });
    }
  };

  // Helper to determine step icon and styling
  const getStepStatus = (stepName) => {
    if (scanStatus === 'idle') return { state: 'pending', color: 'text-muted' };
    if (scanStatus === 'error') return { state: 'error', color: 'text-red-500' };
    
    const currentIndex = STEPS_SEQUENCE.indexOf(currentStep);
    const stepIndex = STEPS_SEQUENCE.indexOf(stepName);
    
    if (currentIndex === -1) return { state: 'pending', color: 'text-muted' };
    
    if (stepIndex < currentIndex || scanStatus === 'completed') {
      return { state: 'completed', color: 'text-green-500' };
    } else if (stepIndex === currentIndex) {
      return { state: 'active', color: 'text-secondary' };
    } else {
      return { state: 'pending', color: 'text-slate-600' };
    }
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-muted hover:text-text transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-surface rounded-2xl border border-muted/20 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center bg-surface/50 gap-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Cloud Infrastructure Scanner</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-sm text-muted">
                    {isConnected ? 'Connected to Server' : 'Disconnected - Reconnecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col items-end gap-2">
              <button
                onClick={startScan}
                disabled={!isConnected || scanStatus === 'scanning' || !selectedConnectionId}
                className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-accent disabled:bg-muted/10 disabled:text-muted disabled:cursor-not-allowed rounded-lg font-medium text-white transition-all shadow-lg shadow-primary/20"
              >
                {scanStatus === 'scanning' ? 'Scan in Progress...' : 
                 scanStatus === 'completed' ? 'Run Another Scan' : 
                 'Start Scan'}
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Connection Selector */}
            <div className="mb-8 p-4 rounded-xl border border-muted/20 bg-background/50">
              <label className="block text-sm font-semibold mb-2 text-muted uppercase tracking-wide">
                Target Cloud Connection
              </label>
              
              {loadingConnections ? (
                <div className="flex items-center text-sm text-muted">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading connections...
                </div>
              ) : connections.length === 0 ? (
                <div className="text-sm text-muted flex items-center gap-2">
                  No AWS connections found. 
                  <Link to="/connections" className="text-primary font-medium hover:underline flex items-center">
                    Add one here <ChevronRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <select
                    value={selectedConnectionId}
                    onChange={(e) => setSelectedConnectionId(e.target.value)}
                    disabled={scanStatus === 'scanning'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-surface border border-muted/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                  >
                    <option value="" disabled>Select a connection to scan</option>
                    {connections.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.accountId}) — {c.region} {c.status !== 'CONNECTED' ? `[${c.status}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-6 relative">
              {/* Connecting line behind icons */}
              <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-muted/10/50 -z-10" />

              {STEPS_SEQUENCE.map((step, idx) => {
                const { state, color } = getStepStatus(step);
                return (
                  <div key={idx} className={`flex items-center space-x-4 transition-all duration-500 ${state === 'pending' && scanStatus !== 'idle' ? 'opacity-40' : 'opacity-100'}`}>
                    <div className={`bg-surface rounded-full ${color} transition-colors duration-300`}>
                      {state === 'completed' && <CheckCircle2 className="w-6 h-6" />}
                      {state === 'active' && <Loader2 className="w-6 h-6 animate-spin" />}
                      {state === 'pending' && <Circle className="w-6 h-6" />}
                      {state === 'error' && <AlertCircle className="w-6 h-6" />}
                    </div>
                    <span className={`text-lg font-medium transition-colors duration-300 ${state === 'active' ? 'text-text' : 'text-muted'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Scan Results Summary (Shown on complete) */}
            {scanStatus === 'completed' && scanData && (
              <div className="mt-10 p-6 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Scan Summary Report
                </h3>
                <p className="text-sm text-muted mb-4">Connection: <span className="text-text font-medium">{scanData.connectionName}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface p-4 rounded-lg border border-muted/20">
                    <div className="text-sm text-muted">EC2 Instances</div>
                    <div className="text-2xl font-bold text-text mt-1">{scanData.ec2Count}</div>
                  </div>
                  <div className="bg-surface p-4 rounded-lg border border-muted/20">
                    <div className="text-sm text-muted">S3 Buckets</div>
                    <div className="text-2xl font-bold text-text mt-1">{scanData.s3Count}</div>
                  </div>
                  <div className="bg-surface p-4 rounded-lg border border-muted/20">
                    <div className="text-sm text-muted">RDS Databases</div>
                    <div className="text-2xl font-bold text-text mt-1">{scanData.rdsCount}</div>
                  </div>
                  <div className="bg-surface p-4 rounded-lg border border-muted/20">
                    <div className="text-sm text-muted">Lambda Functions</div>
                    <div className="text-2xl font-bold text-text mt-1">{scanData.lambdaCount}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {(scanStatus === 'error' || errorMessage) && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {errorMessage || 'The scan encountered an error. Please try again.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
