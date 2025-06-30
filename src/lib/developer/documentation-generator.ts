import { createClient } from "@/lib/supabase/server"

interface APIEndpoint {
  path: string
  method: string
  summary: string
  description?: string
  parameters?: Array<{
    name: string
    in: "query" | "path" | "header" | "body"
    type: string
    required: boolean
    description?: string
  }>
  requestBody?: {
    description?: string
    required: boolean
    content: Record<
      string,
      {
        schema: any
        example?: any
      }
    >
  }
  responses: Record<
    string,
    {
      description: string
      content?: Record<
        string,
        {
          schema: any
          example?: any
        }
      >
    }
  >
  tags?: string[]
}

interface Parameter {
  name: string
  in: "query" | "path" | "header"
  required: boolean
  type: string
  description?: string
  example?: any
}

interface RequestBody {
  description?: string
  required: boolean
  content: Record<string, MediaType>
}

interface MediaType {
  schema: Schema
  example?: any
}

interface Schema {
  type: string
  properties?: Record<string, Schema>
  items?: Schema
  required?: string[]
}

interface Response {
  description: string
  content?: Record<string, MediaType>
}

interface DocumentationConfig {
  title: string
  version: string
  description: string
  baseUrl: string
  contact?: {
    name: string
    email: string
    url?: string
  }
}

export interface DocumentationSection {
  id: string
  title: string
  slug: string
  content: string
  type: "markdown" | "api" | "tutorial" | "reference" | "guide"
  order: number
  parent?: string
  children?: string[]
  metadata: SectionMetadata
  examples: CodeExample[]
  interactive: boolean
}

export interface SectionMetadata {
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
  lastUpdated: string
  author: string
  reviewers: string[]
  status: "draft" | "review" | "published" | "archived"
}

export interface DocumentationTheme {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  codeTheme: string
  layout: "sidebar" | "topnav" | "hybrid"
  customCSS?: string
}

export interface NavigationConfig {
  structure: NavigationItem[]
  breadcrumbs: boolean
  search: boolean
  tableOfContents: boolean
  previousNext: boolean
}

export interface NavigationItem {
  title: string
  path: string
  icon?: string
  children?: NavigationItem[]
  external?: boolean
}

export interface SearchConfig {
  enabled: boolean
  provider: "algolia" | "elasticsearch" | "built-in"
  indexing: IndexingConfig
  ui: SearchUIConfig
}

export interface IndexingConfig {
  autoIndex: boolean
  includeCode: boolean
  includeExamples: boolean
  excludePatterns: string[]
  customFields: string[]
}

export interface SearchUIConfig {
  placeholder: string
  shortcuts: string[]
  filters: SearchFilter[]
  suggestions: boolean
}

export interface SearchFilter {
  name: string
  field: string
  type: "select" | "checkbox" | "range"
  options?: string[]
}

export interface AnalyticsConfig {
  enabled: boolean
  provider: "google" | "mixpanel" | "amplitude" | "custom"
  trackingId: string
  events: AnalyticsEvent[]
}

export interface AnalyticsEvent {
  name: string
  trigger: "page_view" | "click" | "scroll" | "time_spent"
  properties: Record<string, any>
}

export interface Customization {
  logo?: string
  favicon?: string
  customDomain?: string
  headerLinks: HeaderLink[]
  footerContent: string
  socialLinks: SocialLink[]
}

