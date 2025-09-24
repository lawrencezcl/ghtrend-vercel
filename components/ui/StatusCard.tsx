import React from 'react'

interface StatusCardProps {
  title: string
  value: string | number
  description: string
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow'
  icon?: string
}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600', 
  red: 'text-red-600',
  purple: 'text-purple-600',
  yellow: 'text-yellow-600'
}

export function StatusCard({ 
  title, 
  value, 
  description, 
  color = 'blue',
  icon 
}: StatusCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className={`text-2xl font-bold ${colorClasses[color]} mt-1`}>
            {icon && <span className="mr-2">{icon}</span>}
            {value}
          </p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}