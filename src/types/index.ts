export interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  appointmentDate: string
  appointmentTime: string
  serviceType: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  whatsappMessageId?: string
  smsMessageId?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  medicalNotes?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface MessageTemplate {
  id: string
  name: string
  type: 'whatsapp' | 'sms' | 'email'
  templateText: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface ClinicSettings {
  id: string
  clinicName: string
  clinicPhone?: string
  clinicEmail?: string
  clinicAddress?: string
  workingHours: {
    [key: string]: { start: string; end: string; enabled: boolean }
  }
  whatsappApiKey?: string
  smsApiKey?: string
  autoConfirmAppointments: boolean
  reminderHoursBefore: number
  createdAt: string
  updatedAt: string
  userId: string
}

export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  message: string
  timestamp: string
  type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'read'
}

export interface SMSMessage {
  id: string
  from: string
  to: string
  message: string
  timestamp: string
  type: 'incoming' | 'outgoing'
  status: 'sent' | 'delivered' | 'failed'
}

export interface SMSContact {
  id: string
  name: string
  phone: string
  lastMessage: string
  timestamp: string
  unread: number
  status: 'active' | 'blocked'
}

export interface SMSSettings {
  id: string
  provider: 'twilio' | 'aws_sns' | 'messagebird' | 'custom'
  apiKey?: string
  apiSecret?: string
  fromNumber: string
  webhookUrl?: string
  isActive: boolean
  autoReply: boolean
  businessHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
  createdAt: string
  updatedAt: string
  userId: string
}

export interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  pendingAppointments: number
  totalPatients: number
  whatsappMessages: number
  smsMessages: number
}