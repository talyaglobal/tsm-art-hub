interface SDKConfig {
  language: "javascript" | "python" | "java" | "csharp" | "go" | "php"
  packageName: string
  version: string
  author?: string
  description?: string
  baseUrl: string
}

interface GeneratedSDK {
  files: Record<string, string>
  packageConfig: any
  readme: string
  examples: string
}

class SDKGenerator {
  async generateSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    switch (config.language) {
      case "javascript":
        return this.generateJavaScriptSDK(endpoints, config)
      case "python":
        return this.generatePythonSDK(endpoints, config)
      case "java":
        return this.generateJavaSDK(endpoints, config)
      case "csharp":
        return this.generateCSharpSDK(endpoints, config)
      case "go":
        return this.generateGoSDK(endpoints, config)
      case "php":
        return this.generatePHPSDK(endpoints, config)
      default:
        throw new Error(`Unsupported language: ${config.language}`)
    }
  }

  private async generateJavaScriptSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    const files: Record<string, string> = {}

    // Main client file
    files["src/client.js"] = this.generateJSClient(endpoints, config)

    // Individual service files
    const services = this.groupEndpointsByService(endpoints)
    for (const [serviceName, serviceEndpoints] of Object.entries(services)) {
      files[`src/services/${serviceName}.js`] = this.generateJSService(serviceName, serviceEndpoints, config)
    }

    // Types file
    files["src/types.js"] = this.generateJSTypes(endpoints)

    // Package.json
    const packageConfig = {
      name: config.packageName,
      version: config.version,
      description: config.description || `SDK for ${config.packageName}`,
      main: "src/client.js",
      author: config.author,
      license: "MIT",
      dependencies: {
        axios: "^1.0.0",
      },
      devDependencies: {
        jest: "^29.0.0",
      },
      scripts: {
        test: "jest",
        build: "npm run test",
      },
    }

    const readme = this.generateReadme(config, "javascript")
    const examples = this.generateExamples(endpoints, config, "javascript")

    return { files, packageConfig, readme, examples }
  }

  private async generatePythonSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    const files: Record<string, string> = {}

    // Main client file
    files["src/client.py"] = this.generatePythonClient(endpoints, config)

    // Individual service files
    const services = this.groupEndpointsByService(endpoints)
    for (const [serviceName, serviceEndpoints] of Object.entries(services)) {
      files[`src/services/${serviceName}.py`] = this.generatePythonService(serviceName, serviceEndpoints, config)
    }

    // Types file
    files["src/types.py"] = this.generatePythonTypes(endpoints)

    // Setup.py
    const packageConfig = {
      name: config.packageName.replace(/[^a-zA-Z0-9_]/g, "_"),
      version: config.version,
      description: config.description || `SDK for ${config.packageName}`,
      author: config.author,
      packages: ["src"],
      install_requires: ["requests>=2.25.0"],
      python_requires: ">=3.7",
    }

    const readme = this.generateReadme(config, "python")
    const examples = this.generateExamples(endpoints, config, "python")

    return { files, packageConfig, readme, examples }
  }

  private async generateJavaSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    const files: Record<string, string> = {}
    const packageName = config.packageName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")

    // Main client file
    files[`src/main/java/com/${packageName}/Client.java`] = this.generateJavaClient(endpoints, config)

    // Individual service files
    const services = this.groupEndpointsByService(endpoints)
    for (const [serviceName, serviceEndpoints] of Object.entries(services)) {
      files[`src/main/java/com/${packageName}/services/${serviceName}.java`] = this.generateJavaService(
        serviceName,
        serviceEndpoints,
        config,
      )
    }

    // Models
    files[`src/main/java/com/${packageName}/models/ApiResponse.java`] = this.generateJavaModels(endpoints)

    // pom.xml
    const packageConfig = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.${packageName}</groupId>
    <artifactId>${config.packageName}</artifactId>
    <version>${config.version}</version>
    <packaging>jar</packaging>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.10.0</version>
        </dependency>
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>
</project>`

    const readme = this.generateReadme(config, "java")
    const examples = this.generateExamples(endpoints, config, "java")

    return { files, packageConfig, readme, examples }
  }

  private async generateCSharpSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    const files: Record<string, string> = {}

    // Main client file
    files["Client.cs"] = this.generateCSharpClient(endpoints, config)

    // Individual service files
    const services = this.groupEndpointsByService(endpoints)
    for (const [serviceName, serviceEndpoints] of Object.entries(services)) {
      files[`Services/${serviceName}.cs`] = this.generateCSharpService(serviceName, serviceEndpoints, config)
    }

    // Models
    files["Models/ApiResponse.cs"] = this.generateCSharpModels(endpoints)

    // .csproj file
    const packageConfig = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <PackageId>${config.packageName}</PackageId>
    <Version>${config.version}</Version>
    <Authors>${config.author || "Generated"}</Authors>
    <Description>${config.description || `SDK for ${config.packageName}`}</Description>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="System.Net.Http" Version="4.3.4" />
  </ItemGroup>
</Project>`

    const readme = this.generateReadme(config, "csharp")
    const examples = this.generateExamples(endpoints, config, "csharp")

    return { files, packageConfig, readme, examples }
  }

  private async generateGoSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    const files: Record<string, string> = {}

    // Main client file
    files["client.go"] = this.generateGoClient(endpoints, config)

    // Individual service files
    const services = this.groupEndpointsByService(endpoints)
    for (const [serviceName, serviceEndpoints] of Object.entries(services)) {
      files[`${serviceName}.go`] = this.generateGoService(serviceName, serviceEndpoints, config)
    }

    // Types file
    files["types.go"] = this.generateGoTypes(endpoints)

    // go.mod
    const packageConfig = `module ${config.packageName}

go 1.19

require (
    github.com/go-resty/resty/v2 v2.7.0
)
`

    const readme = this.generateReadme(config, "go")
    const examples = this.generateExamples(endpoints, config, "go")

    return { files, packageConfig, readme, examples }
  }

  private async generatePHPSDK(endpoints: any[], config: SDKConfig): Promise<GeneratedSDK> {
    const files: Record<string, string> = {}

    // Main client file
    files["src/Client.php"] = this.generatePHPClient(endpoints, config)

    // Individual service files
    const services = this.groupEndpointsByService(endpoints)
    for (const [serviceName, serviceEndpoints] of Object.entries(services)) {
      files[`src/Services/${serviceName}.php`] = this.generatePHPService(serviceName, serviceEndpoints, config)
    }

    // composer.json
    const packageConfig = {
      name: config.packageName.toLowerCase(),
      version: config.version,
      description: config.description || `SDK for ${config.packageName}`,
      type: "library",
      require: {
        php: ">=7.4",
        "guzzlehttp/guzzle": "^7.0",
      },
      autoload: {
        "psr-4": {
          [`${config.packageName}\\`]: "src/",
        },
      },
    }

    const readme = this.generateReadme(config, "php")
    const examples = this.generateExamples(endpoints, config, "php")

    return { files, packageConfig, readme, examples }
  }

  private generateJSClient(endpoints: any[], config: SDKConfig): string {
    return `const axios = require('axios');

class ${this.capitalize(config.packageName)}Client {
  constructor(apiKey, baseUrl = '${config.baseUrl}') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });
  }

  async request(method, path, data = null) {
    try {
      const response = await this.client.request({
        method,
        url: path,
        data
      });
      return response.data;
    } catch (error) {
      throw new Error(\`API Error: \${error.response?.data?.message || error.message}\`);
    }
  }
}

module.exports = ${this.capitalize(config.packageName)}Client;`
  }

  private generatePythonClient(endpoints: any[], config: SDKConfig): string {
    return `import requests
from typing import Dict, Any, Optional

class ${this.capitalize(config.packageName)}Client:
    def __init__(self, api_key: str, base_url: str = "${config.baseUrl}"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def request(self, method: str, path: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Error: {str(e)}")
`
  }

  private generateJavaClient(endpoints: any[], config: SDKConfig): string {
    const packageName = config.packageName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")
    return `package com.${packageName};

import okhttp3.*;
import com.google.gson.Gson;
import java.io.IOException;

public class Client {
    private final OkHttpClient client;
    private final String baseUrl;
    private final String apiKey;
    private final Gson gson;

    public Client(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl != null ? baseUrl : "${config.baseUrl}";
        this.client = new OkHttpClient();
        this.gson = new Gson();
    }

    public String request(String method, String path, Object data) throws IOException {
        RequestBody body = null;
        if (data != null) {
            String json = gson.toJson(data);
            body = RequestBody.create(json, MediaType.get("application/json"));
        }

        Request request = new Request.Builder()
            .url(baseUrl + path)
            .addHeader("Authorization", "Bearer " + apiKey)
            .addHeader("Content-Type", "application/json")
            .method(method, body)
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("API Error: " + response.code());
            }
            return response.body().string();
        }
    }
}`
  }

  private generateCSharpClient(endpoints: any[], config: SDKConfig): string {
    return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace ${this.capitalize(config.packageName)}
{
    public class Client
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _apiKey;

        public Client(string apiKey, string baseUrl = "${config.baseUrl}")
        {
            _apiKey = apiKey;
            _baseUrl = baseUrl;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        public async Task<string> RequestAsync(string method, string path, object data = null)
        {
            var request = new HttpRequestMessage(new HttpMethod(method), _baseUrl + path);
            
            if (data != null)
            {
                var json = JsonConvert.SerializeObject(data);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"API Error: {response.StatusCode}");
            }

            return await response.Content.ReadAsStringAsync();
        }
    }
}`
  }

  private generateGoClient(endpoints: any[], config: SDKConfig): string {
    return `package ${config.packageName.toLowerCase()}

