import { Appointment, Patient } from '@/types'
import { blink } from '@/blink/client'

export interface GoogleSheetsConfig {
  spreadsheetId: string
  appointmentsSheetName?: string
  patientsSheetName?: string
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets'

  constructor(config: GoogleSheetsConfig) {
    this.config = {
      appointmentsSheetName: 'Appointments',
      patientsSheetName: 'Patients',
      ...config
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Use Blink's secure data fetch to make the request with the API key from secrets
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}${endpoint}`
      
      const response = await blink.data.fetch({
        url: url,
        method: options.method || 'GET',
        query: {
          key: '{{GOOGLE_SHEETS_API_KEY}}'
        },
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.parse(options.body as string) : undefined
      })

      if (response.status >= 400) {
        let errorMessage = `Google Sheets API error: ${response.status}`
        
        try {
          if (response.body?.error?.message) {
            errorMessage += ` - ${response.body.error.message}`
          }
          if (response.body?.error?.details) {
            errorMessage += ` (${JSON.stringify(response.body.error.details)})`
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(errorMessage)
      }

      return response.body
    } catch (error) {
      console.error('Google Sheets API request failed:', error)
      throw error
    }
  }

  // Initialize sheets with headers
  async initializeSheets() {
    try {
      // Check if sheets exist and create headers if needed
      await this.ensureAppointmentsSheet()
      await this.ensurePatientsSheet()
    } catch (error) {
      console.error('Error initializing sheets:', error)
      throw error
    }
  }

  private async ensureAppointmentsSheet() {
    const headers = [
      'ID', 'Patient Name', 'Patient Phone', 'Patient Email', 
      'Appointment Date', 'Appointment Time', 'Service Type', 
      'Status', 'Notes', 'WhatsApp Message ID', 'SMS Message ID',
      'Created At', 'Updated At', 'User ID'
    ]

    try {
      // Try to get the sheet first
      await this.makeRequest(`/values/${this.config.appointmentsSheetName}!A1:N1`)
    } catch (error) {
      // If sheet doesn't exist or is empty, create headers
      await this.makeRequest(`/values/${this.config.appointmentsSheetName}!A1:N1`, {
        method: 'PUT',
        body: JSON.stringify({
          values: [headers]
        })
      })
    }
  }

  private async ensurePatientsSheet() {
    const headers = [
      'ID', 'Name', 'Phone', 'Email', 'Date of Birth', 
      'Address', 'Emergency Contact', 'Medical Notes',
      'Created At', 'Updated At', 'User ID'
    ]

    try {
      // Try to get the sheet first
      await this.makeRequest(`/values/${this.config.patientsSheetName}!A1:K1`)
    } catch (error) {
      // If sheet doesn't exist or is empty, create headers
      await this.makeRequest(`/values/${this.config.patientsSheetName}!A1:K1`, {
        method: 'PUT',
        body: JSON.stringify({
          values: [headers]
        })
      })
    }
  }

  // Appointments CRUD operations
  async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      const response = await this.makeRequest(`/values/${this.config.appointmentsSheetName}`)
      const rows = response.values || []
      
      if (rows.length <= 1) return [] // No data or only headers
      
      const appointments: Appointment[] = []
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row[13] === userId) { // Check user ID
          appointments.push({
            id: row[0] || '',
            patientName: row[1] || '',
            patientPhone: row[2] || '',
            patientEmail: row[3] || '',
            appointmentDate: row[4] || '',
            appointmentTime: row[5] || '',
            serviceType: row[6] || '',
            status: (row[7] || 'pending') as Appointment['status'],
            notes: row[8] || '',
            whatsappMessageId: row[9] || '',
            smsMessageId: row[10] || '',
            createdAt: row[11] || '',
            updatedAt: row[12] || '',
            userId: row[13] || ''
          })
        }
      }
      
      return appointments
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const id = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newAppointment: Appointment = {
      ...appointment,
      id,
      createdAt: now,
      updatedAt: now
    }

    const row = [
      newAppointment.id,
      newAppointment.patientName,
      newAppointment.patientPhone,
      newAppointment.patientEmail || '',
      newAppointment.appointmentDate,
      newAppointment.appointmentTime,
      newAppointment.serviceType,
      newAppointment.status,
      newAppointment.notes || '',
      newAppointment.whatsappMessageId || '',
      newAppointment.smsMessageId || '',
      newAppointment.createdAt,
      newAppointment.updatedAt,
      newAppointment.userId
    ]

    await this.makeRequest(`/values/${this.config.appointmentsSheetName}:append`, {
      method: 'POST',
      body: JSON.stringify({
        values: [row],
        valueInputOption: 'RAW'
      })
    })

    return newAppointment
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const appointments = await this.getAppointments(updates.userId || '')
      const appointmentIndex = appointments.findIndex(apt => apt.id === id)
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found')
      }

      const updatedAppointment = {
        ...appointments[appointmentIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      const row = [
        updatedAppointment.id,
        updatedAppointment.patientName,
        updatedAppointment.patientPhone,
        updatedAppointment.patientEmail || '',
        updatedAppointment.appointmentDate,
        updatedAppointment.appointmentTime,
        updatedAppointment.serviceType,
        updatedAppointment.status,
        updatedAppointment.notes || '',
        updatedAppointment.whatsappMessageId || '',
        updatedAppointment.smsMessageId || '',
        updatedAppointment.createdAt,
        updatedAppointment.updatedAt,
        updatedAppointment.userId
      ]

      // Update the specific row (appointmentIndex + 2 because of 0-based index + header row)
      const rowNumber = appointmentIndex + 2
      await this.makeRequest(`/values/${this.config.appointmentsSheetName}!A${rowNumber}:N${rowNumber}`, {
        method: 'PUT',
        body: JSON.stringify({
          values: [row]
        })
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  async deleteAppointment(id: string, userId: string): Promise<void> {
    try {
      const appointments = await this.getAppointments(userId)
      const appointmentIndex = appointments.findIndex(apt => apt.id === id)
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found')
      }

      // Delete the row (appointmentIndex + 2 because of 0-based index + header row)
      const rowNumber = appointmentIndex + 2
      
      // Google Sheets API doesn't have a direct delete row method
      // We'll clear the row content instead
      await this.makeRequest(`/values/${this.config.appointmentsSheetName}!A${rowNumber}:N${rowNumber}:clear`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }

  // Patients CRUD operations
  async getPatients(userId: string): Promise<Patient[]> {
    try {
      const response = await this.makeRequest(`/values/${this.config.patientsSheetName}`)
      const rows = response.values || []
      
      if (rows.length <= 1) return [] // No data or only headers
      
      const patients: Patient[] = []
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row[10] === userId) { // Check user ID
          patients.push({
            id: row[0] || '',
            name: row[1] || '',
            phone: row[2] || '',
            email: row[3] || '',
            dateOfBirth: row[4] || '',
            address: row[5] || '',
            emergencyContact: row[6] || '',
            medicalNotes: row[7] || '',
            createdAt: row[8] || '',
            updatedAt: row[9] || '',
            userId: row[10] || ''
          })
        }
      }
      
      return patients
    } catch (error) {
      console.error('Error fetching patients:', error)
      return []
    }
  }

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const id = `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newPatient: Patient = {
      ...patient,
      id,
      createdAt: now,
      updatedAt: now
    }

    const row = [
      newPatient.id,
      newPatient.name,
      newPatient.phone,
      newPatient.email || '',
      newPatient.dateOfBirth || '',
      newPatient.address || '',
      newPatient.emergencyContact || '',
      newPatient.medicalNotes || '',
      newPatient.createdAt,
      newPatient.updatedAt,
      newPatient.userId
    ]

    await this.makeRequest(`/values/${this.config.patientsSheetName}:append`, {
      method: 'POST',
      body: JSON.stringify({
        values: [row],
        valueInputOption: 'RAW'
      })
    })

    return newPatient
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<void> {
    try {
      const patients = await this.getPatients(updates.userId || '')
      const patientIndex = patients.findIndex(pat => pat.id === id)
      
      if (patientIndex === -1) {
        throw new Error('Patient not found')
      }

      const updatedPatient = {
        ...patients[patientIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      const row = [
        updatedPatient.id,
        updatedPatient.name,
        updatedPatient.phone,
        updatedPatient.email || '',
        updatedPatient.dateOfBirth || '',
        updatedPatient.address || '',
        updatedPatient.emergencyContact || '',
        updatedPatient.medicalNotes || '',
        updatedPatient.createdAt,
        updatedPatient.updatedAt,
        updatedPatient.userId
      ]

      // Update the specific row (patientIndex + 2 because of 0-based index + header row)
      const rowNumber = patientIndex + 2
      await this.makeRequest(`/values/${this.config.patientsSheetName}!A${rowNumber}:K${rowNumber}`, {
        method: 'PUT',
        body: JSON.stringify({
          values: [row]
        })
      })
    } catch (error) {
      console.error('Error updating patient:', error)
      throw error
    }
  }

  async deletePatient(id: string, userId: string): Promise<void> {
    try {
      const patients = await this.getPatients(userId)
      const patientIndex = patients.findIndex(pat => pat.id === id)
      
      if (patientIndex === -1) {
        throw new Error('Patient not found')
      }

      // Delete the row (patientIndex + 2 because of 0-based index + header row)
      const rowNumber = patientIndex + 2
      
      // Google Sheets API doesn't have a direct delete row method
      // We'll clear the row content instead
      await this.makeRequest(`/values/${this.config.patientsSheetName}!A${rowNumber}:K${rowNumber}:clear`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error deleting patient:', error)
      throw error
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate configuration first
      if (!this.config.spreadsheetId) {
        return { success: false, error: 'Spreadsheet ID is required' }
      }
      
      // Test basic spreadsheet access by getting spreadsheet metadata
      const response = await this.makeRequest('')
      
      // Check if we got a valid response with spreadsheet properties
      if (response && response.properties) {
        return { success: true }
      } else {
        return { success: false, error: 'Invalid spreadsheet response' }
      }
    } catch (error) {
      console.error('Google Sheets connection test failed:', error)
      
      let errorMessage = 'Connection failed'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Provide more specific error messages
        if (errorMessage.includes('404')) {
          errorMessage = 'Spreadsheet not found. Please check the spreadsheet ID and make sure it\'s publicly accessible.'
        } else if (errorMessage.includes('403')) {
          errorMessage = 'Access denied. Please check your API key and spreadsheet permissions.'
        } else if (errorMessage.includes('400')) {
          errorMessage = 'Invalid request. Please check your API key and spreadsheet ID.'
        }
      }
      
      return { success: false, error: errorMessage }
    }
  }
}