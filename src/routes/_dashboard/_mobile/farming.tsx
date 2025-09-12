import { createFileRoute, Link } from '@tanstack/react-router'
import { Fish, Database, AlertTriangle, ChefHat, Calendar } from 'lucide-react'

export const Route = createFileRoute('/_dashboard/_mobile/farming')({
  component: RouteComponent,
})

const farmingMenus = [
  {
    title: 'Fish Growth',
    path: '/farming/fish-growth',
    icon: Fish,
    description: 'Track and monitor fish growth progress and health metrics',
    iconColor: 'text-teal-400',
    borderColor: 'border-teal-400/30',
    bgGlow: 'bg-teal-400/5'
  },
  {
    title: 'Feed Management',
    path: '/farming/feeds',
    icon: Database,
    description: 'Manage feeding schedules and monitor feed consumption',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-400/30',
    bgGlow: 'bg-orange-400/5'
  },
  {
    title: 'Fish Mortality',
    path: '/farming/fish-mortality',
    icon: AlertTriangle,
    description: 'Monitor fish mortality rates and health incidents',
    iconColor: 'text-red-400',
    borderColor: 'border-red-400/30',
    bgGlow: 'bg-red-400/5'
  },
  {
    title: 'Manual Data Entry',
    path: '/farming/manual-data',
    icon: ChefHat,
    description: 'Record manual observations and farm data entries',
    iconColor: 'text-indigo-400',
    borderColor: 'border-indigo-400/30',
    bgGlow: 'bg-indigo-400/5'
  },
  {
    title: 'Water Change',
    path: '/farming/water-change',
    icon: Calendar,
    description: 'Schedule and track water quality management tasks',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/30',
    bgGlow: 'bg-cyan-400/5'
  }
]

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Farming Management
          </h1>
          <p className="text-gray-600/80">Comprehensive aquaculture farming data and operations management</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmingMenus.map((menu) => {
            const IconComponent = menu.icon
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className="group block"
              >
                <div className={`
                  relative backdrop-blur-md bg-white/20 ${menu.bgGlow}
                  border ${menu.borderColor} rounded-2xl p-6 
                  shadow-xl shadow-black/5
                  transform transition-all duration-500 ease-out
                  hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10
                  hover:bg-white/30 hover:backdrop-blur-lg
                  before:absolute before:inset-0 before:rounded-2xl 
                  before:bg-gradient-to-br before:from-white/10 before:to-transparent
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
                `}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`
                        backdrop-blur-sm bg-white/20 rounded-xl p-3 
                        border border-white/30 ${menu.iconColor}
                        group-hover:bg-white/30 group-hover:scale-110
                        transition-all duration-300
                      `}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className={`
                        opacity-0 group-hover:opacity-100 transition-all duration-300
                        ${menu.iconColor} group-hover:translate-x-1
                      `}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                      {menu.title}
                    </h3>
                    <p className="text-gray-600/90 text-sm leading-relaxed group-hover:text-gray-700/90 transition-colors duration-300">
                      {menu.description}
                    </p>
                  </div>
                  
                  {/* Subtle glow effect */}
                  <div className={`
                    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 
                    transition-opacity duration-500 ${menu.bgGlow} blur-xl
                  `} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
