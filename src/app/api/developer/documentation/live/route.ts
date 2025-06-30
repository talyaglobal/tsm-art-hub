import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const apiId = searchParams.get("apiId") || "default"

  // Generate live interactive HTML documentation
  const htmlContent = await generateLiveDocumentation(apiId)

  return new Response(htmlContent, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache",
    },
  })
}

async function generateLiveDocumentation(apiId: string): Promise<string> {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSmart Hub API Documentation - Live Testing</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 700;
        }

        .header p {
            opacity: 0.9;
            margin-top: 0.5rem;
        }

        .bypass-login {
            background: #10b981;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .bypass-login:hover {
            background: #059669;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 2rem;
        }

        .sidebar {
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            height: fit-content;
            position: sticky;
            top: 120px;
        }

        .sidebar h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #374151;
        }

        .nav-list {
            list-style: none;
        }

        .nav-list li {
            margin-bottom: 0.5rem;
        }

        .nav-list a {
            color: #6b7280;
            text-decoration: none;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            display: block;
            transition: all 0.2s;
        }

        .nav-list a:hover,
        .nav-list a.active {
            background: #f3f4f6;
            color: #374151;
        }

        .main-content {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .section {
            padding: 2rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .section:last-child {
            border-bottom: none;
        }

        .section h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #111827;
        }

        .section h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: #374151;
        }

        .endpoint {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            overflow: hidden;
        }

        .endpoint-header {
            background: #374151;
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .endpoint-title {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .method {
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
        }

        .method.get { background: #10b981; color: white; }
        .method.post { background: #3b82f6; color: white; }
        .method.put { background: #f59e0b; color: white; }
        .method.delete { background: #ef4444; color: white; }

        .endpoint-path {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 1.1rem;
        }

        .test-button {
            background: #10b981;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .test-button:hover {
            background: #059669;
        }

        .test-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .endpoint-content {
            padding: 1.5rem;
        }

        .endpoint-description {
            margin-bottom: 1.5rem;
            color: #6b7280;
        }

        .parameters {
            margin-bottom: 1.5rem;
        }

        .parameters h4 {
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #374151;
        }

        .parameter-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }

        .parameter-table th,
        .parameter-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .parameter-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }

        .parameter-table td {
            color: #6b7280;
        }

        .code-block {
            background: #1f2937;
            color: #e5e7eb;
            padding: 1rem;
            border-radius: 0.375rem;
            overflow-x: auto;
            margin: 1rem 0;
            position: relative;
        }

        .code-block pre {
            margin: 0;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.875rem;
        }

        .copy-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: #374151;
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.75rem;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .copy-button:hover {
            opacity: 1;
        }

        .test-panel {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-top: 1rem;
        }

        .test-form {
            display: grid;
            gap: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 500;
            color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
            font-family: 'Monaco', 'Consolas', monospace;
        }

        .test-result {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 0.375rem;
            border: 1px solid;
        }

        .test-result.success {
            background: #f0fdf4;
            border-color: #bbf7d0;
            color: #166534;
        }

        .test-result.error {
            background: #fef2f2;
            border-color: #fecaca;
            color: #dc2626;
        }

        .result-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .status-200 { background: #dcfce7; color: #166534; }
        .status-201 { background: #dbeafe; color: #1d4ed8; }
        .status-400 { background: #fef3c7; color: #92400e; }
        .status-401 { background: #fee2e2; color: #dc2626; }
        .status-404 { background: #fce7f3; color: #be185d; }
        .status-500 { background: #fef2f2; color: #dc2626; }

        .response-time {
            font-size: 0.875rem;
            color: #6b7280;
        }

        .tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
        }

        .tab {
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            color: #6b7280;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .tab.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .loading {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .alert {
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            border: 1px solid;
        }

        .alert.info {
            background: #eff6ff;
            border-color: #bfdbfe;
            color: #1e40af;
        }

        .alert.warning {
            background: #fffbeb;
            border-color: #fed7aa;
            color: #92400e;
        }

        .alert.success {
            background: #f0fdf4;
            border-color: #bbf7d0;
            color: #166534;
        }

        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
                padding: 1rem;
            }
            
            .sidebar {
                position: static;
            }
            
            .header-content {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div>
                <h1><i class="fas fa-code"></i> TSmart Hub API</h1>
                <p>Interactive API Documentation with Live Testing</p>
            </div>
            <button class="bypass-login" onclick="bypassLogin()">
                <i class="fas fa-unlock"></i>
                Bypass Login
            </button>
        </div>
    </div>

    <div class="container">
        <div class="sidebar">
            <h3><i class="fas fa-list"></i> Navigation</h3>
            <ul class="nav-list">
                <li><a href="#getting-started" class="nav-link active">Getting Started</a></li>
                <li><a href="#authentication" class="nav-link">Authentication</a></li>
                <li><a href="#integrations" class="nav-link">Integrations</a></li>
                <li><a href="#webhooks" class="nav-link">Webhooks</a></li>
                <li><a href="#analytics" class="nav-link">Analytics</a></li>
                <li><a href="#errors" class="nav-link">Error Handling</a></li>
                <li><a href="#sdks" class="nav-link">SDKs</a></li>
            </ul>
        </div>

        <div class="main-content">
            <div class="section" id="getting-started">
                <h2><i class="fas fa-rocket"></i> Getting Started</h2>
                <p>Welcome to the TSmart Hub API! This interactive documentation allows you to test API endpoints directly from your browser.</p>
                
                <div class="alert info">
                    <strong><i class="fas fa-info-circle"></i> Live Testing Available</strong><br>
                    All endpoints in this documentation can be tested live. Use the "Test API" buttons to make real API calls with bypass authentication.
                </div>

                <h3>Base URL</h3>
                <div class="code-block">
                    <pre><code>https://api.tsmarthub.com/v1</code></pre>
                    <button class="copy-button" onclick="copyToClipboard('https://api.tsmarthub.com/v1')">Copy</button>
                </div>

                <h3>Quick Start</h3>
                <p>Get started with a simple API call:</p>
                <div class="code-block">
                    <pre><code>curl -X GET "https://api.tsmarthub.com/v1/integrations" \\
  -H "Authorization: Bearer YOUR_API_KEY"</code></pre>
                    <button class="copy-button" onclick="copyToClipboard('curl -X GET \"https://api.tsmarthub.com/v1/integrations\" \\\\ -H \"Authorization: Bearer YOUR_API_KEY\"')">Copy</button>
                </div>
            </div>

            <div class="section" id="authentication">
                <h2><i class="fas fa-shield-alt"></i> Authentication</h2>
                <p>All API requests require authentication using a Bearer token in the Authorization header.</p>

                <div class="alert warning">
                    <strong><i class="fas fa-exclamation-triangle"></i> Development Mode</strong><br>
                    For testing purposes, you can use the "Bypass Login" button to test APIs without authentication.
                </div>

                <h3>Authentication Methods</h3>
                <ul>
                    <li><strong>API Key:</strong> Include your API key in the Authorization header</li>
                    <li><strong>JWT Token:</strong> Use JWT tokens for user-specific operations</li>
                    <li><strong>OAuth 2.0:</strong> For third-party integrations</li>
                </ul>

                <div class="code-block">
                    <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
                    <button class="copy-button" onclick="copyToClipboard('Authorization: Bearer YOUR_API_KEY')">Copy</button>
                </div>
            </div>

            <div class="section" id="integrations">
                <h2><i class="fas fa-plug"></i> Integrations API</h2>
                <p>Manage integrations between different systems and platforms.</p>

                <div class="endpoint">
                    <div class="endpoint-header">
                        <div class="endpoint-title">
                            <span class="method get">GET</span>
                            <span class="endpoint-path">/integrations</span>
                        </div>
                        <button class="test-button" onclick="testEndpoint('/integrations', 'GET')">
                            <i class="fas fa-play"></i>
                            Test API
                        </button>
                    </div>
                    <div class="endpoint-content">
                        <div class="endpoint-description">
                            Retrieve a paginated list of all integrations for your account.
                        </div>

                        <div class="parameters">
                            <h4>Query Parameters</h4>
                            <table class="parameter-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>page</td>
                                        <td>integer</td>
                                        <td>No</td>
                                        <td>Page number (default: 1)</td>
                                    </tr>
                                    <tr>
                                        <td>limit</td>
                                        <td>integer</td>
                                        <td>No</td>
                                        <td>Items per page (default: 20, max: 100)</td>
                                    </tr>
                                    <tr>
                                        <td>status</td>
                                        <td>string</td>
                                        <td>No</td>
                                        <td>Filter by status (active, inactive, error)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="test-panel" id="test-panel-get-integrations" style="display: none;">
                            <h4>Test This Endpoint</h4>
                            <div class="test-form">
                                <div class="form-group">
                                    <label>Page</label>
                                    <input type="number" id="param-page" value="1" min="1">
                                </div>
                                <div class="form-group">
                                    <label>Limit</label>
                                    <input type="number" id="param-limit" value="20" min="1" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Status</label>
                                    <select id="param-status">
                                        <option value="">All</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                                <button class="test-button" onclick="executeTest('/integrations', 'GET', 'get-integrations')">
                                    <i class="fas fa-play"></i>
                                    Execute Request
                                </button>
                            </div>
                            <div id="test-result-get-integrations"></div>
                        </div>

                        <h4>Example Response</h4>
                        <div class="code-block">
                            <pre><code>{
  "integrations": [
    {
      "id": "int_1234567890",
      "name": "Shopify to Salesforce Sync",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "last_sync": "2024-01-20T14:22:00Z",
      "sync_count": 1247
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "has_more": true
  }
}</code></pre>
                            <button class="copy-button" onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy</button>
                        </div>
                    </div>
                </div>

                <div class="endpoint">
                    <div class="endpoint-header">
                        <div class="endpoint-title">
                            <span class="method post">POST</span>
                            <span class="endpoint-path">/integrations</span>
                        </div>
                        <button class="test-button" onclick="testEndpoint('/integrations', 'POST')">
                            <i class="fas fa-play"></i>
                            Test API
                        </button>
                    </div>
                    <div class="endpoint-content">
                        <div class="endpoint-description">
                            Create a new integration between two systems.
                        </div>

                        <div class="parameters">
                            <h4>Request Body</h4>
                            <table class="parameter-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>name</td>
                                        <td>string</td>
                                        <td>Yes</td>
                                        <td>Integration name</td>
                                    </tr>
                                    <tr>
                                        <td>source</td>
                                        <td>string</td>
                                        <td>Yes</td>
                                        <td>Source system identifier</td>
                                    </tr>
                                    <tr>
                                        <td>destination</td>
                                        <td>string</td>
                                        <td>Yes</td>
                                        <td>Destination system identifier</td>
                                    </tr>
                                    <tr>
                                        <td>config</td>
                                        <td>object</td>
                                        <td>No</td>
                                        <td>Integration configuration</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="test-panel" id="test-panel-post-integrations" style="display: none;">
                            <h4>Test This Endpoint</h4>
                            <div class="test-form">
                                <div class="form-group">
                                    <label>Request Body (JSON)</label>
                                    <textarea id="body-post-integrations">{
  "name": "Test Integration",
  "source": "shopify",
  "destination": "salesforce",
  "config": {
    "sync_frequency": "hourly",
    "field_mappings": {
      "customer_email": "email",
      "customer_name": "full_name"
    }
  }
}</textarea>
                                </div>
                                <button class="test-button" onclick="executeTest('/integrations', 'POST', 'post-integrations')">
                                    <i class="fas fa-play"></i>
                                    Execute Request
                                </button>
                            </div>
                            <div id="test-result-post-integrations"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section" id="webhooks">
                <h2><i class="fas fa-webhook"></i> Webhooks API</h2>
                <p>Configure webhooks to receive real-time notifications about integration events.</p>

                <div class="endpoint">
                    <div class="endpoint-header">
                        <div class="endpoint-title">
                            <span class="method get">GET</span>
                            <span class="endpoint-path">/webhooks</span>
                        </div>
                        <button class="test-button" onclick="testEndpoint('/webhooks', 'GET')">
                            <i class="fas fa-play"></i>
                            Test API
                        </button>
                    </div>
                    <div class="endpoint-content">
                        <div class="endpoint-description">
                            List all configured webhooks for your account.
                        </div>

                        <div class="test-panel" id="test-panel-get-webhooks" style="display: none;">
                            <h4>Test This Endpoint</h4>
                            <div class="test-form">
                                <button class="test-button" onclick="executeTest('/webhooks', 'GET', 'get-webhooks')">
                                    <i class="fas fa-play"></i>
                                    Execute Request
                                </button>
                            </div>
                            <div id="test-result-get-webhooks"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section" id="analytics">
                <h2><i class="fas fa-chart-bar"></i> Analytics API</h2>
                <p>Access detailed analytics and metrics for your integrations.</p>

                <div class="endpoint">
                    <div class="endpoint-header">
                        <div class="endpoint-title">
                            <span class="method get">GET</span>
                            <span class="endpoint-path">/analytics</span>
                        </div>
                        <button class="test-button" onclick="testEndpoint('/analytics', 'GET')">
                            <i class="fas fa-play"></i>
                            Test API
                        </button>
                    </div>
                    <div class="endpoint-content">
                        <div class="endpoint-description">
                            Get comprehensive analytics data for your integrations.
                        </div>

                        <div class="test-panel" id="test-panel-get-analytics" style="display: none;">
                            <h4>Test This Endpoint</h4>
                            <div class="test-form">
                                <button class="test-button" onclick="executeTest('/analytics', 'GET', 'get-analytics')">
                                    <i class="fas fa-play"></i>
                                    Execute Request
                                </button>
                            </div>
                            <div id="test-result-get-analytics"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section" id="errors">
                <h2><i class="fas fa-exclamation-triangle"></i> Error Handling</h2>
                <p>Understanding API error responses and status codes.</p>

                <h3>HTTP Status Codes</h3>
                <table class="parameter-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Status</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>200</td>
                            <td>OK</td>
                            <td>Request successful</td>
                        </tr>
                        <tr>
                            <td>201</td>
                            <td>Created</td>
                            <td>Resource created successfully</td>
                        </tr>
                        <tr>
                            <td>400</td>
                            <td>Bad Request</td>
                            <td>Invalid request parameters</td>
                        </tr>
                        <tr>
                            <td>401</td>
                            <td>Unauthorized</td>
                            <td>Authentication required</td>
                        </tr>
                        <tr>
                            <td>404</td>
                            <td>Not Found</td>
                            <td>Resource not found</td>
                        </tr>
                        <tr>
                            <td>500</td>
                            <td>Internal Server Error</td>
                            <td>Server error</td>
                        </tr>
                    </tbody>
                </table>

                <h3>Error Response Format</h3>
                <div class="code-block">
                    <pre><code>{
  "error": "validation_error",
  "message": "The request parameters are invalid",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}</code></pre>
                    <button class="copy-button" onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy</button>
                </div>
            </div>

            <div class="section" id="sdks">
                <h2><i class="fas fa-code"></i> SDKs and Libraries</h2>
                <p>Official SDKs are available for popular programming languages.</p>

                <div class="alert success">
                    <strong><i class="fas fa-check-circle"></i> Auto-Generated SDKs</strong><br>
                    All SDKs are automatically generated from our API specification and include full TypeScript support.
                </div>

                <h3>Available SDKs</h3>
                <ul>
                    <li><strong>JavaScript/TypeScript:</strong> <code>npm install @tsmarthub/sdk</code></li>
                    <li><strong>Python:</strong> <code>pip install tsmarthub-sdk</code></li>
                    <li><strong>PHP:</strong> <code>composer require tsmarthub/sdk</code></li>
                    <li><strong>Java:</strong> Maven and Gradle support available</li>
                    <li><strong>C#:</strong> NuGet package available</li>
                    <li><strong>Go:</strong> <code>go get github.com/tsmarthub/sdk-go</code></li>
                </ul>

                <h3>Quick Start Example (JavaScript)</h3>
                <div class="code-block">
                    <pre><code>import { TSmartHub } from '@tsmarthub/sdk';

const client = new TSmartHub({
  apiKey: 'your-api-key'
});

// List integrations
const integrations = await client.integrations.list();
console.log(integrations);

// Create a new integration
const newIntegration = await client.integrations.create({
  name: 'My Integration',
  source: 'shopify',
  destination: 'salesforce'
});</code></pre>
                    <button class="copy-button" onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script>
        let bypassToken = null;

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
                
                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Bypass login functionality
        async function bypassLogin() {
            try {
                const response = await fetch('/api/auth/bypass', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                if (data.success && data.token) {
                    bypassToken = data.token;
                    localStorage.setItem('bypass_token', data.token);
                    
                    // Update button
                    const button = document.querySelector('.bypass-login');
                    button.innerHTML = '<i class="fas fa-check"></i> Login Bypassed';
                    button.style.background = '#059669';
                    
                    showNotification('Authentication bypassed successfully! You can now test all APIs.', 'success');
                } else {
                    showNotification('Failed to bypass authentication. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Bypass login error:', error);
                showNotification('Failed to bypass authentication. Please try again.', 'error');
            }
        }

        // Test endpoint functionality
        function testEndpoint(endpoint, method) {
            const panelId = \`test-panel-\${method.toLowerCase()}-\${endpoint.replace('/', '').replace('/', '-')}\`;
            const panel = document.getElementById(panelId);
            
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        }

        async function executeTest(endpoint, method, testId) {
            const resultDiv = document.getElementById(\`test-result-\${testId}\`);
            const button = event.target;
            const originalText = button.innerHTML;
            
            // Show loading state
            button.innerHTML = '<div class="loading"><div class="spinner"></div> Testing...</div>';
            button.disabled = true;
            
            try {
                // Prepare request data
                const requestData = {
                    endpoint: endpoint,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': bypassToken ? \`Bearer \${bypassToken}\` : 'Bearer demo-token'
                    }
                };

                // Add parameters for GET requests
                if (method === 'GET' && testId.includes('integrations')) {
                    const page = document.getElementById('param-page')?.value;
                    const limit = document.getElementById('param-limit')?.value;
                    const status = document.getElementById('param-status')?.value;
                    
                    const params = new URLSearchParams();
                    if (page) params.append('page', page);
                    if (limit) params.append('limit', limit);
                    if (status) params.append('status', status);
                    
                    if (params.toString()) {
                        requestData.endpoint += '?' + params.toString();
                    }
                }

                // Add body for POST requests
                if (method === 'POST') {
                    const bodyTextarea = document.getElementById(\`body-\${testId}\`);
                    if (bodyTextarea) {
                        try {
                            requestData.body = JSON.parse(bodyTextarea.value);
                        } catch (e) {
                            throw new Error('Invalid JSON in request body');
                        }
                    }
                }

                // Make the test request
                const response = await fetch('/api/developer/documentation/test-api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const result = await response.json();
                
                if (result.success) {
                    displayTestResult(resultDiv, result.data);
                } else {
                    throw new Error(result.message || 'Test failed');
                }
                
            } catch (error) {
                console.error('Test error:', error);
                displayTestError(resultDiv, error.message);
            } finally {
                // Restore button
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }

        function displayTestResult(container, result) {
            const isSuccess = result.success;
            const statusClass = \`status-\${result.response.status}\`;
            
            container.innerHTML = \`
                <div class="test-result \${isSuccess ? 'success' : 'error'}">
                    <div class="result-header">
                        <div>
                            <span class="status-badge \${statusClass}">\${result.response.status} \${result.response.statusText}</span>
                            <span class="response-time">⚡ \${result.timing.duration.toFixed(0)}ms</span>
                        </div>
                    </div>
                    
                    <div class="tabs">
                        <button class="tab active" onclick="showTab(event, 'response-\${Date.now()}')">Response</button>
                        <button class="tab" onclick="showTab(event, 'headers-\${Date.now()}')">Headers</button>
                        <button class="tab" onclick="showTab(event, 'request-\${Date.now()}')">Request</button>
                    </div>
                    
                    <div id="response-\${Date.now()}" class="tab-content active">
                        <div class="code-block">
                            <pre><code>\${JSON.stringify(result.response.data || result.response.error, null, 2)}</code></pre>
                            <button class="copy-button" onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy</button>
                        </div>
                    </div>
                    
                    <div id="headers-\${Date.now()}" class="tab-content">
                        <div class="code-block">
                            <pre><code>\${JSON.stringify(result.response.headers, null, 2)}</code></pre>
                            <button class="copy-button" onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy</button>
                        </div>
                    </div>
                    
                    <div id="request-\${Date.now()}" class="tab-content">
                        <div class="code-block">
                            <pre><code>\${JSON.stringify(result.request, null, 2)}</code></pre>
                            <button class="copy-button" onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy</button>
                        </div>
                    </div>
                </div>
            \`;
        }

        function displayTestError(container, error) {
            container.innerHTML = \`
                <div class="test-result error">
                    <div class="result-header">
                        <span class="status-badge status-500">Error</span>
                    </div>
                    <p><strong>Error:</strong> \${error}</p>
                </div>
            \`;
        }

        function showTab(event, tabId) {
            const container = event.target.closest('.test-result');
            
            // Hide all tab contents
            container.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            container.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Copy failed:', err);
                showNotification('Failed to copy to clipboard', 'error');
            });
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = \`alert \${type}\`;
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '1000';
            notification.style.minWidth = '300px';
            notification.innerHTML = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Check for existing bypass token
            const savedToken = localStorage.getItem('bypass_token');
            if (savedToken) {
                bypassToken = savedToken;
                const button = document.querySelector('.bypass-login');
                button.innerHTML = '<i class="fas fa-check"></i> Login Bypassed';
                button.style.background = '#059669';
            }
            
            // Highlight code blocks
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        });
    </script>
</body>
</html>`
}
