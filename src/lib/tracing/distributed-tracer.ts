interface Span {
  traceId: string
  spanId: string
  parentSpanId?: string
  operationName: string
  startTime: number
  endTime?: number
  duration?: number
  tags: Record<string, any>
  logs: Array<{
    timestamp: number
    fields: Record<string, any>
  }>
  status: "ok" | "error" | "timeout"
  baggage: Record<string, string>
}

interface TraceContext {
  traceId: string
  spanId: string
  baggage: Record<string, string>
}

export class DistributedTracer {
  private spans: Map<string, Span> = new Map()
  private activeSpans: Map<string, string> = new Map() // contextId -> spanId
  private samplingRate = 1.0
  private serviceName: string

  constructor(serviceName = "tsmarthub") {
    this.serviceName = serviceName
  }

  startSpan(
    operationName: string,
    options: {
      parentSpan?: Span
      tags?: Record<string, any>
      startTime?: number
    } = {},
  ): Span {
    const { parentSpan, tags = {}, startTime = Date.now() } = options

    const traceId = parentSpan?.traceId || this.generateTraceId()
    const spanId = this.generateSpanId()

    const span: Span = {
      traceId,
      spanId,
      parentSpanId: parentSpan?.spanId,
      operationName,
      startTime,
      tags: {
        "service.name": this.serviceName,
        "span.kind": "internal",
        ...tags,
      },
      logs: [],
      status: "ok",
      baggage: parentSpan?.baggage || {},
    }

    this.spans.set(spanId, span)
    return span
  }

  finishSpan(
    span: Span,
    options: {
      endTime?: number
      status?: "ok" | "error" | "timeout"
      error?: Error
    } = {},
  ): void {
    const { endTime = Date.now(), status = "ok", error } = options

    span.endTime = endTime
    span.duration = endTime - span.startTime
    span.status = status

    if (error) {
      span.tags["error"] = true
      span.tags["error.message"] = error.message
      span.tags["error.stack"] = error.stack
      this.logToSpan(span, {
        level: "error",
        message: error.message,
        stack: error.stack,
      })
    }

    // Send to tracing backend if sampling allows
    if (this.shouldSample()) {
      this.exportSpan(span)
    }
  }

  logToSpan(span: Span, fields: Record<string, any>): void {
    span.logs.push({
      timestamp: Date.now(),
      fields,
    })
  }

  setTag(span: Span, key: string, value: any): void {
    span.tags[key] = value
  }

  setBaggage(span: Span, key: string, value: string): void {
    span.baggage[key] = value
  }

  getBaggage(span: Span, key: string): string | undefined {
    return span.baggage[key]
  }

  inject(span: Span, format: "http_headers" | "text_map", carrier: Record<string, string>): void {
    switch (format) {
      case "http_headers":
        carrier["x-trace-id"] = span.traceId
        carrier["x-span-id"] = span.spanId

        // Inject baggage
        Object.entries(span.baggage).forEach(([key, value]) => {
          carrier[`x-baggage-${key}`] = value
        })
        break

      case "text_map":
        carrier["trace-id"] = span.traceId
        carrier["span-id"] = span.spanId

        Object.entries(span.baggage).forEach(([key, value]) => {
          carrier[`baggage-${key}`] = value
        })
        break
    }
  }

  extract(format: "http_headers" | "text_map", carrier: Record<string, string>): TraceContext | null {
    let traceId: string | undefined
    let spanId: string | undefined
    const baggage: Record<string, string> = {}

    switch (format) {
      case "http_headers":
        traceId = carrier["x-trace-id"]
        spanId = carrier["x-span-id"]

        Object.entries(carrier).forEach(([key, value]) => {
          if (key.startsWith("x-baggage-")) {
            const baggageKey = key.replace("x-baggage-", "")
            baggage[baggageKey] = value
          }
        })
        break

      case "text_map":
        traceId = carrier["trace-id"]
        spanId = carrier["span-id"]

        Object.entries(carrier).forEach(([key, value]) => {
          if (key.startsWith("baggage-")) {
            const baggageKey = key.replace("baggage-", "")
            baggage[baggageKey] = value
          }
        })
        break
    }

    if (!traceId || !spanId) {
      return null
    }

    return { traceId, spanId, baggage }
  }

  async withSpan<T>(
    operationName: string,
    callback: (span: Span) => Promise<T>,
    options: {
      parentSpan?: Span
      tags?: Record<string, any>
    } = {},
  ): Promise<T> {
    const span = this.startSpan(operationName, options)

    try {
      const result = await callback(span)
      this.finishSpan(span, { status: "ok" })
      return result
    } catch (error) {
      this.finishSpan(span, {
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      })
      throw error
    }
  }

  getTrace(traceId: string): Span[] {
    return Array.from(this.spans.values())
      .filter((span) => span.traceId === traceId)
      .sort((a, b) => a.startTime - b.startTime)
  }

  getSpan(spanId: string): Span | undefined {
    return this.spans.get(spanId)
  }

