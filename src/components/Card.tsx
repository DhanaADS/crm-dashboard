import { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border bg-card p-6 text-card-foreground shadow-sm ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}