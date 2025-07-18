import { 
  Phone, 
  MessageSquare, 
  Settings, 
  Key, 
  Globe, 
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Code,
  Webhook,
  Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SMSIntegrationGuide() {
  const providers = [
    {
      name: 'Twilio',
      description: 'Most popular SMS service with excellent reliability',
      pricing: 'Starting at $0.0075 per SMS',
      features: ['Global coverage', 'Delivery receipts', 'Two-way messaging', 'Phone number rental'],
      setupUrl: 'https://console.twilio.com/',
      difficulty: 'Easy'
    },
    {
      name: 'AWS SNS',
      description: 'Amazon\'s notification service, great for existing AWS users',
      pricing: 'Starting at $0.0075 per SMS',
      features: ['AWS integration', 'Scalable', 'Pay-as-you-go', 'Global reach'],
      setupUrl: 'https://console.aws.amazon.com/sns/',
      difficulty: 'Medium'
    },
    {
      name: 'MessageBird',
      description: 'European provider with competitive rates',
      pricing: 'Starting at $0.0065 per SMS',
      features: ['European focus', 'GDPR compliant', 'Voice & SMS', 'Omnichannel'],
      setupUrl: 'https://dashboard.messagebird.com/',
      difficulty: 'Easy'
    }
  ]

  const integrationSteps = [
    {
      step: 1,
      title: 'Choose SMS Provider',
      description: 'Select and sign up for an SMS service provider',
      icon: Phone,
      details: [
        'Compare pricing and features',
        'Consider your geographic coverage needs',
        'Check delivery rates and reliability',
        'Review API documentation'
      ]
    },
    {
      step: 2,
      title: 'Get API Credentials',
      description: 'Obtain API keys and configure your account',
      icon: Key,
      details: [
        'Create API keys in provider dashboard',
        'Purchase or rent a phone number',
        'Configure webhook endpoints',
        'Test API connectivity'
      ]
    },
    {
      step: 3,
      title: 'Configure Integration',
      description: 'Set up SMS settings in your clinic app',
      icon: Settings,
      details: [
        'Enter API credentials securely',
        'Configure business hours',
        'Set up auto-reply messages',
        'Create message templates'
      ]
    },
    {
      step: 4,
      title: 'Test & Deploy',
      description: 'Test the integration and go live',
      icon: CheckCircle,
      details: [
        'Send test messages',
        'Verify delivery receipts',
        'Test incoming message handling',
        'Monitor message logs'
      ]
    }
  ]

  const features = [
    {
      title: 'Two-Way Messaging',
      description: 'Send and receive SMS messages with patients',
      icon: MessageSquare
    },
    {
      title: 'Appointment Booking',
      description: 'Allow patients to book appointments via SMS',
      icon: Phone
    },
    {
      title: 'Automated Reminders',
      description: 'Send automatic appointment reminders',
      icon: Settings
    },
    {
      title: 'Message Templates',
      description: 'Pre-built templates for common scenarios',
      icon: Code
    },
    {
      title: 'Delivery Tracking',
      description: 'Track message delivery status',
      icon: CheckCircle
    },
    {
      title: 'Business Hours',
      description: 'Respect business hours for automated messages',
      icon: Globe
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Integration Guide</h1>
          <p className="text-lg text-gray-600 mt-2">
            Connect your clinic with patients through SMS messaging
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Why Use SMS for Your Clinic?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Patient Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Instant appointment confirmations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Convenient rescheduling via text
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Automatic appointment reminders
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      No app downloads required
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Clinic Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Reduce no-shows with reminders
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Automate routine communications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Improve patient satisfaction
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Cost-effective communication
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {providers.map((provider, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <Badge variant={provider.difficulty === 'Easy' ? 'default' : 'secondary'}>
                      {provider.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Pricing</p>
                    <p className="text-sm text-gray-600">{provider.pricing}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Features</p>
                    <ul className="space-y-1">
                      {provider.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.open(provider.setupUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Setup Guide */}
        <TabsContent value="setup" className="space-y-6">
          <div className="space-y-8">
            {integrationSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">Step {step.step}</Badge>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <ul className="space-y-1">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <ArrowRight className="w-3 h-3 text-gray-400 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Technical */}
        <TabsContent value="technical" className="space-y-6">
          <Alert>
            <Database className="w-4 h-4" />
            <AlertDescription>
              This integration requires database tables for storing SMS messages, settings, and contacts. 
              The system will automatically create these tables when you configure your first SMS provider.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  API Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Required Tables</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• sms_messages - Store all SMS communications</li>
                    <li>• sms_settings - Provider configuration</li>
                    <li>• sms_contacts - Patient contact information</li>
                    <li>• sms_templates - Reusable message templates</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Security Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• API keys stored securely using Blink Vault</li>
                    <li>• All API calls proxied through secure endpoints</li>
                    <li>• Message encryption in transit</li>
                    <li>• HIPAA-compliant data handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="w-5 h-5 mr-2" />
                  Webhook Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Incoming Messages</h4>
                  <p className="text-sm text-gray-600">
                    Configure your SMS provider to send incoming messages to:
                  </p>
                  <code className="block p-2 bg-gray-100 rounded text-xs">
                    https://your-app.com/webhook/sms/incoming
                  </code>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Delivery Receipts</h4>
                  <p className="text-sm text-gray-600">
                    Track message delivery status with:
                  </p>
                  <code className="block p-2 bg-gray-100 rounded text-xs">
                    https://your-app.com/webhook/sms/status
                  </code>
                </div>
                
                <Alert>
                  <AlertDescription className="text-xs">
                    Webhooks are automatically configured when you set up your SMS provider in the settings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Sample Code */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Integration Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sending SMS with Twilio</h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`// Using Blink's secure API proxy
const response = await blink.data.fetch({
  url: 'https://api.twilio.com/2010-04-01/Accounts/{{twilio_account_sid}}/Messages.json',
  method: 'POST',
  headers: {
    'Authorization': 'Basic {{twilio_auth_token_base64}}',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    From: '+1234567890',
    To: patientPhone,
    Body: 'Your appointment is confirmed for tomorrow at 2 PM'
  }).toString()
})`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Processing Incoming Messages</h4>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`// Webhook handler for incoming SMS
export async function handleIncomingSMS(request) {
  const { From, Body } = await request.json()
  
  // Save message to database
  await blink.db.sms_messages.create({
    from: From,
    to: 'clinic',
    message: Body,
    type: 'incoming',
    timestamp: new Date().toISOString()
  })
  
  // Process for appointment booking
  if (Body.toLowerCase().includes('appointment')) {
    await sendAutoReply(From, 'Thank you! We\\'ll contact you shortly.')
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
