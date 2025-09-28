import { useState, useEffect, useCallback, useRef } from "react";
import { securityService } from "@/services/security.service";
import {
  SecurityThreat,
  FraudAlert,
  IncidentResponse,
  SecurityDashboardData,
  ComplianceCheck,
  ThreatStatus,
  AlertStatus,
  ThreatSeverity,
} from "@/types/security.types";

type SecurityAnalytics = {
  threatTrends: Array<{ date: string; count: number; type: string }>;
  riskDistribution: Array<{ level: string; count: number }>;
  incidentMetrics: Array<{ status: string; count: number }>;
  complianceScores: Array<{ standard: string; score: number }>;
};

export const useSecurityMonitoring = () => {
  const [dashboardData, setDashboardData] =
    useState<SecurityDashboardData | null>(null);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([]);
  const [realTimeThreats, setRealTimeThreats] = useState<SecurityThreat[]>([]);
  const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopMonitoringRef = useRef<(() => void) | null>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await securityService.getDashboardData();
      setDashboardData(data);
      setThreats(data.activeThreats);
      setFraudAlerts(data.recentAlerts);
      setIncidents(data.incidents);
      setCompliance(data.compliance);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(
    async (period: "24h" | "7d" | "30d" | "90d") => {
      try {
        const analyticsData = await securityService.getSecurityAnalytics(
          period
        );
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    },
    []
  );

  // Load threats
  const loadThreats = useCallback(async (filters?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await securityService.getThreats(filters);
      setThreats(response.threats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load threats");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load fraud alerts
  const loadFraudAlerts = useCallback(
    async (filters?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await securityService.getFraudAlerts(filters);
        setFraudAlerts(response.alerts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load fraud alerts"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load incidents
  const loadIncidents = useCallback(
    async (filters?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await securityService.getIncidents(filters);
        setIncidents(response.incidents);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load incidents"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update threat status
  const updateThreatStatus = useCallback(
    async (threatId: string, status: ThreatStatus) => {
      try {
        const updatedThreat = await securityService.updateThreatStatus(
          threatId,
          status
        );
        setThreats((prev) =>
          prev.map((t) => (t.id === threatId ? updatedThreat : t))
        );

        // Refresh dashboard data to update metrics
        await loadDashboardData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update threat status"
        );
      }
    },
    [loadDashboardData]
  );

  // Update alert status
  const updateAlertStatus = useCallback(
    async (alertId: string, status: AlertStatus, notes?: string) => {
      try {
        const updatedAlert = await securityService.updateAlertStatus(
          alertId,
          status,
          notes
        );
        setFraudAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updatedAlert : a))
        );

        // Refresh dashboard data to update metrics
        await loadDashboardData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update alert status"
        );
      }
    },
    [loadDashboardData]
  );

  // Start real-time monitoring
  const startRealTimeMonitoring = useCallback(async () => {
    try {
      const stopFn = await securityService.startThreatMonitoring(
        (threat: SecurityThreat) => {
          setRealTimeThreats((prev) => {
            const updated = [threat, ...prev].slice(0, 20); // Keep only latest 20
            return updated;
          });

          // Update threats list if it's a high severity threat
          if (
            threat.severity === ThreatSeverity.CRITICAL ||
            threat.severity === ThreatSeverity.HIGH
          ) {
            setThreats((prev) => [threat, ...prev]);
          }
        }
      );

      stopMonitoringRef.current = stopFn;

      // Also start periodic refresh of dashboard data
      monitoringIntervalRef.current = setInterval(() => {
        loadDashboardData();
      }, 30000); // Refresh every 30 seconds
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start real-time monitoring"
      );
    }
  }, [loadDashboardData]);

  // Stop real-time monitoring
  const stopRealTimeMonitoring = useCallback(() => {
    if (stopMonitoringRef.current) {
      stopMonitoringRef.current();
      stopMonitoringRef.current = null;
    }

    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    setRealTimeThreats([]);
  }, []);

  // Refresh all data
  const refreshDashboard = useCallback(async () => {
    await loadDashboardData();
    await loadAnalytics("7d");
  }, [loadDashboardData, loadAnalytics]);

  // Execute security action
  const executeSecurityAction = useCallback(
    async (action: {
      type: "block_ip" | "suspend_user" | "require_2fa" | "send_alert";
      target: string;
      reason: string;
      duration?: number;
    }) => {
      try {
        const result = await securityService.executeSecurityAction(action);
        if (result.success) {
          // Refresh data after successful action
          await loadDashboardData();
        }
        return result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to execute security action"
        );
        throw err;
      }
    },
    [loadDashboardData]
  );

  // Create incident
  const createIncident = useCallback(
    async (
      incident: Omit<
        IncidentResponse,
        "id" | "createdAt" | "updatedAt" | "timeline"
      >
    ) => {
      try {
        const newIncident = await securityService.createIncident(incident);
        setIncidents((prev) => [newIncident, ...prev]);
        return newIncident;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create incident"
        );
        throw err;
      }
    },
    []
  );

  // Update incident
  const updateIncident = useCallback(
    async (incidentId: string, updates: Partial<IncidentResponse>) => {
      try {
        const updatedIncident = await securityService.updateIncident(
          incidentId,
          updates
        );
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? updatedIncident : i))
        );
        return updatedIncident;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update incident"
        );
        throw err;
      }
    },
    []
  );

  // Get risk assessment for user
  const getUserRiskProfile = useCallback(async (userId: string) => {
    try {
      return await securityService.getUserRiskProfile(userId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get user risk profile"
      );
      throw err;
    }
  }, []);

  // Run compliance check
  const runComplianceCheck = useCallback(async (standard: string) => {
    try {
      const result = await securityService.runComplianceCheck(standard);
      setCompliance((prev) =>
        prev.map((c) => (c.standard === result.standard ? result : c))
      );
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run compliance check"
      );
      throw err;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadDashboardData();
    loadAnalytics("7d");

    // Cleanup on unmount
    return () => {
      stopRealTimeMonitoring();
    };
  }, [loadDashboardData, loadAnalytics, stopRealTimeMonitoring]);

  return {
    // State
    dashboardData,
    threats,
    fraudAlerts,
    incidents,
    compliance,
    realTimeThreats,
    analytics,
    loading,
    error,

    // Actions
    loadDashboardData,
    loadAnalytics,
    loadThreats,
    loadFraudAlerts,
    loadIncidents,
    updateThreatStatus,
    updateAlertStatus,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    refreshDashboard,
    executeSecurityAction,
    createIncident,
    updateIncident,
    getUserRiskProfile,
    runComplianceCheck,
  };
};
