import { blink } from '@/blink/client'
import type { SMSMessage, SMSSettings, Appointment } from '@/types'

export class SMSService {
  private settings: SMSSettings | null = null

  async initialize(userId: string) {
    try {
      // Load SMS settings from database
      const settingsData = await blink.db.sms_settings.list({
        where: { userId },
        limit: 1
      })
      
      this.settings = settingsData[0] || null
      return this.settings
    } catch (error) {
      console.error('Failed to initialize SMS service:', error)
      return null
    }
  }

  async sendSMS(to: string, message: string, appointmentId?: string): Promise<SMSMessage> {
    if (!this.settings || !this.settings.isActive) {
      throw new Error('SMS service is not configured or inactive')
    }

    // Check business hours if enabled
    if (this.settings.businessHours.enabled && !this.isWithinBusinessHours()) {
      throw new Error('SMS can only be sent during business hours')
    }

    try {
      // Use Blink's secure API proxy to call SMS provider
      const response = await this.callSMSProvider(to, message)
      
      // Create SMS message record
      const smsMessage: SMSMessage = {
        id: `sms_${Date.now()}`,
        from: this.settings.fromNumber,
        to,
        message,
        timestamp: new Date().toISOString(),
        type: 'outgoing',
        status: 'sent'
      }

      // Save to database
      await blink.db.sms_messages.create({
        ...smsMessage,
        appointmentId,
        userId: this.settings.userId
      })

      return smsMessage
    } catch (error) {
      console.error('Failed to send SMS:', error)
      throw error
    }
  }

  private async callSMSProvider(to: string, message: string) {
    if (!this.settings) throw new Error('SMS settings not loaded')

    switch (this.settings.provider) {
      case 'twilio':
        return this.sendViaTwilio(to, message)
      case 'aws_sns':
        return this.sendViaAWSSNS(to, message)
      case 'messagebird':
        return this.sendViaMessageBird(to, message)
      default:
        throw new Error(`Unsupported SMS provider: ${this.settings.provider}`)
    }
  }

  private async sendViaTwilio(to: string, message: string) {
    const response = await blink.data.fetch({
      url: 'https://api.twilio.com/2010-04-01/Accounts/{{twilio_account_sid}}/Messages.json',
      method: 'POST',
      headers: {
        'Authorization': 'Basic {{twilio_auth_token_base64}}',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: this.settings!.fromNumber,
        To: to,
        Body: message
      }).toString()
    })

    if (response.status !== 201) {
      throw new Error(`Twilio API error: ${response.status}`)
    }

