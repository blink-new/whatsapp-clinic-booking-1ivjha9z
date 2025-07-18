import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Calendar,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { WhatsAppMessage } from '@/types'

// Mock data for demonstration
const mockContacts = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '+1234567890',
    lastMessage: 'I need to reschedule my appointment',
    timestamp: '2024-01-17T14:30:00Z',
    unread: 2,
    avatar: null
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '+1234567891',
    lastMessage: 'Thank you for the confirmation',
    timestamp: '2024-01-17T13:15:00Z',
    unread: 0,
    avatar: null
  },
  {
    id: '3',
    name: 'Emma Davis',
    phone: '+1234567892',
    lastMessage: 'What time is my appointment?',
    timestamp: '2024-01-17T12:00:00Z',
    unread: 1,
    avatar: null
  }
]

const mockMessages: WhatsAppMessage[] = [
  {
    id: '1',
    from: '+1234567890',
    to: 'clinic',
    message: 'Hi, I would like to book an appointment for next week',
    timestamp: '2024-01-17T14:00:00Z',
    type: 'incoming',
    status: 'read'
  },
  {
    id: '2',
    from: 'clinic',
    to: '+1234567890',
    message: 'Hello Sarah! I\'d be happy to help you book an appointment. What type of service do you need?',
    timestamp: '2024-01-17T14:02:00Z',
    type: 'outgoing',
    status: 'read'
  },
  {
    id: '3',
    from: '+1234567890',
    to: 'clinic',
    message: 'I need a general consultation with Dr. Smith',
    timestamp: '2024-01-17T14:05:00Z',
    type: 'incoming',
    status: 'read'
  },
  {
    id: '4',
    from: 'clinic',
    to: '+1234567890',
    message: 'Perfect! Dr. Smith has availability on:\n• Monday, Jan 22 at 10:00 AM\n• Tuesday, Jan 23 at 2:00 PM\n• Wednesday, Jan 24 at 9:00 AM\n\nWhich time works best for you?',
    timestamp: '2024-01-17T14:07:00Z',
    type: 'outgoing',
    status: 'read'
  },
  {
    id: '5',
    from: '+1234567890',
    to: 'clinic',
    message: 'I need to reschedule my appointment',
    timestamp: '2024-01-17T14:30:00Z',
    type: 'incoming',
    status: 'delivered'
  }
]

export function WhatsAppChat() {
  const [selectedContact, setSelectedContact] = useState(mockContacts[0])
  const [messages, setMessages] = useState<WhatsAppMessage[]>(mockMessages)
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

    const message: WhatsAppMessage = {
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
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  )

  const quickReplies = [
    'Thank you for contacting us!',
    'Your appointment has been confirmed.',
    'Please arrive 15 minutes early.',
    'We need to reschedule your appointment.',
    'What type of service do you need?'
  ]

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-gray-50">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">WhatsApp Messages</h2>
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

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedContact.id === contact.id ? 'bg-green-50 border-l-4 border-l-[hsl(var(--whatsapp-green))]' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.avatar || undefined} />
                  <AvatarFallback className="bg-[hsl(var(--whatsapp-green))] text-white">
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
                      <Badge className="bg-[hsl(var(--whatsapp-green))] text-white text-xs px-2 py-1 rounded-full">
                        {contact.unread}
                      </Badge>
                    )}
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
                <AvatarImage src={selectedContact.avatar || undefined} />
                <AvatarFallback className="bg-[hsl(var(--whatsapp-green))] text-white">
                  {selectedContact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                <p className="text-sm text-gray-500">{selectedContact.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'outgoing'
                    ? 'bg-[hsl(var(--whatsapp-green))] text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className={`text-xs ${
                    message.type === 'outgoing' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>
                  {message.type === 'outgoing' && (
                    <div className="flex">
                      <div className={`w-3 h-3 ${
                        message.status === 'read' ? 'text-blue-200' : 'text-green-100'
                      }`}>
                        ✓✓
                      </div>
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
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs"
                onClick={() => setNewMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
              />
              <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]"
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