  private generateTraceId(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  private generateSpanId(): string {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate
  }

  private async exportSpan(span: Span): Promise<void> {
    // Export span to tracing backend (Jaeger, Zipkin, etc.)
    // This would typically send to a collector endpoint

    if (process.env.JAEGER_ENDPOINT) {
      try {
        await this.sendToJaeger(span)
      } catch (error) {
        console.warn("Failed to export span to Jaeger:", error)
      }
    }

    // Also log for development
    if (process.env.NODE_ENV === "development") {
      console.log("Trace Span:", {
        traceId: span.traceId,
        spanId: span.spanId,
        operationName: span.operationName,
        duration: span.duration,
        status: span.status,
        tags: span.tags,
      })
    }
  }

  private async sendToJaeger(span: Span): Promise<void> {
    const jaegerSpan = {
      traceID: span.traceId,
      spanID: span.spanId,
      parentSpanID: span.parentSpanId,
      operationName: span.operationName,
      startTime: span.startTime * 1000, // Jaeger expects microseconds
      duration: (span.duration || 0) * 1000,
      tags: Object.entries(span.tags).map(([key, value]) => ({
        key,
        type: typeof value === "string" ? "string" : "number",
        value: String(value),
      })),
      logs: span.logs.map((log) => ({
        timestamp: log.timestamp * 1000,
        fields: Object.entries(log.fields).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      })),
      process: {
        serviceName: this.serviceName,
        tags: [
          { key: "hostname", value: process.env.HOSTNAME || "unknown" },
          { key: "version", value: process.env.VERSION || "1.0.0" },
        ],
      },
    }

    const response = await fetch(`${process.env.JAEGER_ENDPOINT}/api/traces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            traceID: span.traceId,
            spans: [jaegerSpan],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Jaeger export failed: ${response.statusText}`)
    }
  }

  // Middleware for automatic HTTP request tracing
  createHTTPMiddleware() {
    return (req: any, res: any, next: any) => {
      const traceContext = this.extract("http_headers", req.headers)
      const parentSpan = traceContext
        ? ({
            traceId: traceContext.traceId,
            spanId: traceContext.spanId,
            baggage: traceContext.baggage,
          } as Span)
        : undefined

      const span = this.startSpan(`${req.method} ${req.path}`, {
        parentSpan,
        tags: {
          "http.method": req.method,
          "http.url": req.url,
          "http.user_agent": req.headers["user-agent"],
          "span.kind": "server",
        },
      })

      // Add trace context to request
      req.span = span
      req.traceId = span.traceId

      // Finish span when response ends
      res.on("finish", () => {
        this.setTag(span, "http.status_code", res.statusCode)

        const status = res.statusCode >= 400 ? "error" : "ok"
        this.finishSpan(span, { status })
      })

      next()
    }
  }

  // Utility for tracing database queries
  async traceQuery<T>(
    query: string,
    params: any[],
    executor: () => Promise<T>,
    options: {
      database?: string
      table?: string
    } = {},
  ): Promise<T> {
    return this.withSpan(
      "db.query",
      async (span) => {
        this.setTag(span, "db.statement", query)
        this.setTag(span, "db.type", "sql")

        if (options.database) {
          this.setTag(span, "db.instance", options.database)
        }

        if (options.table) {
          this.setTag(span, "db.table", options.table)
        }

        if (params.length > 0) {
          this.setTag(span, "db.params", JSON.stringify(params))
        }

        const startTime = Date.now()
        const result = await executor()
        const duration = Date.now() - startTime

        this.setTag(span, "db.duration_ms", duration)
        this.logToSpan(span, {
          level: "info",
          message: "Query executed",
          duration_ms: duration,
        })

        return result
      },
      {
        tags: {
          "span.kind": "client",
          component: "database",
        },
      },
    )
  }

  // Utility for tracing HTTP requests
  async traceHTTPRequest<T>(method: string, url: string, executor: () => Promise<T>): Promise<T> {
    return this.withSpan(`HTTP ${method}`, async (span) => {
      this.setTag(span, "http.method", method)
      this.setTag(span, "http.url", url)
      this.setTag(span, "span.kind", "client")
      this.setTag(span, "component", "http")

      const startTime = Date.now()
      const result = await executor()
      const duration = Date.now() - startTime

      this.setTag(span, "http.duration_ms", duration)
      this.logToSpan(span, {
        level: "info",
        message: "HTTP request completed",
        duration_ms: duration,
      })

      return result
    })
  }

  setSamplingRate(rate: number): void {
    this.samplingRate = Math.max(0, Math.min(1, rate))
  }

  getSamplingRate(): number {
    return this.samplingRate
  }

  getActiveSpans(): Span[] {
    return Array.from(this.spans.values()).filter((span) => !span.endTime)
  }

  getCompletedSpans(): Span[] {
    return Array.from(this.spans.values()).filter((span) => span.endTime)
  }

  clearSpans(): void {
    this.spans.clear()
    this.activeSpans.clear()
  }

  getStats(): {
    totalSpans: number
    activeSpans: number
    completedSpans: number
    errorSpans: number
    averageDuration: number
  } {
    const allSpans = Array.from(this.spans.values())
    const completedSpans = allSpans.filter((span) => span.endTime)
    const errorSpans = allSpans.filter((span) => span.status === "error")

    const totalDuration = completedSpans.reduce((sum, span) => sum + (span.duration || 0), 0)
    const averageDuration = completedSpans.length > 0 ? totalDuration / completedSpans.length : 0

    return {
      totalSpans: allSpans.length,
      activeSpans: allSpans.length - completedSpans.length,
      completedSpans: completedSpans.length,
      errorSpans: errorSpans.length,
      averageDuration,
    }
  }
}

// Export singleton instance
export const tracer = new DistributedTracer()
