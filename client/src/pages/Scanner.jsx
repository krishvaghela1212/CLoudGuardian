import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Circle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:5000', {
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
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startScan = () => {
    if (socket && isConnected) {
      setScanStatus('scanning');
      setScanData(null);
      setCurrentStep(STEPS_SEQUENCE[0]); // Optimistic update
      socket.emit('start_scan', { userId: user?._id });
    }
  };

  // Helper to determine step icon and styling
  const getStepStatus = (stepName) => {
    if (scanStatus === 'idle') return { state: 'pending', color: 'text-slate-500' };
    if (scanStatus === 'error') return { state: 'error', color: 'text-red-500' };
    
    const currentIndex = STEPS_SEQUENCE.indexOf(currentStep);
    const stepIndex = STEPS_SEQUENCE.indexOf(stepName);
    
    if (currentIndex === -1) return { state: 'pending', color: 'text-slate-500' };
    
    if (stepIndex < currentIndex || scanStatus === 'completed') {
      return { state: 'completed', color: 'text-green-500' };
    } else if (stepIndex === currentIndex) {
      return { state: 'active', color: 'text-indigo-400' };
    } else {
      return { state: 'pending', color: 'text-slate-600' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-indigo-500" />
              <div>
                <h2 className="text-xl font-bold">Cloud Infrastructure Scanner</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-sm text-slate-400">
                    {isConnected ? 'Connected to Server' : 'Disconnected - Reconnecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={startScan}
              disabled={!isConnected || scanStatus === 'scanning'}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/20"
            >
              {scanStatus === 'scanning' ? 'Scan in Progress...' : 
               scanStatus === 'completed' ? 'Run Another Scan' : 
               'Start Scan'}
            </button>
          </div>

          {/* Progress List */}
          <div className="p-8">
            <div className="space-y-6 relative">
              {/* Connecting line behind icons */}
              <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-slate-700/50 -z-10" />

              {STEPS_SEQUENCE.map((step, idx) => {
                const { state, color } = getStepStatus(step);
                return (
                  <div key={idx} className={`flex items-center space-x-4 transition-all duration-500 ${state === 'pending' && scanStatus !== 'idle' ? 'opacity-40' : 'opacity-100'}`}>
                    <div className={`bg-slate-800 rounded-full ${color} transition-colors duration-300`}>
                      {state === 'completed' && <CheckCircle2 className="w-6 h-6" />}
                      {state === 'active' && <Loader2 className="w-6 h-6 animate-spin" />}
                      {state === 'pending' && <Circle className="w-6 h-6" />}
                      {state === 'error' && <AlertCircle className="w-6 h-6" />}
                    </div>
                    <span className={`text-lg font-medium transition-colors duration-300 ${state === 'active' ? 'text-white' : 'text-slate-300'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Scan Results Summary (Shown on complete) */}
            {scanStatus === 'completed' && scanData && (
              <div className="mt-10 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Scan Summary Report
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400">EC2 Instances</div>
                    <div className="text-2xl font-bold text-white mt-1">{scanData.ec2Count}</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400">S3 Buckets</div>
                    <div className="text-2xl font-bold text-white mt-1">{scanData.s3Count}</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400">RDS Databases</div>
                    <div className="text-2xl font-bold text-white mt-1">{scanData.rdsCount}</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400">Lambda Functions</div>
                    <div className="text-2xl font-bold text-white mt-1">{scanData.lambdaCount}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {scanStatus === 'error' && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                The scan encountered an error. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