export interface HeaderLink {
  title: string
  url: string
  external?: boolean
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface CodeExample {
  id: string
  title: string
  description: string
  language: string
  code: string
  runnable: boolean
  dependencies?: string[]
  environment?: string
  expectedOutput?: string
}

export interface EndpointDocumentation {
  path: string
  method: string
  summary: string
  description: string
  parameters: ParameterDoc[]
  requestBody?: RequestBodyDoc
  responses: ResponseDoc[]
  examples: RequestResponseExample[]
  deprecated?: boolean
  tags: string[]
}

export interface ParameterDoc {
  name: string
  in: "query" | "path" | "header" | "body"
  type: string
  required: boolean
  description: string
  example: any
  schema?: any
}

export interface RequestBodyDoc {
  description?: string
  required: boolean
  content: Record<
    string,
    {
      schema: any
      example?: any
    }
  >
}

export interface ResponseDoc {
  statusCode: number
  description: string
  schema?: any
  examples: any[]
  headers?: Record<string, any>
}

export interface RequestResponseExample {
  name: string
  description: string
  request: {
    url: string
    method: string
    headers: Record<string, string>
    body?: any
  }
  response: {
    statusCode: number
    headers: Record<string, string>
    body: any
  }
}

export interface SchemaDocumentation {
  name: string
  type: string
  description: string
  properties: PropertyDoc[]
  required: string[]
  examples: any[]
}

export interface PropertyDoc {
  name: string
  type: string
  description: string
  required: boolean
  example: any
  format?: string
  enum?: any[]
}

export interface AuthDocumentation {
  type: string
  description: string
  flows: AuthFlow[]
  scopes?: AuthScope[]
  examples: AuthExample[]
}

export interface AuthFlow {
  type: string
  description: string
  steps: AuthStep[]
  example: any
}

export interface AuthStep {
  step: number
  description: string
  action: string
  example: any
}

export interface AuthScope {
  name: string
  description: string
  permissions: string[]
}

export interface AuthExample {
  name: string
  description: string
  code: string
  language: string
}

export interface APIExample {
  title: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  steps: ExampleStep[]
  fullCode: string
  language: string
}

export interface ExampleStep {
  title: string
  description: string
  code: string
  explanation: string
}

interface DocumentationTemplate {
  name: string
  type: string
  template: string
  sections: string[]
}

interface APIDocumentation {
  title: string
  version: string
  description: string
  baseUrl: string
  endpoints: APIEndpoint[]
  schemas: any
  authentication?: AuthDocumentation
  examples?: APIExample[]
}

export interface GeneratedPage {
  id: string
  title: string
  slug: string
  content: string
  type: string
  metadata: SectionMetadata
  navigation: PageNavigation
  seo: SEOMetadata
  assets: GeneratedAsset[]
}

export interface GeneratedNavigation {
  structure: NavigationItem[]
  breadcrumbs: boolean
  tableOfContents: TableOfContents
  search: boolean
  theme: DocumentationTheme
}

export interface SearchIndex {
  documents: SearchDocument[]
  config: SearchConfig
  stats: SearchIndexStats
}

export interface SearchIndexStats {
  totalDocuments: number
  lastIndexed: string
  languages: string[]
  sections: string[]
}

export interface GeneratedAsset {
  path: string
  content: string
  type: string
  metadata?: any
  minified?: boolean
}

export interface SearchDocument {
  id: string
  title: string
  content: string
  url: string
  type: string
  tags: string[]
  section: string
  lastUpdated: string
}

export interface PageNavigation {
  previous: { title: string; path: string } | null
  next: { title: string; path: string } | null
  breadcrumbs: { title: string; path: string }[]
  tableOfContents: TableOfContents
}

export interface SEOMetadata {
  title: string
  description: string
  keywords: string
  author: string
  lastUpdated: string
}

export interface TableOfContents {
  title: string
  slug: string
  level: number
  children: TableOfContents[]
}

class DocumentationGenerator {
  private supabase = createClient()
  private templates = new Map<string, DocumentationTemplate>()

  constructor() {
    this.initializeTemplates()
  }

  async generateFromOpenAPI(openApiSpec: any): Promise<APIDocumentation> {
    const doc: APIDocumentation = {
      title: openApiSpec.info?.title || "API Documentation",
      version: openApiSpec.info?.version || "1.0.0",
      description: openApiSpec.info?.description || "",
      baseUrl: this.extractBaseUrl(openApiSpec),
      endpoints: [],
      schemas: openApiSpec.components?.schemas || {},
    }

    // Extract endpoints from paths
    for (const [path, pathItem] of Object.entries(openApiSpec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (typeof operation === "object" && operation.operationId) {
          const endpoint = this.convertOperationToEndpoint(path, method, operation)
          doc.endpoints.push(endpoint)
        }
      }
    }

    return doc
  }

  async generateMarkdown(documentation: APIDocumentation): Promise<string> {
    let markdown = `# ${documentation.title}\n\n`
    markdown += `Version: ${documentation.version}\n\n`

    if (documentation.description) {
      markdown += `${documentation.description}\n\n`
    }

    markdown += `Base URL: \`${documentation.baseUrl}\`\n\n`

    // Table of contents
    markdown += `## Table of Contents\n\n`
    for (const endpoint of documentation.endpoints) {
      const anchor = this.createAnchor(endpoint.method, endpoint.path)
      markdown += `- [${endpoint.method.toUpperCase()} ${endpoint.path}](#${anchor})\n`
    }
    markdown += `\n`

    // Endpoints
    markdown += `## Endpoints\n\n`
    for (const endpoint of documentation.endpoints) {
      markdown += this.generateEndpointMarkdown(endpoint)
    }

    // Schemas
    if (Object.keys(documentation.schemas).length > 0) {
      markdown += `## Schemas\n\n`
      for (const [name, schema] of Object.entries(documentation.schemas)) {
        markdown += this.generateSchemaMarkdown(name, schema)
      }
    }

    return markdown
  }

