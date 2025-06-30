import { type NextRequest, NextResponse } from "next/server"
import type { HealthPrediction, RiskFactor } from "@/types/ai-integration"

export async function POST(request: NextRequest) {
  try {
    const { integrationId, currentMetrics, historicalData, timeframe = "24h" } = await request.json()

    if (!integrationId || !currentMetrics) {
      return NextResponse.json({ error: "Integration ID and current metrics are required" }, { status: 400 })
    }

    // Calculate current health score
    const currentHealth = calculateHealthScore(currentMetrics)

    // Analyze trends from historical data
    const trends = analyzeHealthTrends(historicalData || [])

    // Identify risk factors
    const riskFactors = identifyRiskFactors(currentMetrics, trends)

    // Predict future health based on trends and risk factors
    const predictedHealth = predictFutureHealth(currentHealth, trends, riskFactors, timeframe)

    // Generate recommendations
    const recommendations = generateHealthRecommendations(riskFactors, trends)

    // Calculate prediction confidence
    const confidence = calculatePredictionConfidence(historicalData?.length || 0, riskFactors)

    const prediction: HealthPrediction = {
      integrationId,
      currentHealth,
      predictedHealth,
      timeframe,
      riskFactors,
      recommendations,
      confidence,
    }

    const response = {
      prediction,
      trends,
      analysis: {
        healthTrend: trends.healthTrend || "stable",
        primaryRisks: riskFactors.filter((r) => r.impact > 0.7).map((r) => r.factor),
        criticalFactors: riskFactors.filter((r) => r.likelihood > 0.8 && r.impact > 0.6),
        improvementAreas: recommendations.filter((r) => r.includes("improve") || r.includes("optimize")),
      },
      predictedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Health prediction error:", error)
    return NextResponse.json({ error: "Failed to predict health" }, { status: 500 })
  }
}

function calculateHealthScore(metrics: any): number {
  const weights = {
    errorRate: 0.3,
    responseTime: 0.25,
    throughput: 0.2,
    availability: 0.25,
  }

  const errorScore = Math.max(0, 1 - (metrics.errorRate || 0) * 10)
  const responseScore = Math.max(0, 1 - Math.min(1, (metrics.responseTime || 0) / 5000))
  const throughputScore = Math.min(1, (metrics.throughput || 0) / 1000)
  const availabilityScore = metrics.availability || 0.95

  return (
    errorScore * weights.errorRate +
    responseScore * weights.responseTime +
    throughputScore * weights.throughput +
    availabilityScore * weights.availability
  )
}

function analyzeHealthTrends(historicalData: any[]): any {
  if (historicalData.length < 3) {
    return { healthTrend: "insufficient_data", confidence: 0.1 }
  }

  const healthScores = historicalData.map((data) => calculateHealthScore(data))
  const recentScores = healthScores.slice(-5)
  const olderScores = healthScores.slice(0, -5)

  const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length
  const olderAvg =
    olderScores.length > 0 ? olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length : recentAvg

  const trendDirection =
    recentAvg > olderAvg + 0.05 ? "improving" : recentAvg < olderAvg - 0.05 ? "declining" : "stable"

  return {
    healthTrend: trendDirection,
    currentAverage: recentAvg,
    previousAverage: olderAvg,
    trendStrength: Math.abs(recentAvg - olderAvg),
    volatility: calculateVolatility(healthScores),
    confidence: Math.min(1, historicalData.length / 20),
  }
}

function identifyRiskFactors(currentMetrics: any, trends: any): RiskFactor[] {
  const riskFactors: RiskFactor[] = []

  // High error rate risk
  if (currentMetrics.errorRate > 0.05) {
    riskFactors.push({
      factor: "High Error Rate",
      impact: Math.min(1, currentMetrics.errorRate * 10),
      likelihood: 0.8,
      description: `Current error rate of ${(currentMetrics.errorRate * 100).toFixed(2)}% is above acceptable threshold`,
    })
  }

  // Slow response time risk
  if (currentMetrics.responseTime > 2000) {
    riskFactors.push({
      factor: "Slow Response Time",
      impact: Math.min(1, currentMetrics.responseTime / 5000),
      likelihood: 0.7,
      description: `Response time of ${currentMetrics.responseTime}ms may impact user experience`,
    })
  }

  // Declining trend risk
  if (trends.healthTrend === "declining") {
    riskFactors.push({
      factor: "Declining Performance Trend",
      impact: trends.trendStrength,
      likelihood: trends.confidence,
      description: "Performance metrics show a declining trend over time",
    })
  }

  // High volatility risk
  if (trends.volatility > 0.2) {
    riskFactors.push({
      factor: "High Performance Volatility",
      impact: trends.volatility,
      likelihood: 0.6,
      description: "Performance metrics show high variability indicating instability",
    })
  }

  // Low throughput risk
  if (currentMetrics.throughput < 100) {
    riskFactors.push({
      factor: "Low Throughput",
      impact: 0.5,
      likelihood: 0.6,
      description: "Current throughput may not meet demand during peak times",
    })
  }

  return riskFactors.sort((a, b) => b.impact * b.likelihood - a.impact * a.likelihood)
}

function predictFutureHealth(currentHealth: number, trends: any, riskFactors: RiskFactor[], timeframe: string): number {
  let prediction = currentHealth

  // Apply trend impact
  const timeMultiplier = timeframe === "1h" ? 0.1 : timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : 1

  if (trends.healthTrend === "declining") {
    prediction -= trends.trendStrength * timeMultiplier * 0.5
  } else if (trends.healthTrend === "improving") {
    prediction += trends.trendStrength * timeMultiplier * 0.3
  }

  // Apply risk factor impact
  const totalRisk = riskFactors.reduce((sum, risk) => sum + risk.impact * risk.likelihood, 0)
  prediction -= totalRisk * 0.2

  // Apply volatility impact
  if (trends.volatility > 0.2) {
    prediction -= trends.volatility * 0.1
  }

  return Math.max(0, Math.min(1, prediction))
}

function generateHealthRecommendations(riskFactors: RiskFactor[], trends: any): string[] {
  const recommendations: string[] = []

  riskFactors.forEach((risk) => {
    switch (risk.factor) {
      case "High Error Rate":
        recommendations.push("Review error logs and implement better error handling")
        recommendations.push("Add circuit breakers to prevent cascade failures")
        break
      case "Slow Response Time":
        recommendations.push("Optimize database queries and add caching")
        recommendations.push("Consider scaling resources or load balancing")
        break
      case "Declining Performance Trend":
        recommendations.push("Investigate root cause of performance degradation")
        recommendations.push("Implement proactive monitoring and alerting")
        break
      case "High Performance Volatility":
        recommendations.push("Stabilize system resources and configuration")
        recommendations.push("Implement auto-scaling based on demand")
        break
      case "Low Throughput":
        recommendations.push("Optimize processing pipeline for better throughput")
        recommendations.push("Consider parallel processing or batch optimization")
        break
    }
  })

  if (trends.healthTrend === "declining") {
    recommendations.push("Schedule immediate system health review")
    recommendations.push("Consider temporary load reduction during peak times")
  }

  return [...new Set(recommendations)] // Remove duplicates
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length

  return Math.sqrt(variance)
}

function calculatePredictionConfidence(dataPoints: number, riskFactors: RiskFactor[]): number {
  let confidence = 0.5 // Base confidence

  // More data points increase confidence
  confidence += Math.min(0.4, dataPoints / 50)

  // Clear risk factors increase confidence in prediction
  const highImpactRisks = riskFactors.filter((r) => r.impact > 0.7).length
  confidence += Math.min(0.2, highImpactRisks * 0.05)

  return Math.min(1, confidence)
}

export async function GET() {
  return NextResponse.json({
    message: "AI Health Prediction API",
    endpoints: {
      "POST /api/ai/predict-health": "Predict integration health and identify risk factors",
    },
  })
}
