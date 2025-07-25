'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Briefcase, 
  Upload, 
  Search, 
  ArrowLeft,
  Sun,
  Moon,
  LogOut,
  Users,
  Activity,
  Clock,
  TrendingUp,
  Shield,
  X,
  Camera
} from 'lucide-react'
import styles from './TeamManagement.module.css'

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
  'Product Manager', 'Marketing Manager', 'Sales Executive', 'HR Manager', 'Finance Manager',
  'DevOps Engineer', 'Data Analyst', 'Quality Assurance', 'Project Manager', 'Team Lead'
]

const allowedEmails = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

export default function TeamManagementPage() {
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
      // Premium demo data as fallback
      setEmployees([
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah.chen@company.com',
          phone: '+1 (555) 123-4567',
          position: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          hire_date: '2023-01-15',
          salary: 120000,
          status: 'active',
          bio: 'Passionate frontend architect with expertise in React, TypeScript, and modern web technologies. Leading the development of our next-generation user interfaces.',
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Figma'],
          projects: ['Dashboard Redesign', 'Mobile App UI', 'Design System'],
          performance_rating: 4.9,
          created_at: '2023-01-15T00:00:00Z',
          updated_at: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          email: 'marcus.r@company.com',
          phone: '+1 (555) 987-6543',
          position: 'Product Manager',
          department: 'Product',
          location: 'Austin, TX',
          hire_date: '2022-08-20',
          salary: 135000,
          status: 'active',
          bio: 'Strategic product leader focused on user experience and market growth. Driving product vision and cross-functional collaboration.',
          skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile', 'Roadmapping', 'Stakeholder Management'],
          projects: ['Product Roadmap Q4', 'User Research Initiative', 'Feature Prioritization'],
          performance_rating: 4.8,
          created_at: '2022-08-20T00:00:00Z',
          updated_at: '2022-08-20T00:00:00Z'
        },
        {
          id: '3',
          name: 'Elena Kowalski',
          email: 'elena.k@company.com',
          phone: '+1 (555) 456-7890',
          position: 'UI/UX Designer',
          department: 'Design',
          location: 'New York, NY',
          hire_date: '2023-03-10',
          salary: 95000,
          status: 'active',
          bio: 'Creative designer passionate about creating intuitive and beautiful user experiences. Specializing in interaction design and user research.',
          skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems', 'Accessibility'],
          projects: ['Mobile Banking App', 'Accessibility Audit', 'Brand Guidelines'],
          performance_rating: 4.7,
          created_at: '2023-03-10T00:00:00Z',
          updated_at: '2023-03-10T00:00:00Z'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Complete photo upload function that saves to Supabase Storage and Database
  const handlePhotoUpload = async (employeeId: string, file: File) => {
    try {
      setUploadingPhoto(employeeId)
      
      // Validate file
      if (!file) {
        throw new Error('No file selected')
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`
      const filePath = `employee-photos/${fileName}`

      // Delete old photo if exists
      const employee = employees.find(emp => emp.id === employeeId)
      if (employee?.photo_url) {
        const oldPath = employee.photo_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('employee-photos')
            .remove([`employee-photos/${oldPath}`])
        }
      }

      // Upload new photo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath)

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Update the employee in the database
      const { error: updateError } = await supabase
        .from('employees')
        .update({ photo_url: publicUrlData.publicUrl })
        .eq('id', employeeId)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, photo_url: publicUrlData.publicUrl } : emp
      ))

      console.log('Photo uploaded and saved successfully:', publicUrlData.publicUrl)

    } catch (error: any) {
      console.error('Error uploading photo:', error)
      alert(`Upload Error: ${error?.message || 'Failed to upload photo'}`)
    } finally {
      setTimeout(() => setUploadingPhoto(null), 1000)
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
    if (!confirm('Are you sure you want to delete this team member?')) return

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
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!authChecked) {
    return (
      <div className={`${styles.teamContainer} ${theme === 'dark' ? styles.teamContainerDark : styles.teamContainerLight}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    )
  }

  // Fixed TeamMemberCard component
  function TeamMemberCard({ employee }: { employee: Employee }) {
    return (
      <div className={`${styles.memberCard} ${theme === 'dark' ? styles.memberCardDark : styles.memberCardLight}`}>
        {/* Card Header */}
        <div className={`${styles.cardHeader} ${theme === 'dark' ? styles.cardHeaderDark : styles.cardHeaderLight}`}>
          <div className={styles.memberInfo}>
            <div className={styles.avatarContainer}>
              {employee.photo_url ? (
                <Image
                  src={employee.photo_url}
                  alt={employee.name}
                  width={64}
                  height={64}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User className="w-8 h-8" />
                </div>
              )}
              
              {/* Fixed upload button - completely hidden input */}
              <label className={styles.uploadButton}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ 
                    display: 'none',
                    position: 'absolute',
                    left: '-9999px',
                    opacity: 0,
                    visibility: 'hidden'
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handlePhotoUpload(employee.id, file)
                      // Clear the input value to allow re-uploading the same file
                      e.target.value = ''
                    }
                  }}
                />
                {uploadingPhoto === employee.id ? (
                  <div className={styles.uploadSpinner}></div>
                ) : (
                  <Camera className="w-3 h-3 text-white" />
                )}
              </label>
            </div>
            
            <div className={styles.memberDetails}>
              <h3 className={styles.memberName}>{employee.name}</h3>
              <p className={styles.memberPosition}>{employee.position}</p>
              <div className={`${styles.statusBadge} ${
                employee.status === 'active' ? styles.statusActive :
                employee.status === 'inactive' ? styles.statusInactive : styles.statusOnLeave
              }`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {employee.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className={styles.cardBody}>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail className={styles.contactIcon} />
              <span>{employee.email}</span>
            </div>
            <div className={styles.contactItem}>
              <Phone className={styles.contactIcon} />
              <span>{employee.phone}</span>
            </div>
            <div className={styles.contactItem}>
              <Briefcase className={styles.contactIcon} />
              <span>{employee.department}</span>
            </div>
            <div className={styles.contactItem}>
              <MapPin className={styles.contactIcon} />
              <span>{employee.location}</span>
            </div>
            <div className={styles.contactItem}>
              <Star className={styles.contactIcon} />
              <span>{employee.performance_rating}/5.0 Rating</span>
            </div>
          </div>

          {employee.bio && (
            <div className="mb-4">
              <p className="text-sm opacity-80">{employee.bio}</p>
            </div>
          )}
          
          <div className={styles.skillsSection}>
            <div className={styles.skillsLabel}>Core Skills</div>
            <div className={styles.skillsContainer}>
              {employee.skills.slice(0, 4).map((skill, index) => (
                <span key={index} className={styles.skillBadge}>
                  {skill}
                </span>
              ))}
              {employee.skills.length > 4 && (
                <span className={styles.skillBadge}>
                  +{employee.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div className={styles.cardActions}>
            <button
              onClick={() => openEditModal(employee)}
              className={`${styles.actionBtn} ${styles.editBtn}`}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(employee.id)}
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.teamContainer} ${theme === 'dark' ? styles.teamContainerDark : styles.teamContainerLight}`}>
      
      {/* Animated Background */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingElements}>
        <div className={`${styles.floatingElement} ${styles.element1}`}></div>
        <div className={`${styles.floatingElement} ${styles.element2}`}></div>
        <div className={`${styles.floatingElement} ${styles.element3}`}></div>
      </div>

      {/* Header */}
      <header className={`${styles.teamHeader} ${theme === 'dark' ? styles.teamHeaderDark : styles.teamHeaderLight}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerActions}>
            <button
              onClick={() => router.push('/')}
              className={`${styles.actionButton} ${theme === 'dark' ? styles.actionButtonDark : styles.actionButtonLight}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={toggleTheme}
              className={`${styles.actionButton} ${theme === 'dark' ? styles.actionButtonDark : styles.actionButtonLight}`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className={`${styles.actionButton} ${styles.logoutButton}`}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderFlex}>
            <div>
              <h1 className={styles.headerTitle}>Team Management</h1>
              <p className={`${styles.headerSubtitle} ${theme === 'dark' ? styles.headerSubtitleDark : styles.headerSubtitleLight}`}>
                Manage your team members, track performance, and build amazing products together
              </p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className={styles.addButton}>
              <Plus className="w-5 h-5" />
              Add Team Member
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${styles.searchInput} ${theme === 'dark' ? styles.searchInputDark : styles.searchInputLight}`}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${theme === 'dark' ? styles.statCardDark : styles.statCardLight}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Total Team Members</div>
                <div className={styles.statValue}>{employees.length}</div>
              </div>
              <div className={styles.statIcon}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${theme === 'dark' ? styles.statCardDark : styles.statCardLight}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Active Members</div>
                <div className={styles.statValue}>{employees.filter(e => e.status === 'active').length}</div>
              </div>
              <div className={styles.statIcon}>
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${theme === 'dark' ? styles.statCardDark : styles.statCardLight}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>On Leave</div>
                <div className={styles.statValue}>{employees.filter(e => e.status === 'on_leave').length}</div>
              </div>
              <div className={styles.statIcon}>
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${theme === 'dark' ? styles.statCardDark : styles.statCardLight}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Departments</div>
                <div className={styles.statValue}>{new Set(employees.map(e => e.department)).size}</div>
              </div>
              <div className={styles.statIcon}>
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : (
          <div className={styles.teamGrid}>
            {filteredEmployees.map(employee => (
              <TeamMemberCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${theme === 'dark' ? styles.modalContentDark : styles.modalContentLight}`}>
              <div className={`${styles.modalHeader} ${theme === 'dark' ? styles.modalHeaderDark : styles.modalHeaderLight}`}>
                <h2 className={styles.modalTitle}>
                  {editingEmployee ? 'Edit Team Member' : 'Add New Team Member'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingEmployee(null)
                    resetForm()
                  }}
                  className={`${styles.actionButton} ${theme === 'dark' ? styles.actionButtonDark : styles.actionButtonLight}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                        placeholder="john@company.com"
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Position</label>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className={`${styles.formSelect} ${theme === 'dark' ? styles.formSelectDark : styles.formSelectLight}`}
                        required
                      >
                        <option value="">Select position</option>
                        {positions.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className={`${styles.formSelect} ${theme === 'dark' ? styles.formSelectDark : styles.formSelectLight}`}
                        required
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Hire Date</label>
                      <input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        required
                        className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Annual Salary</label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                        placeholder="75000"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on_leave' })}
                      className={`${styles.formSelect} ${theme === 'dark' ? styles.formSelectDark : styles.formSelectLight}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                  
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Brief description about the team member..."
                      rows={3}
                      className={`${styles.formTextarea} ${theme === 'dark' ? styles.formTextareaDark : styles.formTextareaLight}`}
                    />
                  </div>
                  
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="React, TypeScript, Node.js, Python"
                      className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                    />
                  </div>
                  
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Current Projects (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.projects}
                      onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                      placeholder="E-commerce Platform, Mobile App, Dashboard"
                      className={`${styles.formInput} ${theme === 'dark' ? styles.formInputDark : styles.formInputLight}`}
                    />
                  </div>

                  <div className={`${styles.formActions} ${theme === 'dark' ? styles.formActionsDark : styles.formActionsLight}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false)
                        setEditingEmployee(null)
                        resetForm()
                      }}
                      className={`${styles.cancelBtn} ${theme === 'dark' ? styles.cancelBtnDark : styles.cancelBtnLight}`}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      {editingEmployee ? 'Update Member' : 'Add Member'}
                    </button>
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