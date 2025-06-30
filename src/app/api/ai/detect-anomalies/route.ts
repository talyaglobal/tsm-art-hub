import { type NextRequest, NextResponse } from "next/server"
import { AnomalyDetectionService } from "@/lib/ai/anomaly-detection"

const anomalyService = new AnomalyDetectionService()

export async function POST(request: NextRequest) {
  try {
    const { integrationId, currentMetrics, historicalData, timeRange } = await request.json()

    if (!integrationId || !currentMetrics) {
      return NextResponse.json({ error: "Integration ID and current metrics are required" }, { status: 400 })
    }

    // Detect anomalies
    const anomalies = await anomalyService.detectAnomalies(integrationId, currentMetrics, historicalData || [])

    // Generate anomaly report
    const report = await anomalyService.generateAnomalyReport(anomalies)

    // Calculate risk score
    const riskScore = anomalies.reduce((score, anomaly) => {
      const severityWeights = { critical: 4, high: 3, medium: 2, low: 1 }
      return score + (severityWeights[anomaly.severity] || 0)
    }, 0)

    // Group anomalies by type
    const anomaliesByType = anomalies.reduce(
      (groups, anomaly) => {
        if (!groups[anomaly.type]) groups[anomaly.type] = []
        groups[anomaly.type].push(anomaly)
        return groups
      },
      {} as Record<string, any[]>,
    )

    // Generate recommendations
    const recommendations = []
    if (anomalies.some((a) => a.type === "volume")) {
      recommendations.push({
        type: "monitoring",
        priority: "high",
        action: "Set up volume-based alerts",
        description: "Configure alerts for unusual data volume changes",
      })
    }

    if (anomalies.some((a) => a.type === "performance")) {
      recommendations.push({
        type: "optimization",
        priority: "medium",
        action: "Review system resources",
        description: "Check CPU, memory, and network performance",
      })
    }

    if (anomalies.some((a) => a.type === "data_quality")) {
      recommendations.push({
        type: "data_quality",
        priority: "high",
        action: "Implement data validation",
        description: "Add stricter data validation rules",
      })
    }

    const response = {
      integrationId,
      anomalies,
      anomaliesByType,
      riskScore,
      riskLevel: riskScore > 10 ? "critical" : riskScore > 6 ? "high" : riskScore > 3 ? "medium" : "low",
      report,
      recommendations,
      detectedAt: new Date().toISOString(),
      summary: {
        total: anomalies.length,
        critical: anomalies.filter((a) => a.severity === "critical").length,
        high: anomalies.filter((a) => a.severity === "high").length,
        medium: anomalies.filter((a) => a.severity === "medium").length,
        low: anomalies.filter((a) => a.severity === "low").length,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Anomaly detection error:", error)
    return NextResponse.json({ error: "Failed to detect anomalies" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Anomaly Detection API",
    endpoints: {
      "POST /api/ai/detect-anomalies": "Detect anomalies in integration data and performance",
    },
  })
}