    return response.body
  }

  private async sendViaAWSSNS(to: string, message: string) {
    const response = await blink.data.fetch({
      url: 'https://sns.{{aws_region}}.amazonaws.com/',
      method: 'POST',
      headers: {
        'Authorization': 'AWS4-HMAC-SHA256 {{aws_auth_header}}',
        'Content-Type': 'application/x-amz-json-1.0',
        'X-Amz-Target': 'AmazonSNS.Publish'
      },
      body: JSON.stringify({
        PhoneNumber: to,
        Message: message
      })
    })

    if (response.status !== 200) {
      throw new Error(`AWS SNS API error: ${response.status}`)
    }

    return response.body
  }

  private async sendViaMessageBird(to: string, message: string) {
    const response = await blink.data.fetch({
      url: 'https://rest.messagebird.com/messages',
      method: 'POST',
      headers: {
        'Authorization': 'AccessKey {{messagebird_api_key}}',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originator: this.settings!.fromNumber,
        recipients: [to],
        body: message
      })
    })

    if (response.status !== 201) {
      throw new Error(`MessageBird API error: ${response.status}`)
    }

    return response.body
  }

  private isWithinBusinessHours(): boolean {
    if (!this.settings?.businessHours.enabled) return true

    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: this.settings.businessHours.timezone 
    })
    
    const [currentHour, currentMinute] = currentTime.split(':').map(Number)
    const currentMinutes = currentHour * 60 + currentMinute

    const [startHour, startMinute] = this.settings.businessHours.start.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute

    const [endHour, endMinute] = this.settings.businessHours.end.split(':').map(Number)
    const endMinutes = endHour * 60 + endMinute

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  }

  async sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
    const template = `Hi ${appointment.patientName}, your appointment with our clinic is confirmed for ${appointment.appointmentDate} at ${appointment.appointmentTime}. Please arrive 15 minutes early. Reply CANCEL to cancel.`
    
    await this.sendSMS(appointment.patientPhone, template, appointment.id)
  }

  async sendAppointmentReminder(appointment: Appointment): Promise<void> {
    const template = `Reminder: You have an appointment tomorrow at ${appointment.appointmentTime} with our clinic. Reply CONFIRM to confirm or RESCHEDULE to change.`
    
    await this.sendSMS(appointment.patientPhone, template, appointment.id)
  }

  async sendWelcomeMessage(phone: string): Promise<void> {
    const template = `Thank you for contacting our clinic! We will respond to your message during business hours. For emergencies, please call our main number.`
    
    await this.sendSMS(phone, template)
  }

  async processIncomingMessage(from: string, message: string): Promise<void> {
    try {
      // Save incoming message
      const smsMessage: SMSMessage = {
        id: `sms_${Date.now()}`,
        from,
        to: this.settings?.fromNumber || 'clinic',
        message,
        timestamp: new Date().toISOString(),
        type: 'incoming',
        status: 'delivered'
      }

      await blink.db.sms_messages.create({
        ...smsMessage,
        userId: this.settings?.userId
      })

      // Process message for appointment booking
      await this.processAppointmentRequest(from, message)

      // Send auto-reply if enabled
      if (this.settings?.autoReply) {
        await this.sendAutoReply(from, message)
      }
    } catch (error) {
      console.error('Failed to process incoming SMS:', error)
    }
  }

  private async processAppointmentRequest(from: string, message: string): Promise<void> {
    const lowerMessage = message.toLowerCase()
    
    // Simple keyword detection for appointment booking
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      const response = `Thank you for your appointment request! Our staff will contact you shortly to schedule your appointment. You can also call us directly at our main number.`
      await this.sendSMS(from, response)
    }
    
    // Handle confirmations
    if (lowerMessage.includes('confirm') || lowerMessage === 'yes') {
      const response = `Your appointment has been confirmed. We look forward to seeing you!`
      await this.sendSMS(from, response)
    }
    
    // Handle cancellations
    if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
      const response = `We have received your request to modify your appointment. Our staff will contact you shortly to assist with rescheduling.`
      await this.sendSMS(from, response)
    }
  }

  private async sendAutoReply(from: string, message: string): Promise<void> {
    // Don't auto-reply to auto-replies or system messages
    if (message.toLowerCase().includes('thank you for contacting')) return

    const autoReplyMessage = `Thank you for contacting our clinic! We have received your message and will respond during business hours (${this.settings?.businessHours.start} - ${this.settings?.businessHours.end}). For emergencies, please call our main number.`
    
    // Add a small delay to avoid immediate response
    setTimeout(async () => {
      await this.sendSMS(from, autoReplyMessage)
    }, 2000)
  }

  async getMessageHistory(userId: string, limit: number = 50): Promise<SMSMessage[]> {
    try {
      const messages = await blink.db.sms_messages.list({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        limit
      })
      
      return messages.reverse() // Return in chronological order
    } catch (error) {
      console.error('Failed to get message history:', error)
      return []
    }
  }

  async updateSettings(settings: SMSSettings): Promise<void> {
    try {
      await blink.db.sms_settings.upsert({
        id: settings.id,
        ...settings,
        updatedAt: new Date().toISOString()
      })
      
      this.settings = settings
    } catch (error) {
      console.error('Failed to update SMS settings:', error)
      throw error
    }
  }
}

// Export singleton instance
export const smsService = new SMSService()