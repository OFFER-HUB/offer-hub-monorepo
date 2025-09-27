"use client";

import React, { useState, useEffect } from "react";
import {
  FraudAlert,
  UserRiskProfile,
  AlertStatus,
} from "@/types/security.types";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  TrendingUp,
  Filter,
  Search,
  Download,
  Clock,
  CheckCircle,
  Ban,
  Flag,
  Activity,
  MapPin,
  RefreshCw,
  Bell,
  Zap,
  Shield,
  Target,
  User,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Mock types based on your existing types
const FraudType = {
  PAYMENT_FRAUD: "payment_fraud",
  IDENTITY_THEFT: "identity_theft",
  ACCOUNT_FRAUD: "account_fraud",
  TRANSACTION_FRAUD: "transaction_fraud",
  SYNTHETIC_IDENTITY: "synthetic_identity",
  CHARGEBACK_FRAUD: "chargeback_fraud",
  AFFILIATE_FRAUD: "affiliate_fraud",
  BONUS_ABUSE: "bonus_abuse",
  FAKE_REVIEWS: "fake_reviews",
};

const AlertSeverity = {
  INFO: "info",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

const FraudDetection = () => {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserRiskProfile[]>([]);
  type FraudAnalytics = {
    fraudTrends: Array<{
      date: string;
      count: number;
      amount: number;
      type: string;
    }>;
    riskDistribution: Array<{
      level: string;
      count: number;
      percentage?: number;
    }>;
    fraudByType: Array<{ type: string; count: number; amount: number }>;
  } | null;
  const [analytics, setAnalytics] = useState<FraudAnalytics>(null);
  const [loading, setLoading] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    status: "",
    timeRange: "24h",
    searchQuery: "",
    userId: "",
  });

  const [selectedTab, setSelectedTab] = useState("alerts");
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const mockAlerts = Array.from({ length: 25 }, (_, i) => ({
        id: `alert-${i + 1}`,
        type: Object.values(FraudType)[
          Math.floor(Math.random() * Object.values(FraudType).length)
        ],
        severity:
          Object.values(AlertSeverity)[
            Math.floor(Math.random() * Object.values(AlertSeverity).length)
          ],
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        description: `Fraud alert ${i + 1}: ${Object.values(FraudType)[
          Math.floor(Math.random() * Object.values(FraudType).length)
        ].replace("_", " ")}`,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        riskScore: Math.floor(Math.random() * 100),
        confidence: Math.random(),
        triggers: [`trigger-${i + 1}`, `trigger-${i + 2}`],
        status:
          Object.values(AlertStatus)[
            Math.floor(Math.random() * Object.values(AlertStatus).length)
          ],
        amount: Math.floor(Math.random() * 10000) + 100,
        location: {
          country: ["US", "CA", "UK", "FR", "DE"][
            Math.floor(Math.random() * 5)
          ],
          city: ["New York", "London", "Paris", "Berlin", "Toronto"][
            Math.floor(Math.random() * 5)
          ],
        },
        deviceInfo: {
          type: Math.random() > 0.5 ? "desktop" : "mobile",
          browser: ["Chrome", "Firefox", "Safari", "Edge"][
            Math.floor(Math.random() * 4)
          ],
          os: ["Windows", "macOS", "iOS", "Android"][
            Math.floor(Math.random() * 4)
          ],
        },
      }));

      const mockProfiles = Array.from({ length: 15 }, (_, i) => ({
        userId: `user-${i + 1}`,
        riskScore: Math.floor(Math.random() * 100),
        riskLevel: [
          "very_low",
          "low",
          "medium",
          "high",
          "very_high",
          "critical",
        ][Math.floor(Math.random() * 6)],
        totalTransactions: Math.floor(Math.random() * 1000) + 10,
        flaggedTransactions: Math.floor(Math.random() * 50),
        accountAge: Math.floor(Math.random() * 365) + 30,
        lastActivity: new Date(
          Date.now() - Math.random() * 24 * 60 * 60 * 1000
        ),
        behaviorScore: Math.random(),
        deviceFingerprints: Math.floor(Math.random() * 5) + 1,
        locationVariance: Math.random(),
        fraudHistory: Math.floor(Math.random() * 10),
      }));

      const mockAnalytics = {
        fraudTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          count: Math.floor(Math.random() * 50) + 5,
          amount: Math.floor(Math.random() * 100000) + 1000,
          type: Object.values(FraudType)[
            Math.floor(Math.random() * Object.values(FraudType).length)
          ],
        })),
        riskDistribution: [
          { level: "Very Low", count: 450, percentage: 45 },
          { level: "Low", count: 280, percentage: 28 },
          { level: "Medium", count: 150, percentage: 15 },
          { level: "High", count: 80, percentage: 8 },
          { level: "Very High", count: 30, percentage: 3 },
          { level: "Critical", count: 10, percentage: 1 },
        ],
        fraudByType: Object.values(FraudType).map((type) => ({
          type: type.replace("_", " ").toUpperCase(),
          count: Math.floor(Math.random() * 100) + 10,
          amount: Math.floor(Math.random() * 500000) + 10000,
        })),
      };

      setFraudAlerts(mockAlerts as unknown as FraudAlert[]);
      setUserProfiles(mockProfiles as unknown as UserRiskProfile[]);
      setAnalytics(mockAnalytics as FraudAnalytics);
    };

    generateMockData();
  }, []);

  // Filter alerts based on current filters
  const filteredAlerts = fraudAlerts.filter((alert) => {
    if (filters.type && alert.type !== filters.type) return false;
    if (filters.severity && alert.severity !== filters.severity) return false;
    if (filters.status && alert.status !== filters.status) return false;
    if (filters.userId && !alert.userId.includes(filters.userId)) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        alert.description.toLowerCase().includes(query) ||
        alert.userId.includes(query) ||
        alert.type.toLowerCase().includes(query)
      );
    }
    return true;
  });

  type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "info":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  type AlertStatus =
    | "open"
    | "investigating"
    | "escalated"
    | "resolved"
    | "false_positive";

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case "open":
        return "text-red-600 bg-red-50";
      case "investigating":
        return "text-orange-600 bg-orange-50";
      case "escalated":
        return "text-purple-600 bg-purple-50";
      case "resolved":
        return "text-green-600 bg-green-50";
      case "false_positive":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  type Level =
    | "critical"
    | "very_high"
    | "high"
    | "medium"
    | "low"
    | "very_low";

  const getRiskLevelColor = (level: Level) => {
    switch (level) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "very_high":
        return "text-red-500 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      case "very_low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedAlerts.length === 0) return;

    // Mock bulk action processing
    console.log(`Performing ${action} on ${selectedAlerts.length} alerts`);
    setSelectedAlerts([]);
  };

  const updateAlertStatus = async (alertId: string, status: AlertStatus) => {
    setFraudAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? ({ ...alert, status } as FraudAlert) : alert
      )
    );
  };

  const COLORS = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Fraud Detection Center
            </h1>
            <p className="text-gray-600 mt-2">
              Advanced fraud detection and prevention system
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">AI Detection Active</span>
            </div>
            <button
              onClick={() => setLoading(!loading)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredAlerts.filter((a) => a.status === "open").length}
              </p>
              <p className="text-sm text-red-600">
                {filteredAlerts.filter((a) => a.severity === "critical").length}{" "}
                critical
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                High-Risk Users
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  userProfiles.filter(
                    (u) => u.riskLevel === "high" || u.riskLevel === "very_high"
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500">Under monitoring</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fraud Rate</p>
              <p className="text-3xl font-bold text-gray-900">2.3%</p>
              <p className="text-sm text-green-600">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                -0.5% from last month
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Blocked Amount
              </p>
              <p className="text-3xl font-bold text-gray-900">$847K</p>
              <p className="text-sm text-green-600">Today</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "alerts", name: "Fraud Alerts", icon: Bell },
              { id: "profiles", name: "User Risk Profiles", icon: Users },
              { id: "analytics", name: "Fraud Analytics", icon: TrendingUp },
              { id: "patterns", name: "Pattern Analysis", icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`${
                    selectedTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Fraud Alerts Tab */}
          {selectedTab === "alerts" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search alerts..."
                      value={filters.searchQuery}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          searchQuery: e.target.value,
                        }))
                      }
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Types</option>
                    {Object.values(FraudType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.severity}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        severity: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Severities</option>
                    {Object.values(AlertSeverity).map((severity) => (
                      <option key={severity} value={severity}>
                        {severity.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(AlertStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedAlerts.length > 0 && (
                    <>
                      <span className="text-sm text-gray-600">
                        {selectedAlerts.length} selected
                      </span>
                      <button
                        onClick={() => handleBulkAction("resolve")}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleBulkAction("escalate")}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => handleBulkAction("false_positive")}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                      >
                        False Positive
                      </button>
                    </>
                  )}
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <Download className="h-4 w-4 mr-2 inline" />
                    Export
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAlerts(
                                  filteredAlerts.map((a) => a.id)
                                );
                              } else {
                                setSelectedAlerts([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Alert Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Risk Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAlerts.slice(0, 20).map((alert) => (
                        <React.Fragment key={alert.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedAlerts.includes(alert.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAlerts((prev) => [
                                      ...prev,
                                      alert.id,
                                    ]);
                                  } else {
                                    setSelectedAlerts((prev) =>
                                      prev.filter((id) => id !== alert.id)
                                    );
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <AlertTriangle
                                  className={`h-5 w-5 ${
                                    alert.severity === "critical"
                                      ? "text-red-600"
                                      : alert.severity === "high"
                                      ? "text-orange-600"
                                      : alert.severity === "medium"
                                      ? "text-yellow-600"
                                      : "text-blue-600"
                                  }`}
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {alert.type.replace("_", " ").toUpperCase()}
                                  </div>
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {alert.description}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {alert.timestamp.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(
                                  alert.severity
                                )}`}
                              >
                                {alert.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {alert.userId}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${alert.amount?.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div
                                  className={`text-sm font-medium ${
                                    alert.riskScore >= 80
                                      ? "text-red-600"
                                      : alert.riskScore >= 60
                                      ? "text-orange-600"
                                      : alert.riskScore >= 40
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {alert.riskScore}
                                </div>
                                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      alert.riskScore >= 80
                                        ? "bg-red-500"
                                        : alert.riskScore >= 60
                                        ? "bg-orange-500"
                                        : alert.riskScore >= 40
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    }`}
                                    style={{ width: `${alert.riskScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  alert.status
                                )}`}
                              >
                                {alert.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    setShowDetails(
                                      showDetails === alert.id ? null : alert.id
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  {showDetails === alert.id ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>

                                {alert.status === "open" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updateAlertStatus(
                                          alert.id,
                                          "investigating"
                                        )
                                      }
                                      className="text-orange-600 hover:text-orange-900"
                                      title="Start Investigation"
                                    >
                                      <Search className="h-4 w-4" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedAlert(alert);
                                        setActionModalOpen(true);
                                      }}
                                      className="text-red-600 hover:text-red-900"
                                      title="Take Action"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() =>
                                    updateAlertStatus(alert.id, "resolved")
                                  }
                                  className="text-green-600 hover:text-green-900"
                                  title="Mark as Resolved"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Details */}
                          {showDetails === alert.id && (
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                      Location & Device
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">
                                          Location:
                                        </span>
                                        <span className="text-gray-900 flex items-center">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {alert.location?.city},{" "}
                                          {alert.location?.country}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">
                                          Device:
                                        </span>
                                        <span className="text-gray-900">
                                          {alert.deviceInfo?.type} -{" "}
                                          {alert.deviceInfo?.os}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">
                                          Browser:
                                        </span>
                                        <span className="text-gray-900">
                                          {alert.deviceInfo?.browser}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                      Actions
                                    </h4>
                                    <div className="space-y-2">
                                      <button
                                        onClick={() => {
                                          setSelectedAlert(alert);
                                          setActionModalOpen(true);
                                        }}
                                        className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                                      >
                                        Block User Account
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateAlertStatus(
                                            alert.id,
                                            "false_positive"
                                          )
                                        }
                                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                                      >
                                        Mark as False Positive
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Risk Profiles Tab */}
          {selectedTab === "profiles" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  High-Risk User Profiles
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                    <option>All Risk Levels</option>
                    <option>Critical</option>
                    <option>Very High</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {userProfiles
                  .filter(
                    (p) =>
                      p.riskLevel === "high" ||
                      p.riskLevel === "very_high" ||
                      p.riskLevel === "critical"
                  )
                  .slice(0, 12)
                  .map((profile) => (
                    <div
                      key={profile.userId}
                      className="bg-white rounded-lg border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {profile.userId}
                            </h4>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(
                                profile.riskLevel
                              )}`}
                            >
                              {profile.riskLevel
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              profile.riskScore >= 80
                                ? "text-red-600"
                                : profile.riskScore >= 60
                                ? "text-orange-600"
                                : profile.riskScore >= 40
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {profile.riskScore}
                          </div>
                          <div className="text-xs text-gray-500">
                            Risk Score
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Total Transactions:
                          </span>
                          <span className="font-medium">
                            {profile.totalTransactions}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Flagged:</span>
                          <span
                            className={`font-medium ${
                              (profile.flaggedTransactions as number) > 5
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {profile.flaggedTransactions}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Account Age:</span>
                          <span className="font-medium">
                            {profile.accountAge} days
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Device Count:</span>
                          <span className="font-medium">
                            {profile.deviceFingerprints}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Fraud History:</span>
                          <span
                            className={`font-medium ${
                              (profile.fraudHistory as number) > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {profile.fraudHistory} incidents
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last Activity:</span>
                          <span className="font-medium">
                            {profile.lastActivity?.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm font-medium">
                            Monitor
                          </button>
                          <button className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium">
                            Restrict
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === "analytics" && analytics && (
            <div className="space-y-6">
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fraud Trends */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fraud Trends (30 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.fraudTrends.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#F97316"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Risk Distribution */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Risk Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.riskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ level, percentage }) =>
                          `${level} ${percentage}%`
                        }
                      >
                        {analytics.riskDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Fraud by Type */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fraud by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.fraudByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="type"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Fraud Amount Trends */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fraud Amount Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.fraudTrends.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toLocaleString()}`,
                          "Amount",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#EF4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Fraud Blocked
                      </p>
                      <p className="text-2xl font-bold text-green-600">$2.3M</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Detection Rate</p>
                      <p className="text-2xl font-bold text-blue-600">97.8%</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        False Positive Rate
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">1.2%</p>
                    </div>
                    <Flag className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-purple-600">2.3s</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pattern Analysis Tab */}
          {selectedTab === "patterns" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Behavior Patterns */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Suspicious Behavior Patterns
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        pattern: "Multiple failed login attempts",
                        frequency: 45,
                        risk: "High",
                        trend: "↑ 12%",
                      },
                      {
                        pattern: "Unusual transaction timing",
                        frequency: 32,
                        risk: "Medium",
                        trend: "↓ 8%",
                      },
                      {
                        pattern: "Geographic location jumps",
                        frequency: 28,
                        risk: "High",
                        trend: "↑ 23%",
                      },
                      {
                        pattern: "Device fingerprint anomalies",
                        frequency: 19,
                        risk: "Medium",
                        trend: "→ 0%",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.pattern}
                          </div>
                          <div className="text-sm text-gray-500">
                            Frequency: {item.frequency}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.risk === "High"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.risk}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ML Model Performance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    ML Model Performance
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart
                      data={[
                        { subject: "Accuracy", A: 97.8, fullMark: 100 },
                        { subject: "Precision", A: 94.2, fullMark: 100 },
                        { subject: "Recall", A: 96.5, fullMark: 100 },
                        { subject: "F1-Score", A: 95.3, fullMark: 100 },
                        { subject: "Speed", A: 99.1, fullMark: 100 },
                      ]}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={72} domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#F97316"
                        fill="#F97316"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Pattern Alerts */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Pattern Alerts
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      time: "2 minutes ago",
                      pattern: "Coordinated account creation burst detected",
                      severity: "Critical",
                      affected: "23 accounts",
                    },
                    {
                      time: "15 minutes ago",
                      pattern: "Unusual payment method switching pattern",
                      severity: "High",
                      affected: "8 users",
                    },
                    {
                      time: "1 hour ago",
                      pattern: "Suspicious referral activity cluster",
                      severity: "Medium",
                      affected: "12 users",
                    },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Zap
                          className={`h-5 w-5 ${
                            alert.severity === "Critical"
                              ? "text-red-600"
                              : alert.severity === "High"
                              ? "text-orange-600"
                              : "text-yellow-600"
                          }`}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {alert.pattern}
                          </div>
                          <div className="text-sm text-gray-500">
                            {alert.affected} • {alert.time}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.severity === "Critical"
                            ? "bg-red-100 text-red-800"
                            : alert.severity === "High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Fraud Response Action
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Taking action against user:{" "}
                <strong>{selectedAlert.userId}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Alert: {selectedAlert.description}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  console.log("Suspending user account");
                  setActionModalOpen(false);
                  setSelectedAlert(null);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Suspend User Account
              </button>

              <button
                onClick={async () => {
                  console.log("Blocking transactions");
                  setActionModalOpen(false);
                  setSelectedAlert(null);
                }}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Block Transactions
              </button>

              <button
                onClick={async () => {
                  console.log("Requiring additional verification");
                  setActionModalOpen(false);
                  setSelectedAlert(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Require Additional Verification
              </button>

              <button
                onClick={async () => {
                  console.log("Sending alert to investigators");
                  setActionModalOpen(false);
                  setSelectedAlert(null);
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Alert Investigation Team
              </button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setActionModalOpen(false);
                  setSelectedAlert(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudDetection;
