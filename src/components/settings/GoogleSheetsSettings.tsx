import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GoogleSheetsService, GoogleSheetsConfig } from '@/services/googleSheets'
import { CheckCircle, XCircle, ExternalLink, Settings, Database, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface GoogleSheetsSettingsProps {
  onConfigChange?: (config: GoogleSheetsConfig | null) => void
}

export function GoogleSheetsSettings({ onConfigChange }: GoogleSheetsSettingsProps) {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    appointmentsSheetName: 'Appointments',
    patientsSheetName: 'Patients'
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('googleSheetsConfig')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        testConnection(parsedConfig)
      } catch (error) {
        console.error('Error loading saved config:', error)
      }
    }
  }, [])

  const testConnection = async (testConfig?: GoogleSheetsConfig) => {
    const configToTest = testConfig || config
    
    if (!configToTest.spreadsheetId) {
      setIsConnected(false)
      setConnectionError('Spreadsheet ID is required')
      return
    }

    setIsTesting(true)
    setConnectionError(null)
    
    try {
      const service = new GoogleSheetsService(configToTest)
      const result = await service.testConnection()
      
      setIsConnected(result.success)
      
      if (result.success) {
        toast.success('Google Sheets connection successful!')
        setConnectionError(null)
      } else {
        const errorMsg = result.error || 'Failed to connect to Google Sheets'
        setConnectionError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Connection test failed'
      setIsConnected(false)
      setConnectionError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!config.spreadsheetId) {
      toast.error('Please enter a spreadsheet ID')
      return
    }

    setIsLoading(true)
    setConnectionError(null)
    
    try {
      // Test connection first
      const service = new GoogleSheetsService(config)
      const result = await service.testConnection()
      
      if (!result.success) {
        const errorMsg = result.error || 'Failed to connect to Google Sheets. Please check your configuration.'
        setConnectionError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Initialize sheets with headers
      await service.initializeSheets()
      
      // Save configuration
      localStorage.setItem('googleSheetsConfig', JSON.stringify(config))
      setIsConnected(true)
      setConnectionError(null)
      onConfigChange?.(config)
      
      toast.success('Google Sheets configuration saved successfully!')
    } catch (error) {
      console.error('Error saving configuration:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to save configuration'
      setConnectionError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('googleSheetsConfig')
    setConfig({
      spreadsheetId: '',
      appointmentsSheetName: 'Appointments',
      patientsSheetName: 'Patients'
    })
    setIsConnected(false)
    setConnectionError(null)
    onConfigChange?.(null)
    toast.success('Google Sheets disconnected')
  }

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : url
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google Sheets Integration</h2>
          <p className="text-sm text-gray-600">Connect your clinic data to Google Sheets for easy management</p>
        </div>
        {isConnected && (
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {/* API Key Status Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Database className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>API Key Configured:</strong> Your Google Sheets API key is securely stored in the project secrets. 
          You only need to provide your spreadsheet ID below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Set up your Google Sheets integration to store appointment and patient data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheetId">Google Sheets URL or Spreadsheet ID *</Label>
            <Input
              id="spreadsheetId"
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit or just the ID"
              value={config.spreadsheetId}
              onChange={(e) => {
                const value = extractSpreadsheetId(e.target.value)
                setConfig(prev => ({ ...prev, spreadsheetId: value }))
                setConnectionError(null) // Clear error when user types
              }}
            />
            <p className="text-xs text-gray-500">
              You can paste the full Google Sheets URL or just the spreadsheet ID
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentsSheet">Appointments Sheet Name</Label>
              <Input
                id="appointmentsSheet"
                placeholder="Appointments"
                value={config.appointmentsSheetName}
                onChange={(e) => setConfig(prev => ({ ...prev, appointmentsSheetName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientsSheet">Patients Sheet Name</Label>
              <Input
                id="patientsSheet"
                placeholder="Patients"
                value={config.patientsSheetName}
                onChange={(e) => setConfig(prev => ({ ...prev, patientsSheetName: e.target.value }))}
              />
            </div>
          </div>

          {connectionError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Connection Error:</strong> {connectionError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !config.spreadsheetId}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Saving...' : isConnected ? 'Update Configuration' : 'Connect & Save'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => testConnection()}
              disabled={isTesting || !config.spreadsheetId}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>

            {isConnected && (
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            )}
          </div>

          {isConnected && !connectionError && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully connected to Google Sheets! Your appointment and patient data will be automatically synced.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to set up Google Sheets integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">1</div>
              <div>
                <p className="font-medium">Create a Google Sheet</p>
                <p className="text-sm text-gray-600">Create a new Google Sheet or use an existing one for your clinic data</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">2</div>
              <div>
                <p className="font-medium">Make Sheet Public</p>
                <p className="text-sm text-gray-600">
                  Share your Google Sheet with "Anyone with the link can view" permissions, or make it public
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">3</div>
              <div>
                <p className="font-medium">Get Spreadsheet ID</p>
                <p className="text-sm text-gray-600">
                  Copy the spreadsheet URL or extract the ID from the URL (the long string between /d/ and /edit)
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">4</div>
              <div>
                <p className="font-medium">Configure & Connect</p>
                <p className="text-sm text-gray-600">Enter your spreadsheet ID above, then click "Connect & Save"</p>
              </div>
            </div>
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Important:</strong> Make sure your Google Sheet is publicly accessible or shared with appropriate permissions. 
              The API key is already configured in your project secrets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}