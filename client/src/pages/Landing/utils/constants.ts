// Design System constants for the Immersive Landing Page

export const COLORS = {
  background: '#0B0F14',
  surface: '#111827',
  primary: '#10B981',
  secondary: '#22D3EE',
  accent: '#7C3AED',
  warning: '#F59E0B',
  critical: '#EF4444',
  text: '#F8FAFC',
  muted: '#94A3B8',
} as const;

export const TIMING = {
  heroCounterDuration: 2500,
  sectionEnterDuration: 0.8,
  staggerDelay: 0.1,
  typingSpeed: 40,
  globeRotationSpeed: 0.002,
  particleCount: 200,
  nodeOrbitDuration: 20,
} as const;

export interface HeroMetric {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix: string;
  icon: string;
  color: string;
}

export const HERO_METRICS: HeroMetric[] = [
  { id: 'resources', label: 'Resources Scanned', value: 2847, suffix: '+', icon: 'cloud', color: COLORS.primary },
  { id: 'savings', label: 'Cost Saved', value: 142000, prefix: '$', suffix: '', icon: 'dollar', color: COLORS.secondary },
  { id: 'rules', label: 'Rules Active', value: 56, suffix: '', icon: 'shield', color: COLORS.accent },
  { id: 'security', label: 'Security Checks', value: 1200, suffix: '+', icon: 'lock', color: COLORS.warning },
];

export interface AWSNode {
  id: string;
  label: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  color: string;
}

export const AWS_NODES: AWSNode[] = [
  { id: 'ec2', label: 'EC2', orbitRadius: 3.2, orbitSpeed: 0.4, orbitOffset: 0, color: COLORS.primary },
  { id: 's3', label: 'S3', orbitRadius: 3.6, orbitSpeed: 0.3, orbitOffset: Math.PI / 3, color: COLORS.secondary },
  { id: 'lambda', label: 'Lambda', orbitRadius: 3.0, orbitSpeed: 0.5, orbitOffset: (2 * Math.PI) / 3, color: COLORS.accent },
  { id: 'rds', label: 'RDS', orbitRadius: 3.8, orbitSpeed: 0.25, orbitOffset: Math.PI, color: COLORS.warning },
  { id: 'cloudwatch', label: 'CloudWatch', orbitRadius: 3.4, orbitSpeed: 0.35, orbitOffset: (4 * Math.PI) / 3, color: COLORS.secondary },
  { id: 'iam', label: 'IAM', orbitRadius: 3.1, orbitSpeed: 0.45, orbitOffset: (5 * Math.PI) / 3, color: COLORS.critical },
];

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'aws-sts',
    title: 'AWS STS Authentication',
    description: 'Secure temporary credentials with cross-account role assumption for zero-trust access.',
    icon: 'STS',
    color: COLORS.primary,
  },
  {
    id: 'iam-security',
    title: 'IAM Role Security',
    description: 'Granular least-privilege policies with automated permission boundary enforcement.',
    icon: 'IAM',
    color: COLORS.accent,
  },
  {
    id: 'discovery-engine',
    title: 'Cloud Discovery Engine',
    description: 'Real-time multi-region resource scanning across all AWS services and accounts.',
    icon: 'CDE',
    color: COLORS.secondary,
  },
  {
    id: 'rule-engine',
    title: 'FinOps Rule Engine',
    description: 'Intelligent cost optimization rules with configurable thresholds and severity levels.',
    icon: 'FRE',
    color: COLORS.warning,
  },
  {
    id: 'groq-ai',
    title: 'Groq AI Analysis',
    description: 'Lightning-fast AI-powered explanations and actionable remediation recommendations.',
    icon: 'AI',
    color: COLORS.primary,
  },
  {
    id: 'socketio',
    title: 'Socket.IO Live Progress',
    description: 'Real-time scan progress streaming with live updates and interactive notifications.',
    icon: 'WS',
    color: COLORS.secondary,
  },
  {
    id: 'mongodb',
    title: 'MongoDB History',
    description: 'Persistent scan history and trend analysis for tracking optimization progress over time.',
    icon: 'DB',
    color: COLORS.accent,
  },
  {
    id: 'reports',
    title: 'Interactive Reports',
    description: 'Comprehensive visual reports with filterable findings, charts, and export capabilities.',
    icon: 'RPT',
    color: COLORS.warning,
  },
];

export interface PipelineStage {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'user', label: 'User', icon: 'U', description: 'Developer initiates cloud scan via dashboard or CLI.', color: COLORS.text },
  { id: 'sts', label: 'STS', icon: 'S', description: 'AWS STS issues temporary credentials with scoped permissions.', color: COLORS.primary },
  { id: 'discovery', label: 'Discovery', icon: 'D', description: 'Multi-region resource scanner discovers all active cloud assets.', color: COLORS.secondary },
  { id: 'rule-engine', label: 'Rule Engine', icon: 'R', description: 'FinOps rules analyze resources for cost optimization opportunities.', color: COLORS.warning },
  { id: 'groq', label: 'Groq', icon: 'G', description: 'AI generates human-readable explanations and remediation steps.', color: COLORS.accent },
  { id: 'dashboard', label: 'Dashboard', icon: 'DB', description: 'Interactive dashboard displays findings with charts and actions.', color: COLORS.primary },
];

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  estimatedSavings: string;
  color: string;
}

export const FINDINGS: Finding[] = [
  {
    id: 'idle-ec2',
    title: 'Idle EC2 Instance',
    severity: 'critical',
    service: 'EC2',
    estimatedSavings: '$2,400/yr',
    color: COLORS.critical,
  },
  {
    id: 'unused-ebs',
    title: 'Unused EBS Volume',
    severity: 'warning',
    service: 'EBS',
    estimatedSavings: '$180/yr',
    color: COLORS.warning,
  },
  {
    id: 'missing-lifecycle',
    title: 'Missing Lifecycle Policy',
    severity: 'warning',
    service: 'S3',
    estimatedSavings: '$960/yr',
    color: COLORS.warning,
  },
  {
    id: 'oversized-rds',
    title: 'Oversized RDS Instance',
    severity: 'critical',
    service: 'RDS',
    estimatedSavings: '$5,200/yr',
    color: COLORS.critical,
  },
];
