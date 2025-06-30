"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, ArrowLeft, Paperclip, Users, User, AtSign, X } from "lucide-react"
import Link from "next/link"

interface Recipient {
  id: string
  name: string
  email: string
  type: "user" | "group"
}

export default function ComposeMessagePage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [recipientInput, setRecipientInput] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [attachments, setAttachments] = useState<File[]>([])

  const availableRecipients: Recipient[] = [
    { id: "1", name: "John Doe", email: "john@company.com", type: "user" },
    { id: "2", name: "Jane Smith", email: "jane@company.com", type: "user" },
    { id: "3", name: "Mike Johnson", email: "mike@company.com", type: "user" },
    { id: "4", name: "Engineering Team", email: "engineering@company.com", type: "group" },
    { id: "5", name: "Marketing Team", email: "marketing@company.com", type: "group" },
  ]

  const addRecipient = (recipient: Recipient) => {
    if (!recipients.find((r) => r.id === recipient.id)) {
      setRecipients([...recipients, recipient])
    }
    setRecipientInput("")
  }

  const removeRecipient = (recipientId: string) => {
    setRecipients(recipients.filter((r) => r.id !== recipientId))
  }

  const handleSend = () => {
    // Handle message sending logic
    console.log("Sending message:", { recipients, subject, message, priority, attachments })
  }

  const filteredRecipients = availableRecipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(recipientInput.toLowerCase()) ||
      recipient.email.toLowerCase().includes(recipientInput.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/messages">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compose Message</h1>
          <p className="text-gray-600">Send a new message to users or groups</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
          <CardDescription>Compose and send a message to team members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipients */}
          <div>
            <Label htmlFor="recipients">To</Label>
            <div className="space-y-2">
              {/* Selected Recipients */}
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
                  {recipients.map((recipient) => (
                    <Badge key={recipient.id} variant="secondary" className="flex items-center space-x-1">
                      {recipient.type === "group" ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      <span>{recipient.name}</span>
                      <button
                        onClick={() => removeRecipient(recipient.id)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Recipient Input */}
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="recipients"
                  placeholder="Type to search users or groups..."
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  className="pl-10"
                />

                {/* Dropdown with suggestions */}
                {recipientInput && filteredRecipients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredRecipients.map((recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => addRecipient(recipient)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        {recipient.type === "group" ? (
                          <Users className="h-4 w-4 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 text-green-600" />
                        )}
                        <div>
                          <div className="font-medium">{recipient.name}</div>
                          <div className="text-sm text-gray-600">{recipient.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Paperclip className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Drag and drop files here, or click to browse</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose Files
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAttachments(attachments.filter((_, i) => i !== index))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline">Save Draft</Button>
              <Button variant="outline">Schedule</Button>
            </div>
            <div className="flex space-x-2">
              <Link href="/messages">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSend} disabled={recipients.length === 0 || !subject.trim() || !message.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Quick templates for common messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Meeting Invitation",
                description: "Invite team members to a meeting",
                template: "You're invited to join our upcoming meeting...",
              },
              {
                title: "Project Update",
                description: "Share project progress and updates",
                template: "Here's the latest update on our project...",
              },
              {
                title: "Announcement",
                description: "Make important announcements",
                template: "We're excited to announce...",
              },
              {
                title: "Welcome Message",
                description: "Welcome new team members",
                template: "Welcome to the team! We're excited to have you...",
              },
            ].map((template, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSubject(template.title)
                  setMessage(template.template)
                }}
              >
                <h4 className="font-medium">{template.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