import (
    "github.com/go-resty/resty/v2"
)

type Client struct {
    client  *resty.Client
    baseURL string
    apiKey  string
}

func NewClient(apiKey string, baseURL ...string) *Client {
    url := "${config.baseUrl}"
    if len(baseURL) > 0 {
        url = baseURL[0]
    }

    client := resty.New()
    client.SetBaseURL(url)
    client.SetHeader("Authorization", "Bearer "+apiKey)
    client.SetHeader("Content-Type", "application/json")

    return &Client{
        client:  client,
        baseURL: url,
        apiKey:  apiKey,
    }
}

func (c *Client) Request(method, path string, data interface{}) (*resty.Response, error) {
    request := c.client.R()
    
    if data != nil {
        request.SetBody(data)
    }

    return request.Execute(method, path)
}`
  }

  private generatePHPClient(endpoints: any[], config: SDKConfig): string {
    return `<?php

namespace ${this.capitalize(config.packageName)};

use GuzzleHttp\\Client as HttpClient;
use GuzzleHttp\\Exception\\RequestException;

class Client
{
    private $client;
    private $baseUrl;
    private $apiKey;

    public function __construct($apiKey, $baseUrl = '${config.baseUrl}')
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
        $this->client = new HttpClient([
            'base_uri' => $baseUrl,
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json'
            ]
        ]);
    }

    public function request($method, $path, $data = null)
    {
        try {
            $options = [];
            if ($data !== null) {
                $options['json'] = $data;
            }

            $response = $this->client->request($method, $path, $options);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            throw new \\Exception('API Error: ' . $e->getMessage());
        }
    }
}`
  }

  private generateJSService(serviceName: string, endpoints: any[], config: SDKConfig): string {
    let service = `class ${this.capitalize(serviceName)}Service {\n`
    service += `  constructor(client) {\n    this.client = client;\n  }\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
      service += `  async ${methodName}(${this.generateJSParameters(endpoint)}) {\n`
      service += `    return this.client.request('${endpoint.method.toUpperCase()}', '${endpoint.path}'${endpoint.requestBody ? ", data" : ""});\n`
      service += `  }\n\n`
    }

    service += `}\n\nmodule.exports = ${this.capitalize(serviceName)}Service;`
    return service
  }

  private generatePythonService(serviceName: string, endpoints: any[], config: SDKConfig): string {
    let service = `class ${this.capitalize(serviceName)}Service:\n`
    service += `    def __init__(self, client):\n        self.client = client\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase()
      service += `    def ${methodName}(self${this.generatePythonParameters(endpoint)}):\n`
      service += `        return self.client.request('${endpoint.method.toUpperCase()}', '${endpoint.path}'${endpoint.requestBody ? ", data" : ""})\n\n`
    }

    return service
  }

  private generateJavaService(serviceName: string, endpoints: any[], config: SDKConfig): string {
    const packageName = config.packageName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")
    let service = `package com.${packageName}.services;\n\n`
    service += `import com.${packageName}.Client;\n\n`
    service += `public class ${this.capitalize(serviceName)} {\n`
    service += `    private final Client client;\n\n`
    service += `    public ${this.capitalize(serviceName)}(Client client) {\n        this.client = client;\n    }\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
      service += `    public String ${methodName}(${this.generateJavaParameters(endpoint)}) throws Exception {\n`
      service += `        return client.request("${endpoint.method.toUpperCase()}", "${endpoint.path}"${endpoint.requestBody ? ", data" : ", null"});\n`
      service += `    }\n\n`
    }

    service += `}`
    return service
  }

  private generateCSharpService(serviceName: string, endpoints: any[], config: SDKConfig): string {
    let service = `using System.Threading.Tasks;\n\n`
    service += `namespace ${this.capitalize(config.packageName)}.Services\n{\n`
    service += `    public class ${this.capitalize(serviceName)}\n    {\n`
    service += `        private readonly Client _client;\n\n`
    service += `        public ${this.capitalize(serviceName)}(Client client)\n        {\n            _client = client;\n        }\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
      service += `        public async Task<string> ${methodName}Async(${this.generateCSharpParameters(endpoint)})\n        {\n`
      service += `            return await _client.RequestAsync("${endpoint.method.toUpperCase()}", "${endpoint.path}"${endpoint.requestBody ? ", data" : ""});\n`
      service += `        }\n\n`
    }

    service += `    }\n}`
    return service
  }

  private generateGoService(serviceName: string, endpoints: any[], config: SDKConfig): string {
    let service = `package ${config.packageName.toLowerCase()}\n\n`
    service += `import "github.com/go-resty/resty/v2"\n\n`
    service += `type ${this.capitalize(serviceName)}Service struct {\n    client *Client\n}\n\n`
    service += `func New${this.capitalize(serviceName)}Service(client *Client) *${this.capitalize(serviceName)}Service {\n`
    service += `    return &${this.capitalize(serviceName)}Service{client: client}\n}\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.capitalize(this.generateMethodName(endpoint.path, endpoint.method))
      service += `func (s *${this.capitalize(serviceName)}Service) ${methodName}(${this.generateGoParameters(endpoint)}) (*resty.Response, error) {\n`
      service += `    return s.client.Request("${endpoint.method.toUpperCase()}", "${endpoint.path}"${endpoint.requestBody ? ", data" : ", nil"})\n`
      service += `}\n\n`
    }

    return service
  }

  private generatePHPService(serviceName: string, endpoints: any[], config: SDKConfig): string {
    let service = `<?php\n\nnamespace ${this.capitalize(config.packageName)}\\Services;\n\n`
    service += `class ${this.capitalize(serviceName)}\n{\n`
    service += `    private $client;\n\n`
    service += `    public function __construct($client)\n    {\n        $this->client = $client;\n    }\n\n`

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint.path, endpoint.method)
      service += `    public function ${methodName}(${this.generatePHPParameters(endpoint)})\n    {\n`
      service += `        return $this->client->request('${endpoint.method.toUpperCase()}', '${endpoint.path}'${endpoint.requestBody ? ", $data" : ""});\n`
      service += `    }\n\n`
    }

    service += `}`
    return service
  }

  private generateJSTypes(endpoints: any[]): string {
    return `// Type definitions for ${endpoints.length} endpoints\n// Generated automatically\n\nmodule.exports = {};`
  }

  private generatePythonTypes(endpoints: any[]): string {
    return `# Type definitions for ${endpoints.length} endpoints\n# Generated automatically\n\nfrom typing import Dict, Any\n\nApiResponse = Dict[str, Any]`
  }

  private generateJavaModels(endpoints: any[]): string {
    const packageName = "client" // simplified
    return `package com.${packageName}.models;\n\npublic class ApiResponse {\n    // Generated model class\n}`
  }

  private generateCSharpModels(endpoints: any[]): string {
    return `namespace Client.Models\n{\n    public class ApiResponse\n    {\n        // Generated model class\n    }\n}`
  }

  private generateGoTypes(endpoints: any[]): string {
    return `package client\n\n// ApiResponse represents a generic API response\ntype ApiResponse map[string]interface{}`
  }

  private generateReadme(config: SDKConfig, language: string): string {
    return `# ${config.packageName} SDK

${config.description || `SDK for ${config.packageName}`}

## Installation

${this.getInstallationInstructions(language, config.packageName)}

## Usage

${this.getUsageExample(language, config.packageName)}

## License

MIT
`
  }

  private generateExamples(endpoints: any[], config: SDKConfig, language: string): string {
    return `# Examples for ${config.packageName} SDK

${this.getLanguageSpecificExamples(language, config.packageName)}
`
  }

  private getInstallationInstructions(language: string, packageName: string): string {
    switch (language) {
      case "javascript":
        return `\`\`\`bash\nnpm install ${packageName}\n\`\`\``
      case "python":
        return `\`\`\`bash\npip install ${packageName}\n\`\`\``
      case "java":
        return `Add to your pom.xml:\n\`\`\`xml\n<dependency>\n  <groupId>com.${packageName}</groupId>\n  <artifactId>${packageName}</artifactId>\n  <version>1.0.0</version>\n</dependency>\n\`\`\``
      case "csharp":
        return `\`\`\`bash\ndotnet add package ${packageName}\n\`\`\``
      case "go":
        return `\`\`\`bash\ngo get ${packageName}\n\`\`\``
      case "php":
        return `\`\`\`bash\ncomposer require ${packageName}\n\`\`\``
      default:
        return "Installation instructions not available"
    }
  }

  private getUsageExample(language: string, packageName: string): string {
    switch (language) {
      case "javascript":
        return `\`\`\`javascript\nconst Client = require('${packageName}');\nconst client = new Client('your-api-key');\n\`\`\``
      case "python":
        return `\`\`\`python\nfrom ${packageName} import Client\nclient = Client('your-api-key')\n\`\`\``
      case "java":
        return `\`\`\`java\nClient client = new Client("your-api-key");\n\`\`\``
      case "csharp":
        return `\`\`\`csharp\nvar client = new Client("your-api-key");\n\`\`\``
      case "go":
        return `\`\`\`go\nclient := NewClient("your-api-key")\n\`\`\``
      case "php":
        return `\`\`\`php\n$client = new Client('your-api-key');\n\`\`\``
      default:
        return "Usage example not available"
    }
  }

  private getLanguageSpecificExamples(language: string, packageName: string): string {
    return `Examples for ${language} will be generated based on your API endpoints.`
  }

  private groupEndpointsByService(endpoints: any[]): Record<string, any[]> {
    const services: Record<string, any[]> = {}

    for (const endpoint of endpoints) {
      const serviceName = endpoint.tags?.[0] || "default"
      if (!services[serviceName]) {
        services[serviceName] = []
      }
      services[serviceName].push(endpoint)
    }

    return services
  }

  private generateMethodName(path: string, method: string): string {
    const pathParts = path.split("/").filter((part) => part && !part.startsWith("{"))
    const methodPrefix = method.toLowerCase()

    let name = methodPrefix
    for (const part of pathParts) {
      name += this.capitalize(part)
    }

    return name
  }

  private generateJSParameters(endpoint: any): string {
    const params: string[] = []

    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter((p: any) => p.in === "path")
      params.push(...pathParams.map((p: any) => p.name))

      const queryParams = endpoint.parameters.filter((p: any) => p.in === "query")
      if (queryParams.length > 0) {
        params.push("queryParams = {}")
      }
    }

    if (endpoint.requestBody) {
      params.push("data = null")
    }

    return params.join(", ")
  }

  private generatePythonParameters(endpoint: any): string {
    const params: string[] = []

    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter((p: any) => p.in === "path")
      params.push(...pathParams.map((p: any) => `, ${p.name}: str`))

      const queryParams = endpoint.parameters.filter((p: any) => p.in === "query")
      if (queryParams.length > 0) {
        params.push(", query_params: Dict[str, Any] = None")
      }
    }

    if (endpoint.requestBody) {
      params.push(", data: Dict[str, Any] = None")
    }

    return params.join("")
  }

  private generateJavaParameters(endpoint: any): string {
    const params: string[] = []

    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter((p: any) => p.in === "path")
      params.push(...pathParams.map((p: any) => `String ${p.name}`))
    }

    if (endpoint.requestBody) {
      params.push("Object data")
    }

    return params.join(", ")
  }

  private generateCSharpParameters(endpoint: any): string {
    const params: string[] = []

    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter((p: any) => p.in === "path")
      params.push(...pathParams.map((p: any) => `string ${p.name}`))
    }

    if (endpoint.requestBody) {
      params.push("object data = null")
    }

    return params.join(", ")
  }

  private generateGoParameters(endpoint: any): string {
    const params: string[] = []

    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter((p: any) => p.in === "path")
      params.push(...pathParams.map((p: any) => `${p.name} string`))
    }

    if (endpoint.requestBody) {
      params.push("data interface{}")
    }

    return params.join(", ")
  }

  private generatePHPParameters(endpoint: any): string {
    const params: string[] = []

    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter((p: any) => p.in === "path")
      params.push(...pathParams.map((p: any) => `$${p.name}`))
    }

    if (endpoint.requestBody) {
      params.push("$data = null")
    }

    return params.join(", ")
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export const sdkGenerator = new SDKGenerator()
