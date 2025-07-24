'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, User, Mail, Phone, MapPin, Star, Briefcase, Upload, Search, Grid, List, ArrowLeft } from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  location: string
  hire_date: string
  salary: number
  status: 'active' | 'inactive' | 'on_leave'
  photo_url?: string
  bio?: string
  skills: string[]
  projects: string[]
  performance_rating: number
  created_at: string
  updated_at: string
}

interface EmployeeFormData {
  name: string
  email: string
  phone: string
  position: string
  department: string
  location: string
  hire_date: string
  salary: string
  status: 'active' | 'inactive' | 'on_leave'
  bio: string
  skills: string
  projects: string
  performance_rating: number
}

const departments = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Support'
]

const positions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 
  'Product Manager', 'Marketing Manager', 'Sales Executive', 'HR Manager', 'Finance Manager'
]

const allowedEmails = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

export default function EmployeesPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [theme, setTheme] = useState('dark')
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    location: '',
    hire_date: '',
    salary: '',
    status: 'active',
    bio: '',
    skills: '',
    projects: '',
    performance_rating: 5
  })

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('ads-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('ads-theme', newTheme)
    document.documentElement.className = newTheme
  }

  useEffect(() => {
    const checkAuth = async () => {
      const response = await supabase.auth.getSession()
      const session = response?.data?.session
      
      if (!session?.user?.email || !allowedEmails.includes(session.user.email)) {
        await supabase.auth.signOut()
        router.push('/login')
      } else {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    if (authChecked) {
      fetchEmployees()
    }
  }, [authChecked])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Demo data as fallback
      setEmployees([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@company.com',
          phone: '+1 234 567 8900',
          position: 'Frontend Developer',
          department: 'Engineering',
          location: 'New York',
          hire_date: '2023-01-15',
          salary: 85000,
          status: 'active',
          bio: 'Passionate frontend developer with 5+ years of experience.',
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
          projects: ['E-commerce Platform', 'Admin Dashboard', 'Mobile App'],
          performance_rating: 4.8,
          created_at: '2023-01-15T00:00:00Z',
          updated_at: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          email: 'sarah@company.com',
          phone: '+1 234 567 8901',
          position: 'UI/UX Designer',
          department: 'Design',
          location: 'San Francisco',
          hire_date: '2022-08-20',
          salary: 75000,
          status: 'active',
          bio: 'Creative designer focused on user-centered design.',
          skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
          projects: ['Mobile Banking App', 'SaaS Dashboard', 'Brand Identity'],
          performance_rating: 4.9,
          created_at: '2022-08-20T00:00:00Z',
          updated_at: '2022-08-20T00:00:00Z'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (employeeId: string, file: File) => {
    try {
      setUploadingPhoto(employeeId)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('employees')
        .update({ photo_url: publicUrl })
        .eq('id', employeeId)

      if (updateError) throw updateError

      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, photo_url: publicUrl } : emp
      ))

    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploadingPhoto(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const employeeData = {
        ...formData,
        salary: parseFloat(formData.salary),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        projects: formData.projects.split(',').map(s => s.trim()).filter(Boolean)
      }

      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id)

        if (error) throw error

        setEmployees(prev => prev.map(emp => 
          emp.id === editingEmployee.id ? { ...emp, ...employeeData } : emp
        ))
      } else {
        const { data, error } = await supabase
          .from('employees')
          .insert([employeeData])
          .select()

        if (error) throw error

        if (data) {
          setEmployees(prev => [data[0], ...prev])
        }
      }

      resetForm()
      setIsAddModalOpen(false)
      setEditingEmployee(null)
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmployees(prev => prev.filter(emp => emp.id !== id))
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      location: '',
      hire_date: '',
      salary: '',
      status: 'active',
      bio: '',
      skills: '',
      projects: '',
      performance_rating: 5
    })
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      location: employee.location,
      hire_date: employee.hire_date,
      salary: employee.salary.toString(),
      status: employee.status,
      bio: employee.bio || '',
      skills: employee.skills.join(', '),
      projects: employee.projects.join(', '),
      performance_rating: employee.performance_rating
    })
    setIsAddModalOpen(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white px-2 py-1 rounded-full text-xs'
      case 'inactive': return 'bg-red-500 text-white px-2 py-1 rounded-full text-xs'
      case 'on_leave': return 'bg-yellow-500 text-white px-2 py-1 rounded-full text-xs'
      default: return 'bg-gray-500 text-white px-2 py-1 rounded-full text-xs'
    }
  }

  if (!authChecked) {
    return (
      <div className="employee-portfolio-container" style={{
        background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="text-white text-2xl font-bold">A</div>
          </div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className={`employee-card overflow-hidden transition-all duration-200 hover:shadow-lg rounded-lg border ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {employee.photo_url ? (
                <Image
                  src={employee.photo_url}
                  alt={employee.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(employee.id, file)
                  }}
                />
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  {uploadingPhoto === employee.id ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3 text-white" />
                  )}
                </div>
              </label>
            </div>
            <div>
              <h3 className={`employee-card-title text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {employee.name}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {employee.position}
              </p>
            </div>
          </div>
          <span className={getStatusColor(employee.status)}>
            {employee.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className={`employee-card-email ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {employee.email}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {employee.department}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {employee.location}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {employee.performance_rating}/5.0
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Skills:
          </p>
          <div className="employee-skills-container">
            {employee.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="employee-skill-badge bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {skill}
              </span>
            ))}
            {employee.skills.length > 3 && (
              <span className="employee-skill-badge bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                +{employee.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="employee-action-buttons">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(employee)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(employee.id)}
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="employee-portfolio-container" style={{
      background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        background: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(245, 245, 245, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        padding: '12px 24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              onClick={() => router.push('/')}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-sm button-inactive"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-sm button-inactive"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>
          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
            className="h-8 px-4 text-sm button-inactive"
          >
            🔓 Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="employee-main-content">
        {/* Page Header */}
        <div className="employee-header">
          <div className="employee-header-flex">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Employee Portfolio
              </h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your team members and their information
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="employee-search-section">
          <div className="employee-search-wrapper">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="employee-stats-grid">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Employees
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {employees.length}
                  </p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {employees.filter(e => e.status === 'active').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    On Leave
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {employees.filter(e => e.status === 'on_leave').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Departments
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {new Set(employees.map(e => e.department)).size}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Grid */}
        {loading ? (
          <div className="employee-loading">
            <div className="employee-spinner" />
          </div>
        ) : (
          <div className="employee-cards-grid">
            {filteredEmployees.map(employee => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}

        {/* Add/Edit Employee Modal */}
        {isAddModalOpen && (
          <div className="employee-modal-overlay">
            <div className={`employee-modal-content ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingEmployee(null)
                    resetForm()
                  }}
                >
                  ✕
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="employee-form-grid">
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="employee-form-input"
                    />
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="employee-form-input"
                    />
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="employee-form-input"
                    />
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className={`employee-form-select ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select position</option>
                      {positions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className={`employee-form-select ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="employee-form-input"
                    />
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hire Date
                    </label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      required
                      className="employee-form-input"
                    />
                  </div>
                  
                  <div className="employee-form-field">
                    <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Salary
                    </label>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="50000"
                      className="employee-form-input"
                    />
                  </div>
                </div>
                
                <div className="employee-form-field">
                  <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on_leave' })}
                    className={`employee-form-select ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
                
                <div className="employee-form-field">
                  <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief description about the employee..."
                    rows={3}
                    className={`employee-form-textarea ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div className="employee-form-field">
                  <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Skills (comma-separated)
                  </label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js, Python"
                    className="employee-form-input"
                  />
                </div>
                
                <div className="employee-form-field">
                  <label className={`employee-form-label ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Projects (comma-separated)
                  </label>
                  <Input
                    value={formData.projects}
                    onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                    placeholder="E-commerce Platform, Mobile App, Dashboard"
                    className="employee-form-input"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false)
                      setEditingEmployee(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}