  async generateHTML(documentation: APIDocumentation): Promise<string> {
    const markdown = await this.generateMarkdown(documentation)

    // Simple markdown to HTML conversion
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${documentation.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .endpoint { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 5px; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 3px; color: white; font-weight: bold; }
        .get { background: #61affe; }
        .post { background: #49cc90; }
        .put { background: #fca130; }
        .delete { background: #f93e3e; }
        .patch { background: #50e3c2; }
    </style>
</head>
<body>
`

    // Convert markdown to basic HTML
    html += this.markdownToHTML(markdown)

    html += `
</body>
</html>
`

    return html
  }

  async generatePostmanCollection(documentation: APIDocumentation): Promise<any> {
    const collection = {
      info: {
        name: documentation.title,
        description: documentation.description,
        version: documentation.version,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: [],
      variable: [
        {
          key: "baseUrl",
          value: documentation.baseUrl,
          type: "string",
        },
      ],
    }

    for (const endpoint of documentation.endpoints) {
      const item = this.convertEndpointToPostmanItem(endpoint)
      collection.item.push(item)
    }

    return collection
  }

  async generateApiDocs(apiSpec: any): Promise<string> {
    return `# API Documentation\n\nGenerated documentation for ${apiSpec.title || "API"}`
  }

  private extractBaseUrl(openApiSpec: any): string {
    if (openApiSpec.servers && openApiSpec.servers.length > 0) {
      return openApiSpec.servers[0].url
    }

    const host = openApiSpec.host || "localhost"
    const basePath = openApiSpec.basePath || ""
    const scheme = openApiSpec.schemes?.[0] || "https"

    return `${scheme}://${host}${basePath}`
  }

  private convertOperationToEndpoint(path: string, method: string, operation: any): APIEndpoint {
    const endpoint: APIEndpoint = {
      path,
      method: method.toUpperCase(),
      summary: operation.summary || "",
      description: operation.description,
      parameters: [],
      responses: operation.responses || {},
    }

    // Convert parameters
    if (operation.parameters) {
      endpoint.parameters = operation.parameters.map((param: any) => ({
        name: param.name,
        in: param.in,
        type: param.type || param.schema?.type || "string",
        required: param.required || false,
        description: param.description,
        example: param.example,
      }))
    }

    // Convert requestBody
    if (operation.requestBody) {
      endpoint.requestBody = {
        description: operation.requestBody.description,
        required: operation.requestBody.required,
        content: operation.requestBody.content,
      }
    }

    // Add examples if available
    if (operation.examples) {
      endpoint.examples = Object.entries(operation.examples).map(([name, example]: [string, any]) => ({
        title: name,
        request: example.request,
        response: example.response,
      }))
    }

    return endpoint
  }

  private generateEndpointMarkdown(endpoint: APIEndpoint): string {
    const anchor = this.createAnchor(endpoint.method, endpoint.path)
    let markdown = `### ${endpoint.method} ${endpoint.path} {#${anchor}}\n\n`

    markdown += `${endpoint.summary}\n\n`

    if (endpoint.description) {
      markdown += `${endpoint.description}\n\n`
    }

    // Parameters
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `#### Parameters\n\n`
      markdown += `| Name | Type | In | Required | Description |\n`
      markdown += `|------|------|----|---------|-----------|\n`

      for (const param of endpoint.parameters) {
        markdown += `| ${param.name} | ${param.type} | ${param.in} | ${param.required ? "Yes" : "No"} | ${param.description || ""} |\n`
      }
      markdown += `\n`
    }

    // Request Body
    if (endpoint.requestBody) {
      markdown += `#### Request Body\n\n`
      markdown += `${endpoint.requestBody.description || ""}\n\n`
      markdown += `**Required:** ${endpoint.requestBody.required ? "Yes" : "No"}\n\n`
    }

    // Responses
    markdown += `#### Responses\n\n`
    for (const [code, response] of Object.entries(endpoint.responses)) {
      markdown += `**${code}**: ${response.description}\n\n`

      if (response.content) {
        for (const [mediaType, media] of Object.entries(response.content)) {
          if (media.schema) {
            markdown += `\`\`\`json\n${JSON.stringify(media.schema, null, 2)}\n\`\`\`\n\n`
          }
          if (media.example) {
            markdown += `\`\`\`json\n${JSON.stringify(media.example, null, 2)}\n\`\`\`\n\n`
          }
        }
      }
    }

    // Examples
    if (endpoint.examples && endpoint.examples.length > 0) {
      markdown += `#### Examples\n\n`

      for (const example of endpoint.examples) {
        markdown += `**${example.title}**\n\n`

        if (example.request) {
          markdown += `Request:\n\`\`\`json\n${JSON.stringify(example.request, null, 2)}\n\`\`\`\n\n`
        }

        if (example.response) {
          markdown += `Response:\n\`\`\`json\n${JSON.stringify(example.response, null, 2)}\n\`\`\`\n\n`
        }
      }
    }

    return markdown
  }

  private generateSchemaMarkdown(name: string, schema: any): string {
    let markdown = `### ${name}\n\n`

    if (schema.description) {
      markdown += `${schema.description}\n\n`
    }

    markdown += `\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`

    return markdown
  }

  private createAnchor(method: string, path: string): string {
    return `${method.toLowerCase()}-${path.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`
  }

  private markdownToHTML(markdown: string): string {
    // Very basic markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\n/g, "<br>")
  }

  private convertEndpointToPostmanItem(endpoint: APIEndpoint): any {
    const item = {
      name: `${endpoint.method} ${endpoint.path}`,
      request: {
        method: endpoint.method,
        header: [],
        url: {
          raw: `{{baseUrl}}${endpoint.path}`,
          host: ["{{baseUrl}}"],
          path: endpoint.path.split("/").filter((p) => p),
        },
      },
      response: [],
    }

    // Add parameters
    if (endpoint.parameters) {
      const queryParams = endpoint.parameters.filter((p) => p.in === "query")
      const pathParams = endpoint.parameters.filter((p) => p.in === "path")
      const headerParams = endpoint.parameters.filter((p) => p.in === "header")

      if (queryParams.length > 0) {
        item.request.url.query = queryParams.map((p) => ({
          key: p.name,
          value: `{{${p.name}}}`,
          description: p.description,
        }))
      }

      if (headerParams.length > 0) {
        item.request.header = headerParams.map((p) => ({
          key: p.name,
          value: `{{${p.name}}}`,
          description: p.description,
        }))
      }
    }

    // Add request body
    if (endpoint.requestBody) {
      item.request.body = {
        mode: "raw",
        raw: JSON.stringify({}, null, 2),
        options: {
          raw: {
            language: "json",
          },
        },
      }
    }

    return item
  }

  async generateSDKCode(documentation: APIDocumentation, language: "javascript" | "python" | "curl"): Promise<string> {
    switch (language) {
      case "javascript":
        return this.generateJavaScriptSDK(documentation.endpoints)
      case "python":
        return this.generatePythonSDK(documentation.endpoints)
      case "curl":
        return this.generateCurlExamples(documentation.endpoints)
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }

  private generateJavaScriptSDK(endpoints: APIEndpoint[]): string {
    let sdk = `// API JavaScript SDK\n\n`

    sdk += `class ApiClient {\n`
    sdk += `  constructor(baseUrl, apiKey) {\n`
    sdk += `    this.baseUrl = baseUrl;\n`
    sdk += `    this.apiKey = apiKey;\n`
    sdk += `  }\n\n`

    sdk += `  async request(method, path, data = null) {\n`
    sdk += `    const url = \`\${this.baseUrl}\${path}\`;\n`
    sdk += `    const options = {\n`
    sdk += `      method,\n`
    sdk += `      headers: {\n`
    sdk += `        'Content-Type': 'application/json',\n`
    sdk += `        'Authorization': \`Bearer \${this.apiKey}\`\n`
    sdk += `      }\n`
    sdk += `    };\n\n`
    sdk += `    if (data) {\n`
    sdk += `      options.body = JSON.stringify(data);\n`
    sdk += `    }\n\n`
    sdk += `    const response = await fetch(url, options);\n`
    sdk += `    return response.json();\n`
    sdk += `  }\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
      const params = endpoint.parameters?.filter((p) => p.in === "path") || []
      const queryParams = endpoint.parameters?.filter((p) => p.in === "query") || []

      sdk += `  async ${methodName}(`

      // Add path parameters
      if (params.length > 0) {
        sdk += params.map((p) => p.name).join(", ")
        if (queryParams.length > 0 || endpoint.requestBody) {
          sdk += ", "
        }
      }

      // Add query parameters and request body
      if (queryParams.length > 0) {
        sdk += "queryParams = {}"
        if (endpoint.requestBody) {
          sdk += ", data = null"
        }
      } else if (endpoint.requestBody) {
        sdk += "data = null"
      }

      sdk += `) {\n`

      // Build path
      let path = endpoint.path
      for (const param of params) {
        path = path.replace(`{${param.name}}`, `\${${param.name}}`)
      }

      sdk += `    let path = \`${path}\`;\n`

      // Add query parameters
      if (queryParams.length > 0) {
        sdk += `    const searchParams = new URLSearchParams(queryParams);\n`
        sdk += `    if (searchParams.toString()) {\n`
        sdk += `      path += \`?\${searchParams.toString()}\`;\n`
        sdk += `    }\n`
      }

      sdk += `    return this.request('${endpoint.method.toUpperCase()}', path`
      if (endpoint.requestBody) {
        sdk += ", data"
      }
      sdk += `);\n`
      sdk += `  }\n\n`
    }

    sdk += `}\n\n`
    sdk += `module.exports = ApiClient;`

    return sdk
  }

  private generatePythonSDK(endpoints: APIEndpoint[]): string {
    let sdk = `"""API Python SDK"""\n\n`
    sdk += `import requests\nimport json\n\n`

    sdk += `class ApiClient:\n`
    sdk += `    def __init__(self, base_url, api_key):\n`
    sdk += `        self.base_url = base_url\n`
    sdk += `        self.api_key = api_key\n`
    sdk += `        self.session = requests.Session()\n`
    sdk += `        self.session.headers.update({\n`
    sdk += `            'Authorization': f'Bearer {api_key}',\n`
    sdk += `            'Content-Type': 'application/json'\n`
    sdk += `        })\n\n`

    sdk += `    def request(self, method, path, data=None):\n`
    sdk += `        url = f"{self.base_url}{path}"\n`
    sdk += `        response = self.session.request(method, url, json=data)\n`
    sdk += `        response.raise_for_status()\n`
    sdk += `        return response.json()\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase()
      const params = endpoint.parameters?.filter((p) => p.in === "path") || []
      const queryParams = endpoint.parameters?.filter((p) => p.in === "query") || []

      sdk += `    def ${methodName}(self`

      // Add path parameters
      if (params.length > 0) {
        sdk += ", " + params.map((p) => `${p.name}: str`).join(", ")
      }

      // Add query parameters and request body
      if (queryParams.length > 0) {
        sdk += ", query_params=None"
      }
      if (endpoint.requestBody) {
        sdk += ", data=None"
      }

      sdk += `) -> dict:\n`

      // Build path
      let path = endpoint.path
      for (const param of params) {
        path = path.replace(`{${param.name}}`, `{${param.name}}`)
      }

      sdk += `        path = f"${path}"\n`

      // Add query parameters
      if (queryParams.length > 0) {
        sdk += `        if query_params:\n`
        sdk += `            query_string = '&'.join([f"{k}={v}" for k, v in query_params.items()])\n`
        sdk += `            path += f"?{query_string}"\n`
      }

      sdk += `        return self.request('${endpoint.method.toUpperCase()}', path`
      if (endpoint.requestBody) {
        sdk += ", data"
      }
      sdk += `)\n\n`
    }

    return sdk
  }

  private generateCurlExamples(endpoints: APIEndpoint[]): string {
    let examples = `# API cURL Examples\n\n`

    for (const endpoint of endpoints) {
      examples += `## ${endpoint.method.toUpperCase()} ${endpoint.path}\n\n`
      examples += `\`\`\`bash\n`
      examples += `curl -X ${endpoint.method.toUpperCase()} \\\n`
      examples += `  "{{baseUrl}}${endpoint.path}" \\\n`
      examples += `  -H "Authorization: Bearer {{authToken}}" \\\n`
      examples += `  -H "Content-Type: application/json"`

      if (endpoint.requestBody) {
        examples += ` \\\n  -d '{\n    "example": "data"\n  }'`
      }

      examples += `\n\`\`\`\n\n`
    }

    return examples
  }

  private generateMethodName(path: string, method: string): string {
    const pathParts = path.split("/").filter((part) => part && !part.startsWith("{"))
    const methodPrefix = method.toLowerCase()

    let name = methodPrefix
    for (const part of pathParts) {
      name += part.charAt(0).toUpperCase() + part.slice(1)
    }

    return name
  }

  private initializeTemplates() {
    // Initialization code for templates
  }
}

export const documentationGenerator = new DocumentationGenerator()
