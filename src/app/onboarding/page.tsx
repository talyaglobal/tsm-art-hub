"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Building, Settings, CheckCircle, ArrowRight, ArrowLeft, Rocket } from "lucide-react"

interface OnboardingData {
  personal: {
    name: string
    email: string
    role: string
    department: string
  }
  company: {
    name: string
    size: string
    industry: string
    description: string
  }
  preferences: {
    notifications: boolean
    analytics: boolean
    integrations: string[]
    features: string[]
  }
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    personal: { name: "", email: "", role: "", department: "" },
    company: { name: "", size: "", industry: "", description: "" },
    preferences: { notifications: true, analytics: true, integrations: [], features: [] },
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const integrationOptions = [
    { id: "slack", name: "Slack", description: "Team communication" },
    { id: "github", name: "GitHub", description: "Code repository" },
    { id: "jira", name: "Jira", description: "Project management" },
    { id: "aws", name: "AWS", description: "Cloud services" },
    { id: "docker", name: "Docker", description: "Containerization" },
    { id: "kubernetes", name: "Kubernetes", description: "Container orchestration" },
  ]

  const featureOptions = [
    { id: "api-management", name: "API Management", description: "Manage and monitor APIs" },
    { id: "analytics", name: "Analytics Dashboard", description: "Track performance metrics" },
    { id: "user-management", name: "User Management", description: "Manage team members" },
    { id: "security", name: "Security Monitoring", description: "Monitor security events" },
    { id: "integrations", name: "Third-party Integrations", description: "Connect external services" },
    { id: "automation", name: "Workflow Automation", description: "Automate repetitive tasks" },
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Handle onboarding completion
    console.log("Onboarding completed:", data)
    window.location.href = "/dashboard"
  }

  const updatePersonal = (field: keyof OnboardingData["personal"], value: string) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }))
  }

  const updateCompany = (field: keyof OnboardingData["company"], value: string) => {
    setData((prev) => ({
      ...prev,
      company: { ...prev.company, [field]: value },
    }))
  }

  const updatePreferences = (field: keyof OnboardingData["preferences"], value: any) => {
    setData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value },
    }))
  }

  const toggleIntegration = (integrationId: string) => {
    const current = data.preferences.integrations
    const updated = current.includes(integrationId)
      ? current.filter((id) => id !== integrationId)
      : [...current, integrationId]
    updatePreferences("integrations", updated)
  }

  const toggleFeature = (featureId: string) => {
    const current = data.preferences.features
    const updated = current.includes(featureId) ? current.filter((id) => id !== featureId) : [...current, featureId]
    updatePreferences("features", updated)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TSmart Hub</h1>
          <p className="text-gray-600">Let's get you set up in just a few steps</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Tell us about yourself to personalize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={data.personal.name}
                      onChange={(e) => updatePersonal("name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.personal.email}
                      onChange={(e) => updatePersonal("email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={data.personal.role} onValueChange={(value) => updatePersonal("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="architect">Solution Architect</SelectItem>
                        <SelectItem value="manager">Engineering Manager</SelectItem>
                        <SelectItem value="devops">DevOps Engineer</SelectItem>
                        <SelectItem value="admin">System Administrator</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={data.personal.department}
                      onValueChange={(value) => updatePersonal("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="data">Data & Analytics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Building className="h-6 w-6 text-blue-600" />
                  <CardTitle>Company Information</CardTitle>
                </div>
                <CardDescription>Help us understand your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={data.company.name}
                    onChange={(e) => updateCompany("name", e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-size">Company Size</Label>
                    <Select value={data.company.size} onValueChange={(value) => updateCompany("size", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={data.company.industry} onValueChange={(value) => updateCompany("industry", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Company Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={data.company.description}
                    onChange={(e) => updateCompany("description", e.target.value)}
                    placeholder="Brief description of your company"
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <CardTitle>Integrations & Features</CardTitle>
                </div>
                <CardDescription>Choose the integrations and features you'd like to enable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Popular Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {integrationOptions.map((integration) => (
                      <div
                        key={integration.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          data.preferences.integrations.includes(integration.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleIntegration(integration.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                          <Checkbox checked={data.preferences.integrations.includes(integration.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Platform Features</h3>
                  <div className="space-y-3">
                    {featureOptions.map((feature) => (
                      <div
                        key={feature.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          data.preferences.features.includes(feature.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                          <Checkbox checked={data.preferences.features.includes(feature.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <CardTitle>Review & Complete</CardTitle>
                </div>
                <CardDescription>Review your setup and complete the onboarding process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Personal Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Name:</span> {data.personal.name}
                      </p>
                      <p>
                        <span className="text-gray-600">Email:</span> {data.personal.email}
                      </p>
                      <p>
                        <span className="text-gray-600">Role:</span> {data.personal.role}
                      </p>
                      <p>
                        <span className="text-gray-600">Department:</span> {data.personal.department}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Company Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Company:</span> {data.company.name}
                      </p>
                      <p>
                        <span className="text-gray-600">Size:</span> {data.company.size}
                      </p>
                      <p>
                        <span className="text-gray-600">Industry:</span> {data.company.industry}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Selected Integrations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.preferences.integrations.map((id) => {
                      const integration = integrationOptions.find((i) => i.id === id)
                      return (
                        <Badge key={id} variant="outline">
                          {integration?.name}
                        </Badge>
                      )
                    })}
                    {data.preferences.integrations.length === 0 && (
                      <p className="text-sm text-gray-500">No integrations selected</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <Rocket className="h-4 w-4 mr-2" />
                    Enabled Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.preferences.features.map((id) => {
                      const feature = featureOptions.find((f) => f.id === id)
                      return (
                        <Badge key={id} variant="outline">
                          {feature?.name}
                        </Badge>
                      )
                    })}
                    {data.preferences.features.length === 0 && (
                      <p className="text-sm text-gray-500">No features selected</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Rocket className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Ready to get started!</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your TSmart Hub workspace is configured and ready. You can always modify these settings later
                        from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${index + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
