'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, User, Mail, Phone, MapPin, Star, Briefcase, Upload, Search, Grid, List, ArrowLeft, Check as CheckIcon, Users, Award, Building, Calendar, Zap } from 'lucide-react'
import './employee-portfolio.css'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
          id: '0',
          name: 'DHANAPAL E',
          email: 'dhana@aggrandizedigital.com',
          phone: '+91 9876543210',
          position: 'Frontend Developer',
          department: 'Engineering',
          location: 'Coimbatore',
          hire_date: '2025-07-01',
          salary: 850000,
          status: 'active',
          bio: 'Senior frontend developer with expertise in React and modern web technologies.',
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
          projects: ['Employee Portfolio', 'Dashboard System', 'E-commerce Platform'],
          performance_rating: 5.0,
          created_at: '2025-07-01T00:00:00Z',
          updated_at: '2025-07-01T00:00:00Z'
        },
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
          bio: 'Passionate frontend developer with 5+ years of experience in building scalable web applications.',
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
          bio: 'Creative designer focused on user-centered design and innovative solutions.',
          skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
          projects: ['Mobile Banking App', 'SaaS Dashboard', 'Brand Identity'],
          performance_rating: 4.9,
          created_at: '2022-08-20T00:00:00Z',
          updated_at: '2022-08-20T00:00:00Z'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@company.com',
          phone: '+1 234 567 8902',
          position: 'Backend Developer',
          department: 'Engineering',
          location: 'Austin',
          hire_date: '2023-03-10',
          salary: 90000,
          status: 'on_leave',
          bio: 'Backend engineer specializing in scalable systems and cloud architecture.',
          skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
          projects: ['Microservices Architecture', 'Payment Gateway', 'Analytics Platform'],
          performance_rating: 4.7,
          created_at: '2023-03-10T00:00:00Z',
          updated_at: '2023-03-10T00:00:00Z'
        },
        {
          id: '4',
          name: 'Emily Chen',
          email: 'emily@company.com',
          phone: '+1 234 567 8903',
          position: 'Product Manager',
          department: 'Product',
          location: 'Seattle',
          hire_date: '2022-11-05',
          salary: 95000,
          status: 'active',
          bio: 'Strategic product manager with expertise in user research and data-driven decisions.',
          skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
          projects: ['Product Roadmap', 'User Experience Optimization', 'Market Analysis'],
          performance_rating: 4.6,
          created_at: '2022-11-05T00:00:00Z',
          updated_at: '2022-11-05T00:00:00Z'
        },
        {
          id: '5',
          name: 'David Rodriguez',
          email: 'david@company.com',
          phone: '+1 234 567 8904',
          position: 'DevOps Engineer',
          department: 'Engineering',
          location: 'Denver',
          hire_date: '2023-02-14',
          salary: 88000,
          status: 'active',
          bio: 'DevOps specialist focused on automation, monitoring, and cloud infrastructure.',
          skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
          projects: ['Infrastructure Automation', 'Monitoring System', 'Cloud Migration'],
          performance_rating: 4.7,
          created_at: '2023-02-14T00:00:00Z',
          updated_at: '2023-02-14T00:00:00Z'
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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'rating-excellent'
    if (rating >= 4.0) return 'rating-good'
    if (rating >= 3.5) return 'rating-average'
    return 'rating-poor'
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Users className="text-white text-3xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-800 rounded w-32 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <Card className="employee-card">
      <CardHeader className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="employee-photo-container">
              {employee.photo_url ? (
                <Image
                  src={employee.photo_url}
                  alt={employee.name}
                  width={60}
                  height={60}
                  className="employee-photo"
                />
              ) : (
                <div className="employee-photo-placeholder">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <label className="photo-upload-overlay">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(employee.id, file)
                  }}
                />
                {uploadingPhoto === employee.id ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 text-white" />
                )}
              </label>
            </div>
            <div className="flex-1">
              <CardTitle className="card-title">
                {employee.name}
              </CardTitle>
              <p className="card-subtitle">
                {employee.position}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Building className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">{employee.department}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`${
              employee.status === 'active' ? 'status-active' :
              employee.status === 'inactive' ? 'status-inactive' :
              'status-on-leave'
            }`}>
              {employee.status.replace('_', ' ').toUpperCase()}
            </span>
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${getPerformanceColor(employee.performance_rating)} fill-current`} />
              <span className={`text-sm font-semibold ${getPerformanceColor(employee.performance_rating)}`}>
                {employee.performance_rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="card-content">
        <div className="space-y-4">
          {employee.bio && (
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {employee.bio}
            </p>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300 truncate">
                {employee.email}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300">
                {employee.location}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-slate-300">
                Joined {new Date(employee.hire_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Skills
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {employee.skills.slice(0, 4).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {employee.skills.length > 4 && (
                <span className="bg-slate-700/50 text-slate-400 text-xs px-2.5 py-1 rounded-lg border border-slate-600/50">
                  +{employee.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              onClick={() => openEditModal(employee)}
              className="btn-primary flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(employee.id)}
              className="btn-secondary"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="employee-portfolio-container">
      {/* Header */}
      <div className="employee-header">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="employee-title">
                  Employee Portfolio
                </h1>
                <p className="employee-subtitle">
                  Manage your team members and their information
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-slate-700 rounded-lg border border-slate-600">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' 
                      ? 'btn-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                    }
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' 
                      ? 'btn-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                    }
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  className="btn-primary px-6 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
            
            <div className="search-container">
              <Search className="search-icon w-5 h-5" />
              <Input
                placeholder="Search employees, roles, departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {employees.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                    Active
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {employees.filter(e => e.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                    On Leave
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {employees.filter(e => e.status === 'on_leave').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
                    Departments
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {new Set(employees.map(e => e.department)).size}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading employees...</p>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No employees found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Employee
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "employees-grid" : "space-y-4"}>
            {filteredEmployees.map(employee => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}

        {/* Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="employee-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="modal-header sticky top-0 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </h2>
                    <p className="text-slate-400">
                      {editingEmployee ? 'Update employee information' : 'Fill in the details to add a new team member'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddModalOpen(false)
                      setEditingEmployee(null)
                      resetForm()
                    }}
                    className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Full Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="John Doe"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="john.doe@company.com"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Location
                        </label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="New York, NY"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Professional Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Position *
                        </label>
                        <select
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          required
                          className="form-select w-full"
                        >
                          <option value="" className="bg-slate-700">Select position</option>
                          {positions.map(position => (
                            <option key={position} value={position} className="bg-slate-700">{position}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Department *
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          required
                          className="form-select w-full"
                        >
                          <option value="" className="bg-slate-700">Select department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept} className="bg-slate-700">{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Hire Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                          required
                          className="date-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Annual Salary
                        </label>
                        <Input
                          type="number"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          placeholder="75000"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Employment Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on_leave' })}
                          className="form-select w-full"
                        >
                          <option value="active" className="bg-slate-700">Active</option>
                          <option value="inactive" className="bg-slate-700">Inactive</option>
                          <option value="on_leave" className="bg-slate-700">On Leave</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Performance Rating
                        </label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.1"
                            value={formData.performance_rating}
                            onChange={(e) => setFormData({ ...formData, performance_rating: parseFloat(e.target.value) })}
                            className="rating-slider"
                          />
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>1.0</span>
                            <span className="text-purple-400 font-semibold">{formData.performance_rating.toFixed(1)}</span>
                            <span>5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Award className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Additional Information</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Brief description about the employee's background, experience, and role..."
                          rows={4}
                          className="form-textarea w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Skills & Technologies
                        </label>
                        <Input
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          placeholder="React, TypeScript, Node.js, Python, AWS, Docker"
                          className="form-input"
                        />
                        <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Current Projects
                        </label>
                        <Input
                          value={formData.projects}
                          onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                          placeholder="E-commerce Platform, Mobile App, Dashboard Redesign"
                          className="form-input"
                        />
                        <p className="text-xs text-slate-500 mt-1">Separate projects with commas</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddModalOpen(false)
                        setEditingEmployee(null)
                        resetForm()
                      }}
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 px-8"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="btn-primary px-8"
                    >
                      {editingEmployee ? (
                        <>
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Update Employee
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Employee
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}