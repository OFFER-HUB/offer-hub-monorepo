import {
  SecurityThreat,
  FraudAlert,
  SecurityEvent,
  IncidentResponse,
  UserRiskProfile,
  SecurityDashboardData,
  ThreatDetectionResponse,
  FraudDetectionResponse,
  ThreatType,
  FraudType,
  ThreatSeverity,
  AlertSeverity,
  SecurityEventType,
  ThreatStatus,
  AlertStatus,
  RiskLevel,
  ComplianceCheck,
  IncidentSeverity,
  IncidentStatus,
  ComplianceStandard,
  ComplianceStatus,
} from "@/types/security.types";

class SecurityService {
  private readonly API_BASE = "/api/security";

  // Dashboard and Overview
  async getDashboardData(): Promise<SecurityDashboardData> {
    try {
      const response = await fetch(`${this.API_BASE}/dashboard`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    } catch (error) {
      console.warn("getDashboardData failed, returning mock data:", error);
      // Mock data for development
      return this.getMockDashboardData();
    }
  }

  // Threat Detection
  async getThreats(filters?: {
    type?: ThreatType;
    severity?: ThreatSeverity;
    status?: ThreatStatus;
    dateRange?: { start: Date; end: Date };
    page?: number;
    limit?: number;
  }): Promise<ThreatDetectionResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${this.API_BASE}/threats?${params}`);
      if (!response.ok) throw new Error("Failed to fetch threats");
      return response.json();
    } catch (error) {
      console.warn("getThreats failed, returning mock threats:", error);
      return this.getMockThreats();
    }
  }

  async createThreat(
    threat: Omit<SecurityThreat, "id" | "timestamp">
  ): Promise<SecurityThreat> {
    const response = await fetch(`${this.API_BASE}/threats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(threat),
    });
    return response.json();
  }

  async updateThreatStatus(
    threatId: string,
    status: ThreatStatus
  ): Promise<SecurityThreat> {
    const response = await fetch(
      `${this.API_BASE}/threats/${threatId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    return response.json();
  }

  // Fraud Detection
  async getFraudAlerts(filters?: {
    type?: FraudType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    userId?: string;
    dateRange?: { start: Date; end: Date };
    page?: number;
    limit?: number;
  }): Promise<FraudDetectionResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${this.API_BASE}/fraud/alerts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch fraud alerts");
      return response.json();
    } catch (error) {
      console.warn("getFraudAlerts failed, returning mock alerts:", error);
      return this.getMockFraudAlerts();
    }
  }

  async createFraudAlert(
    alert: Omit<FraudAlert, "id" | "timestamp">
  ): Promise<FraudAlert> {
    const response = await fetch(`${this.API_BASE}/fraud/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    });
    return response.json();
  }

  async updateAlertStatus(
    alertId: string,
    status: AlertStatus,
    notes?: string
  ): Promise<FraudAlert> {
    const response = await fetch(
      `${this.API_BASE}/fraud/alerts/${alertId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, investigationNotes: notes }),
      }
    );
    return response.json();
  }

  // User Risk Profiles
  async getUserRiskProfile(userId: string): Promise<UserRiskProfile> {
    const response = await fetch(`${this.API_BASE}/risk-profiles/${userId}`);
    if (!response.ok) {
      console.warn("getUserRiskProfile failed, returning mock profile");
      return this.getMockUserRiskProfile(userId);
    }
    return response.json();
  }

  async updateUserRiskScore(
    userId: string,
    riskScore: number
  ): Promise<UserRiskProfile> {
    const response = await fetch(
      `${this.API_BASE}/risk-profiles/${userId}/score`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskScore }),
      }
    );
    return response.json();
  }

  // Security Events
  async logSecurityEvent(
    event: Omit<SecurityEvent, "id" | "timestamp">
  ): Promise<SecurityEvent> {
    const response = await fetch(`${this.API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return response.json();
  }

  async getSecurityEvents(filters?: {
    eventType?: SecurityEventType;
    userId?: string;
    dateRange?: { start: Date; end: Date };
    flagged?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ events: SecurityEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.API_BASE}/events?${params}`);
    return response.json();
  }

  // Incident Response
  async getIncidents(filters?: {
    status?: string;
    severity?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ incidents: IncidentResponse[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${this.API_BASE}/incidents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      return response.json();
    } catch (error) {
      console.warn("getIncidents failed, returning mock incidents:", error);
      return this.getMockIncidents();
    }
  }

  async createIncident(
    incident: Omit<
      IncidentResponse,
      "id" | "createdAt" | "updatedAt" | "timeline"
    >
  ): Promise<IncidentResponse> {
    const response = await fetch(`${this.API_BASE}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    return response.json();
  }

  async updateIncident(
    incidentId: string,
    updates: Partial<IncidentResponse>
  ): Promise<IncidentResponse> {
    const response = await fetch(`${this.API_BASE}/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  // Automated Actions
  async executeSecurityAction(action: {
    type: "block_ip" | "suspend_user" | "require_2fa" | "send_alert";
    target: string;
    reason: string;
    duration?: number;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.API_BASE}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    return response.json();
  }

  // Analytics and Reporting
  async getSecurityAnalytics(period: "24h" | "7d" | "30d" | "90d"): Promise<{
    threatTrends: Array<{ date: string; count: number; type: string }>;
    riskDistribution: Array<{ level: string; count: number }>;
    incidentMetrics: Array<{ status: string; count: number }>;
    complianceScores: Array<{ standard: string; score: number }>;
  }> {
    try {
      const response = await fetch(
        `${this.API_BASE}/analytics?period=${period}`
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    } catch (error) {
      console.warn(
        "getSecurityAnalytics failed, returning mock analytics:",
        error
      );
      return this.getMockAnalytics();
    }
  }

  // Compliance
  async getComplianceStatus(): Promise<ComplianceCheck[]> {
    try {
      const response = await fetch(`${this.API_BASE}/compliance`);
      if (!response.ok) throw new Error("Failed to fetch compliance status");
      return response.json();
    } catch (error) {
      console.warn(
        "getComplianceStatus failed, returning mock compliance:",
        error
      );
      return this.getMockCompliance();
    }
  }

  async runComplianceCheck(standard: string): Promise<ComplianceCheck> {
    const response = await fetch(
      `${this.API_BASE}/compliance/${standard}/check`,
      {
        method: "POST",
      }
    );
    return response.json();
  }

  // Real-time monitoring
  async startThreatMonitoring(
    callback: (threat: SecurityThreat) => void
  ): Promise<() => void> {
    // In a real implementation, this would establish a WebSocket connection
    const interval = setInterval(() => {
      // Simulate real-time threat detection
      if (Math.random() < 0.1) {
        // 10% chance of new threat
        const mockThreat = this.generateMockThreat();
        callback(mockThreat);
      }
    }, 5000);

    return () => clearInterval(interval);
  }

  // Mock data generators for development
  private getMockDashboardData(): SecurityDashboardData {
    const now = new Date();
    return {
      metrics: {
        totalThreats: 342,
        activeThreats: 23,
        resolvedThreats: 319,
        fraudAlerts: 45,
        riskScore: 72,
        threatTrends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          count: Math.floor(Math.random() * 20) + 5,
          severity: Object.values(ThreatSeverity)[
            Math.floor(Math.random() * 4)
          ] as ThreatSeverity,
          type: Object.values(ThreatType)[
            Math.floor(Math.random() * 12)
          ] as ThreatType,
        })),
        topThreats: [
          {
            type: ThreatType.BRUTE_FORCE,
            count: 45,
            riskScore: 85,
            lastOccurrence: new Date(),
          },
          {
            type: ThreatType.SUSPICIOUS_LOGIN,
            count: 32,
            riskScore: 72,
            lastOccurrence: new Date(),
          },
          {
            type: ThreatType.MALICIOUS_IP,
            count: 28,
            riskScore: 68,
            lastOccurrence: new Date(),
          },
        ],
        complianceScore: 89,
      },
      activeThreats: this.generateMockThreats(5),
      recentAlerts: this.generateMockFraudAlerts(3),
      incidents: this.generateMockIncidents(2),
      compliance: this.getMockCompliance(),
    };
  }

  private getMockThreats(): ThreatDetectionResponse {
    return {
      threats: this.generateMockThreats(20),
      total: 342,
      page: 1,
      limit: 20,
      filters: {},
    };
  }

  private getMockFraudAlerts(): FraudDetectionResponse {
    return {
      alerts: this.generateMockFraudAlerts(15),
      total: 45,
      page: 1,
      limit: 15,
      riskProfiles: [
        this.getMockUserRiskProfile("user1"),
        this.getMockUserRiskProfile("user2"),
      ],
    };
  }

  private getMockIncidents(): { incidents: IncidentResponse[]; total: number } {
    return {
      incidents: this.generateMockIncidents(10),
      total: 25,
    };
  }

  private generateMockThreats(count: number): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    const threatTypes = Object.values(ThreatType);
    const severities = Object.values(ThreatSeverity);
    const statuses = Object.values(ThreatStatus);

    for (let i = 0; i < count; i++) {
      threats.push({
        id: `threat-${i + 1}`,
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: `Threat description ${i + 1}`,
        source: `Source ${i + 1}`,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        userId:
          Math.random() > 0.5
            ? `user-${Math.floor(Math.random() * 100)}`
            : undefined,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        riskScore: Math.floor(Math.random() * 100),
        metadata: { additionalInfo: "Mock data" },
      });
    }

    return threats;
  }

  private generateMockFraudAlerts(count: number): FraudAlert[] {
    const alerts: FraudAlert[] = [];
    const fraudTypes = Object.values(FraudType);
    const severities = Object.values(AlertSeverity);
    const statuses = Object.values(AlertStatus);

    for (let i = 0; i < count; i++) {
      alerts.push({
        id: `alert-${i + 1}`,
        type: fraudTypes[Math.floor(Math.random() * fraudTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        userId: `user-${Math.floor(Math.random() * 100)}`,
        description: `Fraud alert description ${i + 1}`,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        riskScore: Math.floor(Math.random() * 100),
        confidence: Math.random(),
        triggers: [`trigger-${i + 1}`, `trigger-${i + 2}`],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    return alerts;
  }

  private generateMockIncidents(count: number): IncidentResponse[] {
    const incidents: IncidentResponse[] = [];

    const severities = Object.values(IncidentSeverity);
    const statuses = Object.values(IncidentStatus);

    for (let i = 0; i < count; i++) {
      const createdAt = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      incidents.push({
        id: `incident-${i + 1}`,
        title: `Security Incident ${i + 1}`,
        description: `Description for incident ${i + 1}`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt,
        updatedAt: new Date(),
        timeline: [],
        affectedUsers: [`user-${i + 1}`, `user-${i + 2}`],
        actions: [],
        tags: ["security", "urgent"],
      });
    }

    return incidents;
  }

  private getMockUserRiskProfile(userId: string): UserRiskProfile {
    return {
      userId,
      riskScore: Math.floor(Math.random() * 100),
      riskLevel: Object.values(RiskLevel)[Math.floor(Math.random() * 6)],
      factors: [
        {
          type: "login_frequency",
          weight: 0.3,
          value: "high",
          description: "High login frequency",
        },
        {
          type: "location_variance",
          weight: 0.4,
          value: "medium",
          description: "Medium location variance",
        },
      ],
      behaviorAnalysis: {
        loginPatterns: [
          {
            timeOfDay: [9, 17],
            daysOfWeek: [1, 2, 3, 4, 5],
            frequency: 0.8,
            locations: ["US"],
            devices: ["desktop"],
          },
        ],
        deviceFingerprints: [],
        locationHistory: [],
        transactionPatterns: [
          {
            averageAmount: 100,
            frequency: 0.5,
            timePatterns: [12, 18],
            merchantTypes: ["retail"],
            anomalyScore: 0.2,
          },
        ],
        anomalies: [],
      },
      lastAssessed: new Date(),
      flags: [],
    };
  }

  private getMockCompliance(): ComplianceCheck[] {
    return [
      {
        id: "pci-dss",
        standard: ComplianceStandard.PCI_DSS,
        status: ComplianceStatus.COMPLIANT,
        score: 95,
        lastChecked: new Date(),
        findings: [],
        recommendations: [],
      },
      {
        id: "gdpr",
        standard: ComplianceStandard.GDPR,
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        score: 78,
        lastChecked: new Date(),
        findings: [],
        recommendations: [
          "Update privacy policy",
          "Implement data retention policy",
        ],
      },
    ];
  }

  private getMockAnalytics() {
    return {
      threatTrends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        count: Math.floor(Math.random() * 20),
        type: "brute_force",
      })),
      riskDistribution: [
        { level: "low", count: 150 },
        { level: "medium", count: 80 },
        { level: "high", count: 25 },
        { level: "critical", count: 5 },
      ],
      incidentMetrics: [
        { status: "open", count: 5 },
        { status: "investigating", count: 8 },
        { status: "resolved", count: 45 },
        { status: "closed", count: 12 },
      ],
      complianceScores: [
        { standard: "PCI DSS", score: 95 },
        { standard: "GDPR", score: 78 },
        { standard: "SOX", score: 88 },
        { standard: "ISO 27001", score: 92 },
      ],
    };
  }

  private generateMockThreat(): SecurityThreat {
    const threatTypes = Object.values(ThreatType);
    const severities = Object.values(ThreatSeverity);

    return {
      id: `threat-${Date.now()}`,
      type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: "Real-time threat detected",
      source: "Automated Detection",
      timestamp: new Date(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: ThreatStatus.ACTIVE,
      riskScore: Math.floor(Math.random() * 100),
      metadata: { realTime: true },
    };
  }
}

export const securityService = new SecurityService();
