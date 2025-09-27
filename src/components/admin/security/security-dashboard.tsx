"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  TrendingUp,
  Eye,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Pie,
} from "recharts";
import { useSecurityMonitoring } from "@/hooks/use-security-monitoring";

const SecurityDashboard = () => {
  const {
    dashboardData,
    threats,
    fraudAlerts,
    incidents,
    compliance,
    realTimeThreats,
    analytics,
    loading,
    error,
    refreshDashboard,
    loadAnalytics,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    updateThreatStatus,
    updateAlertStatus,
  } = useSecurityMonitoring();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "24h" | "7d" | "30d" | "90d"
  >("7d");
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "threats" | "fraud" | "incidents" | "compliance"
  >("overview");

  useEffect(() => {
    loadAnalytics(selectedPeriod);
  }, [selectedPeriod, loadAnalytics]);

  const handleRealTimeToggle = () => {
    if (isRealTimeActive) {
      stopRealTimeMonitoring();
      setIsRealTimeActive(false);
    } else {
      startRealTimeMonitoring();
      setIsRealTimeActive(true);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return "text-red-600 bg-red-50";
      case "investigating":
        return "text-orange-600 bg-orange-50";
      case "resolved":
      case "closed":
        return "text-green-600 bg-green-50";
      case "mitigated":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex items-center">
          <XCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Error Loading Security Dashboard
            </h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={refreshDashboard}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Security Command Center
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time security monitoring and threat detection
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRealTimeToggle}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                isRealTimeActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Activity
                className={`h-4 w-4 mr-2 ${
                  isRealTimeActive ? "animate-pulse" : ""
                }`}
              />
              {isRealTimeActive ? "Real-time Active" : "Enable Real-time"}
            </button>
            <button
              onClick={refreshDashboard}
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
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Threats
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.totalThreats}
                </p>
                <p className="text-sm text-gray-500">
                  {metrics.activeThreats} active
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
                  Fraud Alerts
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.fraudAlerts}
                </p>
                <p className="text-sm text-gray-500">Last 24 hours</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.riskScore}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${metrics.riskScore}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.complianceScore}%
                </p>
                <p className="text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Good standing
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: "overview", name: "Overview", icon: BarChart3 },
              { id: "threats", name: "Threats", icon: AlertTriangle },
              { id: "fraud", name: "Fraud Detection", icon: Eye },
              { id: "incidents", name: "Incidents", icon: Bell },
              { id: "compliance", name: "Compliance", icon: CheckCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600"
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
          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <div className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Trends Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Threat Trends
                  </h3>
                  {metrics?.threatTrends && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={metrics.threatTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3B82F6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Top Threats Distribution */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Threats
                  </h3>
                  {metrics?.topThreats && (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={metrics.topThreats.map((threat, index) => ({
                            name: threat.type.replace("_", " ").toUpperCase(),
                            value: threat.count,
                            fill: COLORS[index % COLORS.length],
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {metrics.topThreats.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Real-time Threats */}
              {realTimeThreats.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center">
                    <Bell className="h-5 w-5 mr-2 animate-pulse" />
                    Real-time Threat Alerts
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {realTimeThreats.slice(0, 5).map((threat) => (
                      <div
                        key={threat.id}
                        className="bg-white rounded p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {threat.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {threat.type.replace("_", " ")} • {threat.ipAddress}{" "}
                            • {threat.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(
                            threat.severity
                          )}`}
                        >
                          {threat.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Threats Tab */}
          {selectedTab === "threats" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Threats
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                    <option>All Types</option>
                    <option>Brute Force</option>
                    <option>Suspicious Login</option>
                    <option>Malicious IP</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Threat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {threats.slice(0, 10).map((threat) => (
                        <tr key={threat.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {threat.type.replace("_", " ").toUpperCase()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {threat.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                                threat.severity
                              )}`}
                            >
                              {threat.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {threat.ipAddress}
                            </div>
                            <div className="text-sm text-gray-500">
                              {threat.source}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                threat.status
                              )}`}
                            >
                              {threat.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  updateThreatStatus(
                                    threat.id,
                                    "mitigated" as any
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                Mitigate
                              </button>
                              <button
                                onClick={() =>
                                  updateThreatStatus(
                                    threat.id,
                                    "resolved" as any
                                  )
                                }
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Resolve
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Tab */}
          {selectedTab === "fraud" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Fraud Alerts
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                    <option>All Alerts</option>
                    <option>High Risk</option>
                    <option>Medium Risk</option>
                    <option>Low Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {fraudAlerts.slice(0, 6).map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-2">
                      {alert.type.replace("_", " ").toUpperCase()}
                    </h4>

                    <p className="text-sm text-gray-600 mb-4">
                      {alert.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Risk Score:</span>
                        <span className="font-medium">{alert.riskScore}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium">
                          {(alert.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">User ID:</span>
                        <span className="font-medium">{alert.userId}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          updateAlertStatus(alert.id, "investigating" as any)
                        }
                        className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm font-medium"
                      >
                        Investigate
                      </button>
                      <button
                        onClick={() =>
                          updateAlertStatus(alert.id, "resolved" as any)
                        }
                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incidents Tab */}
          {selectedTab === "incidents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Security Incidents
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Create Incident
                </button>
              </div>

              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            incident.status
                          )}`}
                        >
                          {incident.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Created {incident.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {incident.title}
                    </h4>
                    <p className="text-gray-600 mb-4">{incident.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <Users className="h-4 w-4 inline mr-1" />
                          {incident.affectedUsers.length} users affected
                        </span>
                        {incident.assignedTo && (
                          <span>Assigned to {incident.assignedTo}</span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          View Details
                        </button>
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {selectedTab === "compliance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Compliance Status
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Run Audit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {compliance.map((check) => (
                  <div
                    key={check.id}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {check.standard.replace("_", " ").toUpperCase()}
                      </h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          check.status === "compliant"
                            ? "bg-green-100 text-green-800"
                            : check.status === "partially_compliant"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {check.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Compliance Score</span>
                        <span className="font-medium">{check.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            check.score >= 90
                              ? "bg-green-500"
                              : check.score >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${check.score}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      Last checked: {check.lastChecked.toLocaleDateString()}
                    </div>

                    {check.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          Recommendations:
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {check.recommendations
                            .slice(0, 3)
                            .map((rec, index) => (
                              <li key={index} className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                {rec}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
