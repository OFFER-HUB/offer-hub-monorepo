"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Activity,
  Globe,
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  XCircle,
  MapPin,
  Monitor,
  Smartphone,
  RefreshCw,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import { useSecurityMonitoring } from "@/hooks/use-security-monitoring";
import {
  SecurityThreat,
  ThreatType,
  ThreatSeverity,
  ThreatStatus,
} from "@/types/security.types";

const ThreatDetection = () => {
  const {
    threats,
    realTimeThreats,
    analytics,
    loading,
    error,
    loadThreats,
    updateThreatStatus,
    executeSecurityAction,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
  } = useSecurityMonitoring();

  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    status: "",
    timeRange: "24h",
    searchQuery: "",
  });

  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedThreatForAction, setSelectedThreatForAction] =
    useState<SecurityThreat | null>(null);

  // Filter threats based on current filters
  const filteredThreats = threats.filter((threat) => {
    if (filters.type && threat.type !== filters.type) return false;
    if (filters.severity && threat.severity !== filters.severity) return false;
    if (filters.status && threat.status !== filters.status) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        threat.description.toLowerCase().includes(query) ||
        threat.ipAddress.includes(query) ||
        threat.source.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleRealTimeToggle = () => {
    if (isRealTimeActive) {
      stopRealTimeMonitoring();
      setIsRealTimeActive(false);
    } else {
      startRealTimeMonitoring();
      setIsRealTimeActive(true);
    }
  };

  const handleBulkAction = async (
    action: "resolve" | "mitigate" | "block_ip"
  ) => {
    if (selectedThreats.length === 0) return;

    try {
      for (const threatId of selectedThreats) {
        const threat = threats.find((t) => t.id === threatId);
        if (!threat) continue;

        if (action === "block_ip") {
          await executeSecurityAction({
            type: "block_ip",
            target: threat.ipAddress,
            reason: `Blocked due to threat: ${threat.description}`,
            duration: 3600, // 1 hour
          });
        } else {
          await updateThreatStatus(
            threatId,
            action === "resolve"
              ? ThreatStatus.RESOLVED
              : ThreatStatus.MITIGATED
          );
        }
      }
      setSelectedThreats([]);
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };

  const getSeverityColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case ThreatSeverity.CRITICAL:
        return "text-red-600 bg-red-50 border-red-200";
      case ThreatSeverity.HIGH:
        return "text-orange-600 bg-orange-50 border-orange-200";
      case ThreatSeverity.MEDIUM:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case ThreatSeverity.LOW:
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: ThreatStatus) => {
    switch (status) {
      case ThreatStatus.ACTIVE:
        return "text-red-600 bg-red-50";
      case ThreatStatus.INVESTIGATING:
        return "text-orange-600 bg-orange-50";
      case ThreatStatus.MITIGATED:
        return "text-blue-600 bg-blue-50";
      case ThreatStatus.RESOLVED:
        return "text-green-600 bg-green-50";
      case ThreatStatus.FALSE_POSITIVE:
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  useEffect(() => {
    loadThreats(filters);
  }, [filters, loadThreats]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Threat Detection Center
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and analysis of security threats
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRealTimeToggle}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
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
              {isRealTimeActive ? "Live Monitoring" : "Start Monitoring"}
            </button>

            <button
              onClick={() => loadThreats(filters)}
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

        {/* Real-time Threat Stream */}
        {isRealTimeActive && realTimeThreats.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center">
              <Zap className="h-5 w-5 mr-2 animate-pulse" />
              Live Threat Stream
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {realTimeThreats.slice(0, 5).map((threat) => (
                <div
                  key={threat.id}
                  className="bg-white rounded p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        threat.severity === ThreatSeverity.CRITICAL
                          ? "text-red-600"
                          : threat.severity === ThreatSeverity.HIGH
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {threat.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {threat.ipAddress} •{" "}
                        {threat.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search threats..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {Object.values(ThreatType).map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, severity: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Severities</option>
              {Object.values(ThreatSeverity).map((severity) => (
                <option key={severity} value={severity}>
                  {severity.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.values(ThreatStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {selectedThreats.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedThreats.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction("resolve")}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleBulkAction("mitigate")}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  Mitigate
                </button>
                <button
                  onClick={() => handleBulkAction("block_ip")}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Block IPs
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Threats List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Active Threats ({filteredThreats.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedThreats(filteredThreats.map((t) => t.id));
                      } else {
                        setSelectedThreats([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threat Details
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
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredThreats.map((threat) => (
                <React.Fragment key={threat.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedThreats.includes(threat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedThreats((prev) => [...prev, threat.id]);
                          } else {
                            setSelectedThreats((prev) =>
                              prev.filter((id) => id !== threat.id)
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
                            threat.severity === ThreatSeverity.CRITICAL
                              ? "text-red-600"
                              : threat.severity === ThreatSeverity.HIGH
                              ? "text-orange-600"
                              : threat.severity === ThreatSeverity.MEDIUM
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {threat.type.replace("_", " ").toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {threat.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {threat.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(
                          threat.severity
                        )}`}
                      >
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(threat.userAgent)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {threat.ipAddress}
                          </div>
                          <div className="text-sm text-gray-500">
                            {threat.location?.city}, {threat.location?.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          threat.status
                        )}`}
                      >
                        {threat.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`text-sm font-medium ${
                            threat.riskScore >= 80
                              ? "text-red-600"
                              : threat.riskScore >= 60
                              ? "text-orange-600"
                              : threat.riskScore >= 40
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {threat.riskScore}
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              threat.riskScore >= 80
                                ? "bg-red-500"
                                : threat.riskScore >= 60
                                ? "bg-orange-500"
                                : threat.riskScore >= 40
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${threat.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setShowDetails(
                              showDetails === threat.id ? null : threat.id
                            )
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {showDetails === threat.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        {threat.status === ThreatStatus.ACTIVE && (
                          <>
                            <button
                              onClick={() =>
                                updateThreatStatus(
                                  threat.id,
                                  ThreatStatus.INVESTIGATING
                                )
                              }
                              className="text-orange-600 hover:text-orange-900"
                              title="Start Investigation"
                            >
                              <Search className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedThreatForAction(threat);
                                setActionModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Block IP"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {threat.status !== ThreatStatus.RESOLVED && (
                          <button
                            onClick={() =>
                              updateThreatStatus(
                                threat.id,
                                ThreatStatus.RESOLVED
                              )
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Details Row */}
                  {showDetails === threat.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Threat Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Type:</span>
                                <span className="text-gray-900">
                                  {threat.type.replace("_", " ")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Source:</span>
                                <span className="text-gray-900">
                                  {threat.source}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  User Agent:
                                </span>
                                <span
                                  className="text-gray-900 truncate max-w-64"
                                  title={threat.userAgent}
                                >
                                  {threat.userAgent}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  First Seen:
                                </span>
                                <span className="text-gray-900">
                                  {threat.timestamp.toLocaleString()}
                                </span>
                              </div>
                              {threat.userId && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">
                                    User ID:
                                  </span>
                                  <span className="text-gray-900">
                                    {threat.userId}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Location & Context
                            </h4>
                            <div className="space-y-2 text-sm">
                              {threat.location && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Location:
                                    </span>
                                    <span className="text-gray-900 flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {threat.location.city},{" "}
                                      {threat.location.country}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Coordinates:
                                    </span>
                                    <span className="text-gray-900">
                                      {threat.location.latitude.toFixed(4)},{" "}
                                      {threat.location.longitude.toFixed(4)}
                                    </span>
                                  </div>
                                  {threat.location.isVpn && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        VPN Detected:
                                      </span>
                                      <span className="text-red-600">Yes</span>
                                    </div>
                                  )}
                                  {threat.location.isTor && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Tor Network:
                                      </span>
                                      <span className="text-red-600">Yes</span>
                                    </div>
                                  )}
                                </>
                              )}

                              {threat.metadata &&
                                Object.keys(threat.metadata).length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                                      Additional Metadata
                                    </h5>
                                    <div className="bg-gray-100 rounded p-2">
                                      <pre className="text-xs text-gray-600 overflow-x-auto">
                                        {JSON.stringify(
                                          threat.metadata,
                                          null,
                                          2
                                        )}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex space-x-4">
                          <button
                            onClick={() => {
                              setSelectedThreatForAction(threat);
                              setActionModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Take Action
                          </button>

                          <button
                            onClick={() =>
                              updateThreatStatus(
                                threat.id,
                                ThreatStatus.FALSE_POSITIVE
                              )
                            }
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Mark as False Positive
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredThreats.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No threats found
            </h3>
            <p className="text-gray-600">
              {filters.searchQuery ||
              filters.type ||
              filters.severity ||
              filters.status
                ? "Try adjusting your filters to see more results."
                : "Your system is currently secure with no active threats detected."}
            </p>
          </div>
        )}
      </div>

      {/* Threat Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Threat Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.threatTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#EF4444"
                  fill="#FEE2E2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                data={filteredThreats.map((t) => ({
                  x: Math.random() * 100,
                  y: t.riskScore,
                  severity: t.severity,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" hide />
                <YAxis dataKey="y" domain={[0, 100]} />
                <Tooltip formatter={(value, name) => [value, "Risk Score"]} />
                <Scatter dataKey="y" fill="#EF4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Security Action Modal */}
      {actionModalOpen && selectedThreatForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Security Action
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Taking action against threat from IP:{" "}
                <strong>{selectedThreatForAction.ipAddress}</strong>
              </p>
              <p className="text-sm text-gray-500">
                {selectedThreatForAction.description}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await executeSecurityAction({
                    type: "block_ip",
                    target: selectedThreatForAction.ipAddress,
                    reason: `Blocked due to ${selectedThreatForAction.type}: ${selectedThreatForAction.description}`,
                    duration: 3600,
                  });
                  setActionModalOpen(false);
                  setSelectedThreatForAction(null);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Block IP Address (1 hour)
              </button>

              {selectedThreatForAction.userId && (
                <button
                  onClick={async () => {
                    await executeSecurityAction({
                      type: "suspend_user",
                      target: selectedThreatForAction.userId!,
                      reason: `Suspended due to ${selectedThreatForAction.type}: ${selectedThreatForAction.description}`,
                    });
                    setActionModalOpen(false);
                    setSelectedThreatForAction(null);
                  }}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Suspend User Account
                </button>
              )}

              <button
                onClick={async () => {
                  await executeSecurityAction({
                    type: "send_alert",
                    target: "security-team",
                    reason: `Alert for ${selectedThreatForAction.type}: ${selectedThreatForAction.description}`,
                  });
                  setActionModalOpen(false);
                  setSelectedThreatForAction(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Alert to Security Team
              </button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setActionModalOpen(false);
                  setSelectedThreatForAction(null);
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

export default ThreatDetection;
