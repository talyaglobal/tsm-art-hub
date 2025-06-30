interface AnomalyResult {
  isAnomaly: boolean
  score: number
  confidence: number
  method: string
  explanation: string
  metadata?: Record<string, any>
}

interface AnomalyDetectionConfig {
  methods: ("statistical" | "isolation_forest" | "clustering" | "ai_based")[]
  sensitivity: "low" | "medium" | "high"
  threshold: number
  includeExplanations: boolean
}

interface DataPoint {
  id: string
  features: Record<string, number>
  timestamp?: Date
  metadata?: Record<string, any>
}

interface AnomalyReport {
  totalPoints: number
  anomaliesDetected: number
  anomalyRate: number
  results: Array<{
    dataPoint: DataPoint
    anomalyResults: AnomalyResult[]
    overallScore: number
    isAnomaly: boolean
  }>
  summary: {
    byMethod: Record<string, number>
    bySeverity: Record<string, number>
    topAnomalies: Array<{
      id: string
      score: number
      explanation: string
    }>
  }
}

export class AnomalyDetectionService {
  private readonly defaultConfig: AnomalyDetectionConfig = {
    methods: ["statistical", "isolation_forest", "clustering"],
    sensitivity: "medium",
    threshold: 0.7,
    includeExplanations: true,
  }

  async detectAnomalies(dataPoints: DataPoint[], config: Partial<AnomalyDetectionConfig> = {}): Promise<AnomalyReport> {
    const finalConfig = { ...this.defaultConfig, ...config }

    if (!dataPoints || dataPoints.length === 0) {
      throw new Error("No data points provided for anomaly detection")
    }

    const results: AnomalyReport["results"] = []
    const methodCounts: Record<string, number> = {}
    const severityCounts: Record<string, number> = {}

    for (const dataPoint of dataPoints) {
      const anomalyResults: AnomalyResult[] = []

      // Apply each detection method
      for (const method of finalConfig.methods) {
        const result = await this.applyDetectionMethod(method, dataPoint, dataPoints, finalConfig)
        anomalyResults.push(result)

        if (result.isAnomaly) {
          methodCounts[method] = (methodCounts[method] || 0) + 1
        }
      }

      // Calculate overall anomaly score
      const overallScore = this.calculateOverallScore(anomalyResults)
      const isAnomaly = overallScore >= finalConfig.threshold

      if (isAnomaly) {
        const severity = this.determineSeverity(overallScore)
        severityCounts[severity] = (severityCounts[severity] || 0) + 1
      }

      results.push({
        dataPoint,
        anomalyResults,
        overallScore,
        isAnomaly,
      })
    }

    // Generate summary
    const anomalies = results.filter((r) => r.isAnomaly)
    const topAnomalies = anomalies
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10)
      .map((r) => ({
        id: r.dataPoint.id,
        score: r.overallScore,
        explanation: this.generateExplanation(r.anomalyResults),
      }))

