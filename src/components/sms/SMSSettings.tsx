import { useState, useEffect } from 'react'
import { 
  Settings, 
  Phone, 
  Key, 
  Globe, 
  Clock, 
  MessageSquare,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { SMSSettings } from '@/types'

const SMS_PROVIDERS = [
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Popular SMS service with global coverage',
    setupUrl: 'https://console.twilio.com/',
    fields: ['Account SID', 'Auth Token', 'Phone Number']
  },
  {
    id: 'aws_sns',
    name: 'AWS SNS',
    description: 'Amazon Simple Notification Service',
    setupUrl: 'https://console.aws.amazon.com/sns/',
    fields: ['Access Key ID', 'Secret Access Key', 'Region']
  },
  {
    id: 'messagebird',
    name: 'MessageBird',
    description: 'European SMS provider with competitive rates',
    setupUrl: 'https://dashboard.messagebird.com/',
    fields: ['API Key', 'Originator']
  }
]

const TIMEZONES = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
]

export function SMSSettings() {
  const [settings, setSettings] = useState<SMSSettings>({
    id: '1',
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    fromNumber: '',
    webhookUrl: '',
    isActive: false,
    autoReply: true,
    businessHours: {
      enabled: true,
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user1'
  })
  const [testMessage, setTestMessage] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'testing'>('disconnected')

  const selectedProvider = SMS_PROVIDERS.find(p => p.id === settings.provider)

  const handleSaveSettings = async () => {
    try {
      // Here you would save to your backend/database
      toast.success('SMS settings saved successfully!')
      setConnectionStatus('connected')
    } catch (error) {
      toast.error('Failed to save SMS settings')
    }
  }

  const handleTestConnection = async () => {
    if (!testPhone || !testMessage) {
      toast.error('Please enter both phone number and test message')
      return
    }

    setIsTesting(true)
    setConnectionStatus('testing')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Test SMS sent to ${testPhone}!`)
      setConnectionStatus('connected')
    } catch (error) {
      toast.error('Failed to send test SMS')
      setConnectionStatus('disconnected')
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )
      case 'testing':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <TestTube className="w-3 h-3 mr-1" />
            Testing
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Settings</h1>
          <p className="text-gray-600">Configure SMS integration for appointment booking and patient communication</p>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge()}
          <Button onClick={handleSaveSettings} className="bg-blue-500 hover:bg-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="provider" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="provider">Provider Setup</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Provider Setup */}
        <TabsContent value="provider" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-500" />
                SMS Provider Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-3">
                <Label htmlFor="provider">SMS Provider</Label>
                <Select 
                  value={settings.provider} 
                  onValueChange={(value: any) => setSettings({...settings, provider: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SMS provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {SMS_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{provider.name}</span>
                          <span className="text-sm text-gray-500">{provider.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProvider && (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Get your API credentials from{' '}
                      <a 
                        href={selectedProvider.setupUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProvider.name} Console
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* API Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">
                    {settings.provider === 'twilio' ? 'Account SID' : 'API Key'}
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                    placeholder="Enter your API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">
                    {settings.provider === 'twilio' ? 'Auth Token' : 'API Secret'}
                  </Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={settings.apiSecret}
                    onChange={(e) => setSettings({...settings, apiSecret: e.target.value})}
                    placeholder="Enter your API secret"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromNumber">From Phone Number</Label>
                <Input
                  id="fromNumber"
                  value={settings.fromNumber}
                  onChange={(e) => setSettings({...settings, fromNumber: e.target.value})}
                  placeholder="+1234567890"
                />
                <p className="text-sm text-gray-500">
                  The phone number that SMS messages will be sent from
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                  placeholder="https://your-app.com/webhook/sms"
                />
                <p className="text-sm text-gray-500">
                  URL to receive incoming SMS messages and delivery receipts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Settings */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-500" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable SMS Service</Label>
                  <p className="text-sm text-gray-500">Allow sending and receiving SMS messages</p>
                </div>
                <Switch 
                  checked={settings.isActive}
                  onCheckedChange={(checked) => setSettings({...settings, isActive: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Reply</Label>
                  <p className="text-sm text-gray-500">Automatically respond to incoming messages</p>
                </div>
                <Switch 
                  checked={settings.autoReply}
                  onCheckedChange={(checked) => setSettings({...settings, autoReply: checked})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Business Hours</Label>
                    <p className="text-sm text-gray-500">Only send automated messages during business hours</p>
                  </div>
                  <Switch 
                    checked={settings.businessHours.enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings, 
                      businessHours: {...settings.businessHours, enabled: checked}
                    })}
                  />
                </div>

                {settings.businessHours.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={settings.businessHours.start}
                        onChange={(e) => setSettings({
                          ...settings,
                          businessHours: {...settings.businessHours, start: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={settings.businessHours.end}
                        onChange={(e) => setSettings({
                          ...settings,
                          businessHours: {...settings.businessHours, end: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select 
                        value={settings.businessHours.timezone}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          businessHours: {...settings.businessHours, timezone: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
                SMS Message Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Create reusable SMS templates for common scenarios. Use variables like {'{name}'}, {'{date}'}, {'{time}'} for personalization.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Appointment Confirmation</h4>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Hi {'{name}'}, your appointment with Dr. {'{doctor}'} is confirmed for {'{date}'} at {'{time}'}. Please arrive 15 minutes early.
                  </p>
                  <Badge variant="secondary">Active</Badge>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Appointment Reminder</h4>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Reminder: You have an appointment tomorrow at {'{time}'} with Dr. {'{doctor}'}. Reply CONFIRM to confirm or RESCHEDULE to change.
                  </p>
                  <Badge variant="secondary">Active</Badge>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Welcome Message</h4>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Thank you for contacting our clinic! We'll respond to your message during business hours (9 AM - 5 PM).
                  </p>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Create New Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-orange-500" />
                Test SMS Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Send a test SMS to verify your configuration is working correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Test Phone Number</Label>
                  <Input
                    id="testPhone"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testMessage">Test Message</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="This is a test message from your clinic SMS system."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {testMessage.length}/160 characters
                  </p>
                </div>

                <Button 
                  onClick={handleTestConnection}
                  disabled={isTesting || !testPhone || !testMessage}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending Test SMS...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Send Test SMS
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
