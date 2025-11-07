import { createFileRoute, Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_dashboard/_mobile/admin')({
  component: RouteComponent,
})

const adminMenus = [
  {
    titleKey: 'mobile.menus.userManagement.title',
    path: '/admin/users',
    icon: Users,
    descriptionKey: 'mobile.menus.userManagement.description',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-400/30',
    bgGlow: 'bg-violet-400/5'
  }
]

function RouteComponent() {
  const { t } = useTranslation('admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            {t('mobile.title')}
          </h1>
          <p className="text-gray-600/80">{t('mobile.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenus.map((menu) => {
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
                      {t(menu.titleKey)}
                    </h3>
                    <p className="text-gray-600/90 text-sm leading-relaxed group-hover:text-gray-700/90 transition-colors duration-300">
                      {t(menu.descriptionKey)}
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
