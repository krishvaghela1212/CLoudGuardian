import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  User as UserIcon,
  Shield,
  Bot,
  Download,
  Activity,
  AlertTriangle,
  DollarSign,
  Database,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dashboardRef = useRef(null);

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const fetchLatestReport = async () => {
    try {
      const res = await api.get("/api/reports/latest");
      setReport(res.data.data);
    } catch (err) {
      // 404 is expected if no report exists yet
      if (err.response?.status !== 404) {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      // Use html2canvas to capture the dashboard content
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Higher quality
        backgroundColor: "#0f172a", // Tailwind slate-900
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("CloudGuardian_Report.pdf");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  // Helper to safely extract counts
  const getCounts = () => {
    if (!report?.rawAwsData)
      return { ec2: 0, s3: 0, rds: 0, lambda: 0, total: 0 };
    const { ec2, s3, rds, lambda } = report.rawAwsData;
    const ec2Count = Array.isArray(ec2) ? ec2.length : 0;
    const s3Count = s3?.bucketCount || 0;
    const rdsCount = rds?.instanceCount || 0;
    const lambdaCount = lambda?.functionCount || 0;
    return {
      ec2: ec2Count,
      s3: s3Count,
      rds: rdsCount,
      lambda: lambdaCount,
      total: ec2Count + s3Count + rdsCount + lambdaCount,
    };
  };

  const counts = getCounts();

  // Prepare Chart Data
  const resourceData = [
    { name: "EC2", count: counts.ec2, fill: "#6366f1" },
    { name: "S3", count: counts.s3, fill: "#14b8a6" },
    { name: "RDS", count: counts.rds, fill: "#f59e0b" },
    { name: "Lambda", count: counts.lambda, fill: "#ec4899" },
  ];

  const ai = report?.aiAnalysis || {};

  // Handle both Rule Engine format and legacy AI format
  const isRuleEngineReport = ai.findings !== undefined;
  const findings = isRuleEngineReport ? ai.findings : [];
  const summary = isRuleEngineReport ? ai.summary : {};

  const savingsDisplay = isRuleEngineReport
    ? `$${(summary.totalEstimatedSavings || 0).toFixed(2)}/mo`
    : ai.savingsEstimate || "N/A";

  const highPriorityCount = isRuleEngineReport
    ? (summary.findingsBySeverity?.High || 0) +
      (summary.findingsBySeverity?.Critical || 0)
    : ai.priority?.high?.length || 0;

  const mediumPriorityCount = isRuleEngineReport
    ? summary.findingsBySeverity?.Medium || 0
    : ai.priority?.medium?.length || 0;

  const summaryText = isRuleEngineReport
    ? `Found ${summary.totalFindings || 0} optimization opportunities with estimated savings of $${(summary.totalEstimatedSavings || 0).toFixed(2)}/month across your infrastructure.`
    : ai.summary || "No analysis available yet.";

  const priorityData = [
    { name: "High", value: highPriorityCount, color: "#ef4444" },
    { name: "Medium", value: mediumPriorityCount, color: "#f59e0b" },
    {
      name: "Low",
      value: isRuleEngineReport
        ? summary.findingsBySeverity?.Low || 0
        : ai.priority?.low?.length || 0,
      color: "#10b981",
    },
  ].filter((d) => d.value > 0);

  // If no data, provide dummy data for pie chart so it renders something empty
  if (priorityData.length === 0) {
    priorityData.push({ name: "None", value: 1, color: "#334155" });
  }

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="bg-surface/80 backdrop-blur-md border-b border-muted/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                CloudGuardian AI
              </span>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate("/copilot")}
                className="hidden sm:inline-flex items-center px-3 py-2 bg-muted/10/50 hover:bg-muted/10 text-muted rounded-lg text-sm font-medium transition-colors"
              >
                <Bot className="h-4 w-4 mr-2 text-secondary" />
                Copilot
              </button>
              <button
                onClick={() => navigate("/scanner")}
                className="hidden sm:inline-flex items-center px-3 py-2 bg-primary hover:bg-accent text-background dark:bg-accent dark:text-primary rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-colors"
              >
                <Activity className="h-4 w-4 mr-2" />
                New Scan
              </button>
              <div className="h-6 w-px bg-muted/10 hidden sm:block mx-2"></div>
              <div className="flex items-center text-muted">
                <UserIcon className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm hidden sm:block">
                  {user?.fullName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted hover:text-text transition-colors p-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted font-medium">Loading Dashboard Data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        ) : !report ? (
          <div className="bg-surface rounded-2xl border border-muted/20 p-12 text-center shadow-xl">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-2">
              Welcome to CloudGuardian AI
            </h2>
            <p className="text-muted max-w-md mx-auto mb-8">
              It looks like you haven't run any AWS scans yet. Run your first
              scan to generate an AI-powered dashboard of your cloud
              infrastructure.
            </p>
            <button
              onClick={() => navigate("/scanner")}
              className="inline-flex items-center px-6 py-3 bg-primary hover:bg-accent text-background dark:bg-accent dark:text-primary rounded-xl font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <Activity className="w-5 h-5 mr-2" />
              Run Your First Scan
            </button>
          </div>
        ) : (
          <div ref={dashboardRef} className="space-y-6 pb-12">
            {/* Dashboard Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  Infrastructure Overview
                </h1>
                <p className="text-muted text-sm mt-1">
                  Last scanned on {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center px-4 py-2 bg-surface hover:bg-muted/10 border border-muted/20 text-text rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4 mr-2 text-muted" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Resources */}
              <div className="bg-surface/80 backdrop-blur border border-muted/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                <div className="flex justify-between items-start mb-4 relative">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Database className="w-5 h-5 text-secondary" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-text relative">
                  {counts.total}
                </h3>
                <p className="text-muted text-sm font-medium mt-1 relative">
                  Total Resources Found
                </p>
              </div>

              {/* Savings */}
              <div className="bg-surface/80 backdrop-blur border border-muted/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                <div className="flex justify-between items-start mb-4 relative">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text relative line-clamp-1">
                  {savingsDisplay}
                </h3>
                <p className="text-muted text-sm font-medium mt-1 relative">
                  Est. Cost Reduction
                </p>
              </div>

              {/* Critical Findings */}
              <div className="bg-surface/80 backdrop-blur border border-muted/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors" />
                <div className="flex justify-between items-start mb-4 relative">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-text relative">
                  {highPriorityCount}
                </h3>
                <p className="text-muted text-sm font-medium mt-1 relative">
                  High Priority Issues
                </p>
              </div>

              {/* Health Score (Simulated based on findings) */}
              <div className="bg-surface/80 backdrop-blur border border-muted/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                <div className="flex justify-between items-start mb-4 relative">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-text relative">
                  {Math.max(
                    0,
                    100 - highPriorityCount * 10 - mediumPriorityCount * 5,
                  )}
                  %
                </h3>
                <p className="text-muted text-sm font-medium mt-1 relative">
                  Cloud Health Score
                </p>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="bg-gradient-to-br from-primary/20/40 to-slate-800/40 border border-primary/20 rounded-2xl p-6 lg:p-8 shadow-inner">
              <div className="flex items-start">
                <Bot className="w-6 h-6 text-secondary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">
                    Infrastructure Analysis Summary
                  </h3>
                  <p className="text-muted leading-relaxed">{summaryText}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Distribution */}
              <div className="bg-surface rounded-2xl border border-muted/20 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-text mb-6">
                  Resource Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={resourceData}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#334155", opacity: 0.4 }}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {resourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority Severity Breakdown */}
              <div className="bg-surface rounded-2xl border border-muted/20 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-text mb-6">
                  Action Item Severity
                </h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {priorityData
                    .filter((d) => d.name !== "None")
                    .map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm text-muted">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Recommendations / Findings List */}
            {isRuleEngineReport && findings.length > 0 ? (
              <div className="bg-surface rounded-2xl border border-muted/20 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-muted/20">
                  <h3 className="text-lg font-semibold text-text">
                    Cost Optimization Findings
                  </h3>
                </div>
                <div className="divide-y divide-slate-700">
                  {findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-6 hover:bg-muted/10/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-secondary border border-primary/30 mr-3">
                              {finding.service}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                finding.severity === "High" ||
                                finding.severity === "Critical"
                                  ? "text-red-400"
                                  : finding.severity === "Medium"
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                              }`}
                            >
                              {finding.severity}
                            </span>
                          </div>
                          <h4 className="text-text font-medium">
                            {finding.name}: {finding.resourceName}
                          </h4>
                          <p className="text-muted text-sm mt-1">
                            {finding.recommendation}
                          </p>
                        </div>
                        {finding.estimatedMonthlySavings > 0 && (
                          <span className="text-emerald-400 font-semibold whitespace-nowrap">
                            ${finding.estimatedMonthlySavings.toFixed(2)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              ai.recommendations &&
              ai.recommendations.length > 0 && (
                <div className="bg-surface rounded-2xl border border-muted/20 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-muted/20">
                    <h3 className="text-lg font-semibold text-text">
                      Top Recommendations
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {ai.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-6 hover:bg-muted/10/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-secondary border border-primary/30 mr-3">
                                {rec.category}
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  rec.impact?.toLowerCase() === "high"
                                    ? "text-red-400"
                                    : rec.impact?.toLowerCase() === "medium"
                                      ? "text-amber-400"
                                      : "text-emerald-400"
                                }`}
                              >
                                {rec.impact} Impact
                              </span>
                            </div>
                            <h4 className="text-text font-medium text-base mb-1">
                              {rec.issue}
                            </h4>
                            <p className="text-muted text-sm">{rec.solution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
