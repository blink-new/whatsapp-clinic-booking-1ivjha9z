import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Settings, 
  Phone, 
  Users,
  BarChart3,
  Plus,
  Search,
  Filter,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SMSChat } from './SMSChat'
import { SMSSettings } from './SMSSettings'
import { SMSIntegrationGuide } from './SMSIntegrationGuide'
import { blink } from '@/blink/client'
import { format } from 'date-fns'

interface SMSStats {
  totalMessages: number
  todayMessages: number
  activeContacts: number
  deliveryRate: number
}

export function SMSIntegration() {
  const [activeTab, setActiveTab] = useState('guide')
  const [stats, setStats] = useState<SMSStats>({
    totalMessages: 0,
    todayMessages: 0,
    activeContacts: 0,
    deliveryRate: 0
  })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current user
    blink.auth.me().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (user) {
      loadSMSStats()
    }
  }, [user])

  const loadSMSStats = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Mock stats for now - in real app, load from database
      setStats({
        totalMessages: 156,
        todayMessages: 12,
        activeContacts: 23,
        deliveryRate: 98.5
      })
    } catch (error) {
      console.error('Error loading SMS stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+15%'
    },
    {
      title: 'Today\'s Messages',
      value: stats.todayMessages,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3'
    },
    {
      title: 'Active Contacts',
      value: stats.activeContacts,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+2'
    },
    {
      title: 'Delivery Rate',
      value: `${stats.deliveryRate}%`,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+0.5%'
    }
  ]

  if (activeTab === 'messages') {
    return <SMSChat />
  }

  if (activeTab === 'settings') {
    return <SMSSettings />
  }

  if (activeTab === 'guide') {
    return <SMSIntegrationGuide />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Integration</h1>
          <p className="text-gray-600">Manage SMS communication with your patients</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Settings className="w-3 h-3 mr-1" />
            Setup Required
          </Badge>
          <Button onClick={() => setActiveTab('guide')} variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            Setup Guide
          </Button>
          <Button onClick={() => setActiveTab('settings')} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setActiveTab('messages')} className="bg-blue-500 hover:bg-blue-600">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {loading ? (
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            stat.value
                          )}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-green-600">{stat.change}</span>
                          <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Messages */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent SMS Messages</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('messages')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  [
                    {
                      id: '1',
                      contact: 'John Smith',
                      phone: '+1234567890',
                      message: 'Can I reschedule my appointment?',
                      timestamp: new Date(),
                      type: 'incoming'
                    },
                    {
                      id: '2',
                      contact: 'Maria Garcia',
                      phone: '+1234567891',
                      message: 'Thank you for the reminder',
                      timestamp: new Date(Date.now() - 3600000),
                      type: 'incoming'
                    },
                    {
                      id: '3',
                      contact: 'David Wilson',
                      phone: '+1234567892',
                      message: 'Your appointment is confirmed for tomorrow at 2 PM',
                      timestamp: new Date(Date.now() - 7200000),
                      type: 'outgoing'
                    }
                  ].map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'incoming' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Phone className={`w-4 h-4 ${
                          message.type === 'incoming' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{message.contact}</h4>
                          <span className="text-xs text-gray-500">
                            {format(message.timestamp, 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{message.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{message.phone}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600"
                  onClick={() => setActiveTab('guide')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Setup SMS Integration
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('messages')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS Message
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('contacts')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Contacts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  SMS Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SMS Provider Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-500" />
                SMS Provider Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-orange-800">Setup Required</p>
                    <p className="text-sm text-orange-600">Configure your SMS provider to start sending messages</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('guide')}
                >
                  Setup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">SMS Contacts</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search contacts..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', phone: '+1234567890', lastMessage: '2 hours ago', status: 'active' },
                  { name: 'Maria Garcia', phone: '+1234567891', lastMessage: '1 day ago', status: 'active' },
                  { name: 'David Wilson', phone: '+1234567892', lastMessage: '3 days ago', status: 'active' },
                  { name: 'Lisa Brown', phone: '+1234567893', lastMessage: '1 week ago', status: 'inactive' }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last message</p>
                        <p className="text-xs text-gray-500">{contact.lastMessage}</p>
                      </div>
                      <Badge 
                        className={contact.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                      >
                        {contact.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
