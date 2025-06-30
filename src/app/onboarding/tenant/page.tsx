"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Building2, Users, Settings, Rocket } from "lucide-react"

const steps = [
  { id: 1, title: "Company Information", icon: Building2 },
  { id: 2, title: "Team Setup", icon: Users },
  { id: 3, title: "Configuration", icon: Settings },
  { id: 4, title: "Launch", icon: Rocket },
]

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/month",
    features: ["5 Integrations", "10K API Calls", "5 Team Members", "Basic Support"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99/month",
    features: ["25 Integrations", "100K API Calls", "25 Team Members", "Priority Support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited Integrations", "Unlimited API Calls", "Unlimited Users", "24/7 Support"],
  },
]

export default function TenantOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    companySlug: "",
    companySubdomain: "",
    industry: "",
    companySize: "",
    description: "",
    teamMembers: [""],
    selectedPlan: "starter",
    timezone: "UTC",
    currency: "USD",
  })

  const router = useRouter()
  const progress = (currentStep / steps.length) * 100

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleCompanyNameChange = (name: string) => {
    handleInputChange("companyName", name)
    if (!formData.companySlug) {
      const slug = generateSlugFromName(name)
      handleInputChange("companySlug", slug)
      handleInputChange("companySubdomain", slug)
    }
  }

  const addTeamMember = () => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, ""],
    }))
  }

  const removeTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }))
  }

  const updateTeamMember = (index: number, email: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => (i === index ? email : member)),
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    try {
      setIsLoading(true)

      // Simulate tenant creation
      console.log("Creating tenant with data:", formData)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to dashboard
      router.push("/dashboard?onboarding=complete")
    } catch (error) {
      console.error("Onboarding error:", error)
      alert("Failed to complete onboarding. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tell us about your company</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companySlug">URL Slug *</Label>
                  <div className="flex">
                    <Input
                      id="companySlug"
                      value={formData.companySlug}
                      onChange={(e) => handleInputChange("companySlug", e.target.value)}
                      placeholder="acme-corp"
                      required
                    />
                    <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 rounded-r-md">
                      .tsmarthub.com
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) => handleInputChange("companySize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
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
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of your company..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Invite your team</h3>
              <p className="text-gray-600 mb-4">Add team members who will have access to your TSmart Hub workspace.</p>

              <div className="space-y-3">
                {formData.teamMembers.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateTeamMember(index, e.target.value)}
                      placeholder="colleague@company.com"
                      className="flex-1"
                    />
                    {formData.teamMembers.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTeamMember(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addTeamMember} className="w-full">
                  Add Another Team Member
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Team members will receive an invitation email to join your workspace.
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose your plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      formData.selectedPlan === plan.id
                        ? "ring-2 ring-blue-500 border-blue-500"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("selectedPlan", plan.id)}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-blue-600">{plan.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">You're all set!</h3>
              <p className="text-gray-600 mb-6">Your TSmart Hub workspace is ready. Here's what happens next:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">🚀 Access Your Dashboard</h4>
                    <p className="text-sm text-gray-600">
                      Start exploring your new workspace and set up your first integration.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">📧 Team Invitations</h4>
                    <p className="text-sm text-gray-600">
                      Your team members will receive invitation emails to join your workspace.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">🔑 API Keys</h4>
                    <p className="text-sm text-gray-600">
                      Generate your first API keys to start integrating with your applications.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">📚 Documentation</h4>
                    <p className="text-sm text-gray-600">
                      Check out our comprehensive guides to get the most out of TSmart Hub.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your workspace URL:</strong> https://{formData.companySubdomain}.tsmarthub.com
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TSmart Hub</h1>
          <p className="text-gray-600">Let's set up your workspace in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="h-6 w-6" /> : <step.icon className="h-5 w-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Step {currentStep} of {steps.length}
              </Badge>
              <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={(currentStep === 1 && (!formData.companyName || !formData.companySlug)) || isLoading}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? "Setting up..." : "Launch Workspace"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
