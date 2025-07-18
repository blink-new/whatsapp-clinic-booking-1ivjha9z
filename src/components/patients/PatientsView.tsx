import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  User,
  MapPin,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format, parseISO } from 'date-fns'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import { blink } from '@/blink/client'
import { toast } from 'sonner'
import type { Patient } from '@/types'

export function PatientsView() {
  const { service, isConnected } = useGoogleSheets()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [user, setUser] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    medicalNotes: ''
  })

  useEffect(() => {
    blink.auth.me().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (service && isConnected && user) {
      loadPatients()
    } else {
      setLoading(false)
    }
  }, [service, isConnected, user])

  const loadPatients = async () => {
    if (!service || !user) return
    
    setLoading(true)
    try {
      const patientsData = await service.getPatients(user.id)
      setPatients(patientsData)
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !user) return

    try {
      if (editingPatient) {
        // Update existing patient
        await service.updatePatient(editingPatient.id, {
          ...formData,
          userId: user.id
        })
        toast.success('Patient updated successfully')
      } else {
        // Create new patient
        await service.createPatient({
          ...formData,
          userId: user.id
        })
        toast.success('Patient added successfully')
      }
      
      await loadPatients()
      resetForm()
      setIsAddDialogOpen(false)
      setEditingPatient(null)
    } catch (error) {
      console.error('Error saving patient:', error)
      toast.error('Failed to save patient')
    }
  }

  const handleEdit = (patient: Patient) => {
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || '',
      dateOfBirth: patient.dateOfBirth || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      medicalNotes: patient.medicalNotes || ''
    })
    setEditingPatient(patient)
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (patientId: string) => {
    if (!service || !user) return
    
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        await service.deletePatient(patientId, user.id)
        toast.success('Patient deleted successfully')
        await loadPatients()
      } catch (error) {
        console.error('Error deleting patient:', error)
        toast.error('Failed to delete patient')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      medicalNotes: ''
    })
    setEditingPatient(null)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery) ||
    (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null
    try {
      const birth = parseISO(dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1
      }
      return age
    } catch {
      return null
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage your clinic's patient database</p>
        </div>
        
        <Alert className="max-w-2xl">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Google Sheets integration is not configured. Please go to Settings to set up your Google Sheets connection.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage your clinic's patient database</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name and phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="medicalNotes">Medical Notes</Label>
                  <Textarea
                    id="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder="Allergies, medical conditions, notes..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm()
                      setIsAddDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]">
                    {editingPatient ? 'Update Patient' : 'Add Patient'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : patients.length}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : patients.filter(p => {
                    const created = new Date(p.createdAt)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Plus className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Email</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : patients.filter(p => p.email).length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Medical Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : patients.filter(p => p.medicalNotes).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No patients found' : 'No patients yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Add your first patient to get started'
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Patient
              </Button>
            )}
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const age = calculateAge(patient.dateOfBirth || '')
            
            return (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[hsl(var(--whatsapp-green))] text-white">
                          {getPatientInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        {age && (
                          <p className="text-sm text-gray-500">{age} years old</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(patient)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {patient.phone}
                    </div>
                    {patient.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {patient.email}
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {patient.address}
                      </div>
                    )}
                  </div>
                  
                  {patient.medicalNotes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Has Medical Notes
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}