    return {
      totalPoints: dataPoints.length,
      anomaliesDetected: anomalies.length,
      anomalyRate: anomalies.length / dataPoints.length,
      results,
      summary: {
        byMethod: methodCounts,
        bySeverity: severityCounts,
        topAnomalies,
      },
    }
  }

  async detectRealTimeAnomaly(
    dataPoint: DataPoint,
    historicalData: DataPoint[],
    config: Partial<AnomalyDetectionConfig> = {},
  ): Promise<AnomalyResult[]> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const results: AnomalyResult[] = []

    for (const method of finalConfig.methods) {
      const result = await this.applyDetectionMethod(method, dataPoint, historicalData, finalConfig)
      results.push(result)
    }

    return results
  }

  private async applyDetectionMethod(
    method: string,
    dataPoint: DataPoint,
    allDataPoints: DataPoint[],
    config: AnomalyDetectionConfig,
  ): Promise<AnomalyResult> {
    switch (method) {
      case "statistical":
        return this.statisticalDetection(dataPoint, allDataPoints, config)
      case "isolation_forest":
        return this.isolationForestDetection(dataPoint, allDataPoints, config)
      case "clustering":
        return this.clusteringDetection(dataPoint, allDataPoints, config)
      case "ai_based":
        return this.aiBasedDetection(dataPoint, allDataPoints, config)
      default:
        throw new Error(`Unknown detection method: ${method}`)
    }
  }

  private statisticalDetection(
    dataPoint: DataPoint,
    allDataPoints: DataPoint[],
    config: AnomalyDetectionConfig,
  ): AnomalyResult {
    const features = Object.keys(dataPoint.features)
    let totalAnomalyScore = 0
    const featureScores: Record<string, number> = {}

    for (const feature of features) {
      const values = allDataPoints.map((dp) => dp.features[feature]).filter((v) => v != null)
      const currentValue = dataPoint.features[feature]

      if (values.length < 2) {
        featureScores[feature] = 0
        continue
      }

      // Calculate z-score
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)

      if (stdDev === 0) {
        featureScores[feature] = currentValue === mean ? 0 : 1
      } else {
        const zScore = Math.abs((currentValue - mean) / stdDev)
        featureScores[feature] = Math.min(zScore / 3, 1) // Normalize to 0-1
      }

      totalAnomalyScore += featureScores[feature]
    }

    const averageScore = totalAnomalyScore / features.length
    const threshold = this.getSensitivityThreshold(config.sensitivity)
    const isAnomaly = averageScore > threshold

    return {
      isAnomaly,
      score: averageScore,
      confidence: this.calculateConfidence(averageScore, threshold),
      method: "statistical",
      explanation: config.includeExplanations ? this.generateStatisticalExplanation(featureScores, threshold) : "",
      metadata: { featureScores, threshold },
    }
  }

  private isolationForestDetection(
    dataPoint: DataPoint,
    allDataPoints: DataPoint[],
    config: AnomalyDetectionConfig,
  ): AnomalyResult {
    // Simplified isolation forest implementation
    const features = Object.keys(dataPoint.features)
    const numTrees = 100
    const subsampleSize = Math.min(256, allDataPoints.length)

    let totalPathLength = 0

    for (let tree = 0; tree < numTrees; tree++) {
      // Create random subsample
      const subsample = this.randomSample(allDataPoints, subsampleSize)
      const pathLength = this.calculateIsolationPath(dataPoint, subsample, features, 0, Math.log2(subsampleSize))
      totalPathLength += pathLength
    }

    const averagePathLength = totalPathLength / numTrees
    const expectedPathLength = this.expectedPathLength(subsampleSize)

    // Anomaly score: closer to 1 means more anomalous
    const anomalyScore = Math.pow(2, -averagePathLength / expectedPathLength)
    const threshold = this.getSensitivityThreshold(config.sensitivity)
    const isAnomaly = anomalyScore > threshold

    return {
      isAnomaly,
      score: anomalyScore,
      confidence: this.calculateConfidence(anomalyScore, threshold),
      method: "isolation_forest",
      explanation: config.includeExplanations
        ? `Isolation path length: ${averagePathLength.toFixed(2)} (expected: ${expectedPathLength.toFixed(2)})`
        : "",
      metadata: { averagePathLength, expectedPathLength },
    }
  }

  private clusteringDetection(
    dataPoint: DataPoint,
    allDataPoints: DataPoint[],
    config: AnomalyDetectionConfig,
  ): AnomalyResult {
    const features = Object.keys(dataPoint.features)
    const k = Math.min(5, Math.floor(Math.sqrt(allDataPoints.length)))

    // Simple k-means clustering
    const clusters = this.performKMeans(allDataPoints, k, features)

    // Find distance to nearest cluster center
    let minDistance = Number.POSITIVE_INFINITY
    let nearestCluster = 0

    for (let i = 0; i < clusters.length; i++) {
      const distance = this.euclideanDistance(dataPoint.features, clusters[i].center, features)
      if (distance < minDistance) {
        minDistance = distance
        nearestCluster = i
      }
    }

    // Calculate anomaly score based on distance to cluster
    const clusterRadius = this.calculateClusterRadius(clusters[nearestCluster], features)
    const anomalyScore = Math.min(minDistance / (clusterRadius || 1), 1)
    const threshold = this.getSensitivityThreshold(config.sensitivity)
    const isAnomaly = anomalyScore > threshold

    return {
      isAnomaly,
      score: anomalyScore,
      confidence: this.calculateConfidence(anomalyScore, threshold),
      method: "clustering",
      explanation: config.includeExplanations
        ? `Distance to nearest cluster: ${minDistance.toFixed(2)} (cluster radius: ${clusterRadius.toFixed(2)})`
        : "",
      metadata: { minDistance, clusterRadius, nearestCluster },
    }
  }

  private async aiBasedDetection(
    dataPoint: DataPoint,
    allDataPoints: DataPoint[],
    config: AnomalyDetectionConfig,
  ): Promise<AnomalyResult> {
    // AI-based detection using pattern recognition
    const features = Object.keys(dataPoint.features)
    const patterns = this.extractPatterns(allDataPoints, features)

    let anomalyScore = 0
    const patternMatches: Record<string, number> = {}

    for (const pattern of patterns) {
      const match = this.matchPattern(dataPoint, pattern)
      patternMatches[pattern.id] = match
      anomalyScore += (1 - match) * pattern.weight
    }

    anomalyScore = Math.min(anomalyScore / patterns.length, 1)
    const threshold = this.getSensitivityThreshold(config.sensitivity)
    const isAnomaly = anomalyScore > threshold

    return {
      isAnomaly,
      score: anomalyScore,
      confidence: this.calculateConfidence(anomalyScore, threshold),
      method: "ai_based",
      explanation: config.includeExplanations ? `Pattern deviation score: ${anomalyScore.toFixed(2)}` : "",
      metadata: { patternMatches },
    }
  }

  private randomSample<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, size)
  }

  private calculateIsolationPath(
    dataPoint: DataPoint,
    data: DataPoint[],
    features: string[],
    depth: number,
    maxDepth: number,
  ): number {
    if (depth >= maxDepth || data.length <= 1) {
      return depth + this.expectedPathLength(data.length)
    }

    // Random feature selection
    const feature = features[Math.floor(Math.random() * features.length)]
    const values = data.map((dp) => dp.features[feature])
    const min = Math.min(...values)
    const max = Math.max(...values)

    if (min === max) return depth

    // Random split point
    const splitPoint = min + Math.random() * (max - min)
    const currentValue = dataPoint.features[feature]

    if (currentValue < splitPoint) {
      const leftData = data.filter((dp) => dp.features[feature] < splitPoint)
      return this.calculateIsolationPath(dataPoint, leftData, features, depth + 1, maxDepth)
    } else {
      const rightData = data.filter((dp) => dp.features[feature] >= splitPoint)
      return this.calculateIsolationPath(dataPoint, rightData, features, depth + 1, maxDepth)
    }
  }

  private expectedPathLength(n: number): number {
    if (n <= 1) return 0
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n
  }

  private performKMeans(
    dataPoints: DataPoint[],
    k: number,
    features: string[],
  ): Array<{ center: Record<string, number>; points: DataPoint[] }> {
    // Initialize random centroids
    const clusters: Array<{ center: Record<string, number>; points: DataPoint[] }> = []

    for (let i = 0; i < k; i++) {
      const center: Record<string, number> = {}
      for (const feature of features) {
        const values = dataPoints.map((dp) => dp.features[feature])
        const min = Math.min(...values)
        const max = Math.max(...values)
        center[feature] = min + Math.random() * (max - min)
      }
      clusters.push({ center, points: [] })
    }

    // Iterate until convergence
    for (let iteration = 0; iteration < 100; iteration++) {
      // Clear cluster assignments
      clusters.forEach((cluster) => (cluster.points = []))

      // Assign points to nearest cluster
      for (const point of dataPoints) {
        let minDistance = Number.POSITIVE_INFINITY
        let nearestCluster = 0

        for (let i = 0; i < clusters.length; i++) {
          const distance = this.euclideanDistance(point.features, clusters[i].center, features)
          if (distance < minDistance) {
            minDistance = distance
            nearestCluster = i
          }
        }

        clusters[nearestCluster].points.push(point)
      }

      // Update centroids
      let converged = true
      for (const cluster of clusters) {
        if (cluster.points.length === 0) continue

        const newCenter: Record<string, number> = {}
        for (const feature of features) {
          const sum = cluster.points.reduce((acc, point) => acc + point.features[feature], 0)
          newCenter[feature] = sum / cluster.points.length
        }

        // Check for convergence
        const centerDistance = this.euclideanDistance(cluster.center, newCenter, features)
        if (centerDistance > 0.001) {
          converged = false
        }

        cluster.center = newCenter
      }

      if (converged) break
    }

    return clusters
  }

  private euclideanDistance(
    point1: Record<string, number>,
    point2: Record<string, number>,
    features: string[],
  ): number {
    let sum = 0
    for (const feature of features) {
      const diff = (point1[feature] || 0) - (point2[feature] || 0)
      sum += diff * diff
    }
    return Math.sqrt(sum)
  }

  private calculateClusterRadius(
    cluster: { center: Record<string, number>; points: DataPoint[] },
    features: string[],
  ): number {
    if (cluster.points.length === 0) return 0

    const distances = cluster.points.map((point) => this.euclideanDistance(point.features, cluster.center, features))

    return Math.max(...distances)
  }

  private extractPatterns(
    dataPoints: DataPoint[],
    features: string[],
  ): Array<{
    id: string
    weight: number
    conditions: Record<string, { min: number; max: number }>
  }> {
    const patterns: Array<{
      id: string
      weight: number
      conditions: Record<string, { min: number; max: number }>
    }> = []

    // Extract common value ranges as patterns
    for (const feature of features) {
      const values = dataPoints.map((dp) => dp.features[feature]).filter((v) => v != null)
      if (values.length === 0) continue

      const sorted = values.sort((a, b) => a - b)
      const q1 = sorted[Math.floor(sorted.length * 0.25)]
      const q3 = sorted[Math.floor(sorted.length * 0.75)]

      patterns.push({
        id: `${feature}_normal_range`,
        weight: 1 / features.length,
        conditions: {
          [feature]: { min: q1, max: q3 },
        },
      })
    }

    return patterns
  }

  private matchPattern(
    dataPoint: DataPoint,
    pattern: { conditions: Record<string, { min: number; max: number }> },
  ): number {
    let matches = 0
    let total = 0

    for (const [feature, range] of Object.entries(pattern.conditions)) {
      total++
      const value = dataPoint.features[feature]
      if (value != null && value >= range.min && value <= range.max) {
        matches++
      }
    }

    return total > 0 ? matches / total : 0
  }

  private getSensitivityThreshold(sensitivity: "low" | "medium" | "high"): number {
    switch (sensitivity) {
      case "low":
        return 0.8
      case "medium":
        return 0.6
      case "high":
        return 0.4
      default:
        return 0.6
    }
  }

  private calculateConfidence(score: number, threshold: number): number {
    if (score > threshold) {
      return Math.min((score - threshold) / (1 - threshold), 1)
    } else {
      return Math.max(1 - (threshold - score) / threshold, 0)
    }
  }

  private calculateOverallScore(results: AnomalyResult[]): number {
    if (results.length === 0) return 0

    // Weighted average based on method confidence
    let totalWeight = 0
    let weightedSum = 0

    for (const result of results) {
      const weight = result.confidence
      weightedSum += result.score * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  private determineSeverity(score: number): string {
    if (score >= 0.8) return "high"
    if (score >= 0.6) return "medium"
    return "low"
  }

  private generateExplanation(results: AnomalyResult[]): string {
    const anomalousResults = results.filter((r) => r.isAnomaly)
    if (anomalousResults.length === 0) return "No anomalies detected"

    const methods = anomalousResults.map((r) => r.method).join(", ")
    const maxScore = Math.max(...anomalousResults.map((r) => r.score))

    return `Anomaly detected by ${methods} (max score: ${maxScore.toFixed(2)})`
  }

  private generateStatisticalExplanation(featureScores: Record<string, number>, threshold: number): string {
    const anomalousFeatures = Object.entries(featureScores)
      .filter(([_, score]) => score > threshold)
      .map(([feature, score]) => `${feature}: ${score.toFixed(2)}`)

    if (anomalousFeatures.length === 0) {
      return "All features within normal statistical range"
    }

    return `Anomalous features: ${anomalousFeatures.join(", ")}`
  }
}
