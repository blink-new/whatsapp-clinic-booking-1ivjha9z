import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Search,
  Calendar,
  User,
  MoreVertical,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import type { SMSMessage, SMSContact } from '@/types'

// Mock data for demonstration
const mockSMSContacts: SMSContact[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1234567890',
    lastMessage: 'Can I reschedule my appointment?',
    timestamp: '2024-01-17T15:30:00Z',
    unread: 1,
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    phone: '+1234567891',
    lastMessage: 'Thank you for the reminder',
    timestamp: '2024-01-17T14:15:00Z',
    unread: 0,
    status: 'active'
  },
  {
    id: '3',
    name: 'David Wilson',
    phone: '+1234567892',
    lastMessage: 'What documents should I bring?',
    timestamp: '2024-01-17T13:45:00Z',
    unread: 2,
    status: 'active'
  },
  {
    id: '4',
    name: 'Lisa Brown',
    phone: '+1234567893',
    lastMessage: 'Appointment confirmed for tomorrow',
    timestamp: '2024-01-17T12:30:00Z',
    unread: 0,
    status: 'active'
  }
]

const mockSMSMessages: SMSMessage[] = [
  {
    id: '1',
    from: '+1234567890',
    to: 'clinic',
    message: 'Hi, I received your reminder about my appointment tomorrow. Can I reschedule it?',
    timestamp: '2024-01-17T15:00:00Z',
    type: 'incoming',
    status: 'delivered'
  },
  {
    id: '2',
    from: 'clinic',
    to: '+1234567890',
    message: 'Hello John! Of course, I can help you reschedule. What day and time would work better for you?',
    timestamp: '2024-01-17T15:05:00Z',
    type: 'outgoing',
    status: 'delivered'
  },
  {
    id: '3',
    from: '+1234567890',
    to: 'clinic',
    message: 'How about Friday at 2 PM?',
    timestamp: '2024-01-17T15:10:00Z',
    type: 'incoming',
    status: 'delivered'
  },
  {
    id: '4',
    from: 'clinic',
    to: '+1234567890',
    message: 'Perfect! I have you scheduled for Friday, January 19th at 2:00 PM with Dr. Smith. You will receive a confirmation shortly.',
    timestamp: '2024-01-17T15:12:00Z',
    type: 'outgoing',
    status: 'delivered'
  },
  {
    id: '5',
    from: '+1234567890',
    to: 'clinic',
    message: 'Can I reschedule my appointment?',
    timestamp: '2024-01-17T15:30:00Z',
    type: 'incoming',
    status: 'delivered'
  }
]

export function SMSChat() {
  const [selectedContact, setSelectedContact] = useState<SMSContact>(mockSMSContacts[0])
  const [messages, setMessages] = useState<SMSMessage[]>(mockSMSMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: SMSMessage = {
      id: Date.now().toString(),
      from: 'clinic',
      to: selectedContact.phone,
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'outgoing',
      status: 'sent'
    }

    setMessages([...messages, message])
    setNewMessage('')

    // Simulate delivery status update
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredContacts = mockSMSContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  )

  const quickReplies = [
    'Your appointment is confirmed.',
    'Please arrive 15 minutes early.',
    'We need to reschedule your appointment.',
    'What type of service do you need?',
    'Thank you for contacting our clinic.',
    'Your appointment reminder: Tomorrow at [TIME]'
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-gray-50">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">SMS Messages</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">SMS Active</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-blue-600">{mockSMSContacts.length}</p>
              <p className="text-xs text-gray-500">Contacts</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {mockSMSContacts.reduce((sum, contact) => sum + contact.unread, 0)}
              </p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-purple-600">{messages.length}</p>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact.id === contact.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500">
                      {format(new Date(contact.timestamp), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    {contact.unread > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {contact.unread}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <Phone className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {selectedContact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">SMS Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" title="Schedule Appointment">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" title="View Patient Profile">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Call Patient">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  message.type === 'outgoing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="flex items-center justify-end mt-2 space-x-1">
                  <span className={`text-xs ${
                    message.type === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>
                  {message.type === 'outgoing' && (
                    <div className="ml-1">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Quick Replies</span>
            <Button variant="ghost" size="sm" className="text-xs">
              Manage Templates
            </Button>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs flex-shrink-0"
                onClick={() => setNewMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                placeholder="Type your SMS message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-32 resize-none"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newMessage.length}/160 characters
                  {newMessage.length > 160 && (
                    <span className="text-orange-500 ml-1">
                      ({Math.ceil(newMessage.length / 160)} SMS)
                    </span>
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Template
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              className="bg-blue-500 hover:bg-blue-600 px-6"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
