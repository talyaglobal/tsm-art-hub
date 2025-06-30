interface ProcessingResult {
  intent: string
  entities: Array<{
    type: string
    value: string
    confidence: number
    start: number
    end: number
  }>
  sentiment: {
    score: number
    label: "positive" | "negative" | "neutral"
    confidence: number
  }
  keywords: string[]
  summary?: string
}

interface IntentPattern {
  intent: string
  patterns: string[]
  entities: string[]
  confidence: number
}

export class NaturalLanguageProcessor {
  private intents: Map<string, IntentPattern> = new Map()
  private stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ])

  constructor() {
    this.initializeDefaultIntents()
  }

  private initializeDefaultIntents(): void {
    this.addIntent({
      intent: "create_integration",
      patterns: ["create integration", "add integration", "new integration", "setup integration", "connect to"],
      entities: ["integration_type", "service_name"],
      confidence: 0.8,
    })

    this.addIntent({
      intent: "query_data",
      patterns: ["show me", "get data", "fetch records", "retrieve information", "find data"],
      entities: ["data_source", "filter_criteria"],
      confidence: 0.8,
    })

    this.addIntent({
      intent: "generate_report",
      patterns: ["generate report", "create report", "build dashboard", "show analytics", "create visualization"],
      entities: ["report_type", "time_period"],
      confidence: 0.8,
    })
  }

  addIntent(pattern: IntentPattern): void {
    this.intents.set(pattern.intent, pattern)
  }

  async processText(text: string): Promise<ProcessingResult> {
    const normalizedText = this.normalizeText(text)

    const intent = this.detectIntent(normalizedText)
    const entities = this.extractEntities(normalizedText, intent)
    const sentiment = this.analyzeSentiment(normalizedText)
    const keywords = this.extractKeywords(normalizedText)
    const summary = this.generateSummary(normalizedText)

    return {
      intent,
      entities,
      sentiment,
      keywords,
      summary,
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
  }

  private detectIntent(text: string): string {
    let bestMatch = "unknown"
    let highestScore = 0

    for (const [intentName, pattern] of this.intents) {
      const score = this.calculateIntentScore(text, pattern)
      if (score > highestScore && score > 0.5) {
        highestScore = score
        bestMatch = intentName
      }
    }

    return bestMatch
  }

  private calculateIntentScore(text: string, pattern: IntentPattern): number {
    let totalScore = 0
    let matchCount = 0

    for (const patternText of pattern.patterns) {
      const patternWords = patternText.toLowerCase().split(" ")
      const textWords = text.split(" ")

      let patternMatches = 0
      for (const patternWord of patternWords) {
        if (textWords.includes(patternWord)) {
          patternMatches++
        }
      }

      const patternScore = patternMatches / patternWords.length
      if (patternScore > 0) {
        totalScore += patternScore
        matchCount++
      }
    }

    return matchCount > 0 ? (totalScore / matchCount) * pattern.confidence : 0
  }

  private extractEntities(text: string, intent: string): ProcessingResult["entities"] {
    const entities: ProcessingResult["entities"] = []
    const words = text.split(" ")

    // Simple entity extraction based on patterns
    const entityPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      date: /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
      number: /\b\d+\.?\d*\b/g,
      url: /https?:\/\/[^\s]+/g,
    }

    for (const [entityType, pattern] of Object.entries(entityPatterns)) {
      const matches = text.match(pattern)
      if (matches) {
        for (const match of matches) {
          const start = text.indexOf(match)
          entities.push({
            type: entityType,
            value: match,
            confidence: 0.9,
            start,
            end: start + match.length,
          })
        }
      }
    }

    // Extract named entities based on context
    this.extractContextualEntities(text, intent, entities)

    return entities
  }

  private extractContextualEntities(text: string, intent: string, entities: ProcessingResult["entities"]): void {
    const words = text.split(" ")

    // Integration-specific entities
    if (intent === "create_integration") {
      const integrationTypes = ["database", "api", "webhook", "file", "salesforce", "hubspot", "slack"]
      for (const type of integrationTypes) {
        if (text.includes(type)) {
          const start = text.indexOf(type)
          entities.push({
            type: "integration_type",
            value: type,
            confidence: 0.8,
            start,
            end: start + type.length,
          })
        }
      }
    }

    // Data query entities
    if (intent === "query_data") {
      const dataTypes = ["users", "orders", "products", "customers", "transactions", "logs"]
      for (const type of dataTypes) {
        if (text.includes(type)) {
          const start = text.indexOf(type)
          entities.push({
            type: "data_source",
            value: type,
            confidence: 0.8,
            start,
            end: start + type.length,
          })
        }
      }
    }
  }

  private analyzeSentiment(text: string): ProcessingResult["sentiment"] {
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "love",
      "like",
      "happy",
      "pleased",
    ]
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "dislike",
      "angry",
      "frustrated",
      "disappointed",
      "sad",
    ]

    const words = text.split(" ")
    let positiveScore = 0
    let negativeScore = 0

    for (const word of words) {
      if (positiveWords.includes(word)) positiveScore++
      if (negativeWords.includes(word)) negativeScore++
    }

    const totalSentimentWords = positiveScore + negativeScore
    if (totalSentimentWords === 0) {
      return { score: 0, label: "neutral", confidence: 0.5 }
    }

    const score = (positiveScore - negativeScore) / totalSentimentWords
    const label = score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral"
    const confidence = Math.abs(score)

    return { score, label, confidence }
  }

  private extractKeywords(text: string): string[] {
    const words = text.split(" ")
    const keywords: string[] = []

    for (const word of words) {
      if (word.length > 3 && !this.stopWords.has(word)) {
        keywords.push(word)
      }
    }

    // Remove duplicates and return top keywords
    const uniqueKeywords = Array.from(new Set(keywords))
    return uniqueKeywords.slice(0, 10)
  }

  private generateSummary(text: string): string {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    if (sentences.length <= 2) {
      return text
    }

    // Simple extractive summarization - return first and most keyword-rich sentence
    const keywords = this.extractKeywords(text)
    let bestSentence = sentences[0]
    let maxKeywordCount = 0

    for (const sentence of sentences) {
      const sentenceKeywordCount = keywords.filter((keyword) => sentence.toLowerCase().includes(keyword)).length

      if (sentenceKeywordCount > maxKeywordCount) {
        maxKeywordCount = sentenceKeywordCount
        bestSentence = sentence
      }
    }

    return bestSentence.trim()
  }

  async generateResponse(intent: string, entities: ProcessingResult["entities"]): Promise<string> {
    switch (intent) {
      case "create_integration":
        const integrationType = entities.find((e) => e.type === "integration_type")?.value || "API"
        return `I can help you create a ${integrationType} integration. What service would you like to connect to?`

      case "query_data":
        const dataSource = entities.find((e) => e.type === "data_source")?.value || "your data"
        return `I'll help you query ${dataSource}. What specific information are you looking for?`

      case "generate_report":
        const reportType = entities.find((e) => e.type === "report_type")?.value || "analytics report"
        return `I can generate a ${reportType} for you. What time period would you like to analyze?`

      default:
        return "I understand you need help. Could you please provide more specific details about what you'd like to do?"
    }
  }

  getAvailableIntents(): string[] {
    return Array.from(this.intents.keys())
  }

  getIntentPatterns(intent: string): IntentPattern | undefined {
    return this.intents.get(intent)
  }
}

export const nlpProcessor = new NaturalLanguageProcessor()
