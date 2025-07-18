/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as UnauthorizedRouteImport } from './routes/unauthorized'
import { Route as DashboardRouteImport } from './routes/_dashboard'
import { Route as AuthRouteImport } from './routes/_auth'
import { Route as R404RouteImport } from './routes/404'
import { Route as IndexRouteImport } from './routes/index'
import { Route as DashboardWaterEventsRouteImport } from './routes/_dashboard/water-events'
import { Route as DashboardUsersRouteImport } from './routes/_dashboard/users'
import { Route as DashboardNotificationsRouteImport } from './routes/_dashboard/notifications'
import { Route as DashboardManageDevicesRouteImport } from './routes/_dashboard/manage-devices'
import { Route as DashboardFishMortalityRouteImport } from './routes/_dashboard/fish-mortality'
import { Route as DashboardFishGrowthRouteImport } from './routes/_dashboard/fish-growth'
import { Route as DashboardFeedsRouteImport } from './routes/_dashboard/feeds'
import { Route as DashboardDashboardRouteImport } from './routes/_dashboard/dashboard'
import { Route as AuthRegisterRouteImport } from './routes/_auth/register'
import { Route as AuthLoginRouteImport } from './routes/_auth/login'
import { Route as AuthForgotPasswordRouteImport } from './routes/_auth/forgot-password'
import { Route as DashboardDevicesIndexRouteImport } from './routes/_dashboard/devices/index'
import { Route as DashboardDevicesSensorDataRouteImport } from './routes/_dashboard/devices/sensor-data'
import { Route as DashboardDevicesManualDataRouteImport } from './routes/_dashboard/devices/manual-data'
import { Route as DashboardDevicesManageRouteImport } from './routes/_dashboard/devices/manage'
import { Route as DashboardMobileMonitoringRouteImport } from './routes/_dashboard/_mobile/monitoring'
import { Route as DashboardMobileFishFarmingRouteImport } from './routes/_dashboard/_mobile/fish-farming'
import { Route as DashboardMobileDeviceRouteImport } from './routes/_dashboard/_mobile/device'
import { Route as DashboardMobileAdminRouteImport } from './routes/_dashboard/_mobile/admin'
import { Route as AuthResetPasswordTokenRouteImport } from './routes/_auth/reset-password/$token'

const UnauthorizedRoute = UnauthorizedRouteImport.update({
  id: '/unauthorized',
  path: '/unauthorized',
  getParentRoute: () => rootRouteImport,
} as any)
const DashboardRoute = DashboardRouteImport.update({
  id: '/_dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthRoute = AuthRouteImport.update({
  id: '/_auth',
  getParentRoute: () => rootRouteImport,
} as any)
const R404Route = R404RouteImport.update({
  id: '/404',
  path: '/404',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const DashboardWaterEventsRoute = DashboardWaterEventsRouteImport.update({
  id: '/water-events',
  path: '/water-events',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardUsersRoute = DashboardUsersRouteImport.update({
  id: '/users',
  path: '/users',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardNotificationsRoute = DashboardNotificationsRouteImport.update({
  id: '/notifications',
  path: '/notifications',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardManageDevicesRoute = DashboardManageDevicesRouteImport.update({
  id: '/manage-devices',
  path: '/manage-devices',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardFishMortalityRoute = DashboardFishMortalityRouteImport.update({
  id: '/fish-mortality',
  path: '/fish-mortality',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardFishGrowthRoute = DashboardFishGrowthRouteImport.update({
  id: '/fish-growth',
  path: '/fish-growth',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardFeedsRoute = DashboardFeedsRouteImport.update({
  id: '/feeds',
  path: '/feeds',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardDashboardRoute = DashboardDashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => DashboardRoute,
} as any)
const AuthRegisterRoute = AuthRegisterRouteImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => AuthRoute,
} as any)
const AuthLoginRoute = AuthLoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => AuthRoute,
} as any)
const AuthForgotPasswordRoute = AuthForgotPasswordRouteImport.update({
  id: '/forgot-password',
  path: '/forgot-password',
  getParentRoute: () => AuthRoute,
} as any)
const DashboardDevicesIndexRoute = DashboardDevicesIndexRouteImport.update({
  id: '/devices/',
  path: '/devices/',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardDevicesSensorDataRoute =
  DashboardDevicesSensorDataRouteImport.update({
    id: '/devices/sensor-data',
    path: '/devices/sensor-data',
    getParentRoute: () => DashboardRoute,
  } as any)
const DashboardDevicesManualDataRoute =
  DashboardDevicesManualDataRouteImport.update({
    id: '/devices/manual-data',
    path: '/devices/manual-data',
    getParentRoute: () => DashboardRoute,
  } as any)
const DashboardDevicesManageRoute = DashboardDevicesManageRouteImport.update({
  id: '/devices/manage',
  path: '/devices/manage',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardMobileMonitoringRoute =
  DashboardMobileMonitoringRouteImport.update({
    id: '/_mobile/monitoring',
    path: '/monitoring',
    getParentRoute: () => DashboardRoute,
  } as any)
const DashboardMobileFishFarmingRoute =
  DashboardMobileFishFarmingRouteImport.update({
    id: '/_mobile/fish-farming',
    path: '/fish-farming',
    getParentRoute: () => DashboardRoute,
  } as any)
const DashboardMobileDeviceRoute = DashboardMobileDeviceRouteImport.update({
  id: '/_mobile/device',
  path: '/device',
  getParentRoute: () => DashboardRoute,
} as any)
const DashboardMobileAdminRoute = DashboardMobileAdminRouteImport.update({
  id: '/_mobile/admin',
  path: '/admin',
  getParentRoute: () => DashboardRoute,
} as any)
const AuthResetPasswordTokenRoute = AuthResetPasswordTokenRouteImport.update({
  id: '/reset-password/$token',
  path: '/reset-password/$token',
  getParentRoute: () => AuthRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/404': typeof R404Route
  '/unauthorized': typeof UnauthorizedRoute
  '/forgot-password': typeof AuthForgotPasswordRoute
  '/login': typeof AuthLoginRoute
  '/register': typeof AuthRegisterRoute
  '/dashboard': typeof DashboardDashboardRoute
  '/feeds': typeof DashboardFeedsRoute
  '/fish-growth': typeof DashboardFishGrowthRoute
  '/fish-mortality': typeof DashboardFishMortalityRoute
  '/manage-devices': typeof DashboardManageDevicesRoute
  '/notifications': typeof DashboardNotificationsRoute
  '/users': typeof DashboardUsersRoute
  '/water-events': typeof DashboardWaterEventsRoute
  '/reset-password/$token': typeof AuthResetPasswordTokenRoute
  '/admin': typeof DashboardMobileAdminRoute
  '/device': typeof DashboardMobileDeviceRoute
  '/fish-farming': typeof DashboardMobileFishFarmingRoute
  '/monitoring': typeof DashboardMobileMonitoringRoute
  '/devices/manage': typeof DashboardDevicesManageRoute
  '/devices/manual-data': typeof DashboardDevicesManualDataRoute
  '/devices/sensor-data': typeof DashboardDevicesSensorDataRoute
  '/devices': typeof DashboardDevicesIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/404': typeof R404Route
  '/unauthorized': typeof UnauthorizedRoute
  '/forgot-password': typeof AuthForgotPasswordRoute
  '/login': typeof AuthLoginRoute
  '/register': typeof AuthRegisterRoute
  '/dashboard': typeof DashboardDashboardRoute
  '/feeds': typeof DashboardFeedsRoute
  '/fish-growth': typeof DashboardFishGrowthRoute
  '/fish-mortality': typeof DashboardFishMortalityRoute
  '/manage-devices': typeof DashboardManageDevicesRoute
  '/notifications': typeof DashboardNotificationsRoute
  '/users': typeof DashboardUsersRoute
  '/water-events': typeof DashboardWaterEventsRoute
  '/reset-password/$token': typeof AuthResetPasswordTokenRoute
  '/admin': typeof DashboardMobileAdminRoute
  '/device': typeof DashboardMobileDeviceRoute
  '/fish-farming': typeof DashboardMobileFishFarmingRoute
  '/monitoring': typeof DashboardMobileMonitoringRoute
  '/devices/manage': typeof DashboardDevicesManageRoute
  '/devices/manual-data': typeof DashboardDevicesManualDataRoute
  '/devices/sensor-data': typeof DashboardDevicesSensorDataRoute
  '/devices': typeof DashboardDevicesIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/404': typeof R404Route
  '/_auth': typeof AuthRouteWithChildren
  '/_dashboard': typeof DashboardRouteWithChildren
  '/unauthorized': typeof UnauthorizedRoute
  '/_auth/forgot-password': typeof AuthForgotPasswordRoute
  '/_auth/login': typeof AuthLoginRoute
  '/_auth/register': typeof AuthRegisterRoute
  '/_dashboard/dashboard': typeof DashboardDashboardRoute
  '/_dashboard/feeds': typeof DashboardFeedsRoute
  '/_dashboard/fish-growth': typeof DashboardFishGrowthRoute
  '/_dashboard/fish-mortality': typeof DashboardFishMortalityRoute
  '/_dashboard/manage-devices': typeof DashboardManageDevicesRoute
  '/_dashboard/notifications': typeof DashboardNotificationsRoute
  '/_dashboard/users': typeof DashboardUsersRoute
  '/_dashboard/water-events': typeof DashboardWaterEventsRoute
  '/_auth/reset-password/$token': typeof AuthResetPasswordTokenRoute
  '/_dashboard/_mobile/admin': typeof DashboardMobileAdminRoute
  '/_dashboard/_mobile/device': typeof DashboardMobileDeviceRoute
  '/_dashboard/_mobile/fish-farming': typeof DashboardMobileFishFarmingRoute
  '/_dashboard/_mobile/monitoring': typeof DashboardMobileMonitoringRoute
  '/_dashboard/devices/manage': typeof DashboardDevicesManageRoute
  '/_dashboard/devices/manual-data': typeof DashboardDevicesManualDataRoute
  '/_dashboard/devices/sensor-data': typeof DashboardDevicesSensorDataRoute
  '/_dashboard/devices/': typeof DashboardDevicesIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/404'
    | '/unauthorized'
    | '/forgot-password'
    | '/login'
    | '/register'
    | '/dashboard'
    | '/feeds'
    | '/fish-growth'
    | '/fish-mortality'
    | '/manage-devices'
    | '/notifications'
    | '/users'
    | '/water-events'
    | '/reset-password/$token'
    | '/admin'
    | '/device'
    | '/fish-farming'
    | '/monitoring'
    | '/devices/manage'
    | '/devices/manual-data'
    | '/devices/sensor-data'
    | '/devices'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/404'
    | '/unauthorized'
    | '/forgot-password'
    | '/login'
    | '/register'
    | '/dashboard'
    | '/feeds'
    | '/fish-growth'
    | '/fish-mortality'
    | '/manage-devices'
    | '/notifications'
    | '/users'
    | '/water-events'
    | '/reset-password/$token'
    | '/admin'
    | '/device'
    | '/fish-farming'
    | '/monitoring'
    | '/devices/manage'
    | '/devices/manual-data'
    | '/devices/sensor-data'
    | '/devices'
  id:
    | '__root__'
    | '/'
    | '/404'
    | '/_auth'
    | '/_dashboard'
    | '/unauthorized'
    | '/_auth/forgot-password'
    | '/_auth/login'
    | '/_auth/register'
    | '/_dashboard/dashboard'
    | '/_dashboard/feeds'
    | '/_dashboard/fish-growth'
    | '/_dashboard/fish-mortality'
    | '/_dashboard/manage-devices'
    | '/_dashboard/notifications'
    | '/_dashboard/users'
    | '/_dashboard/water-events'
    | '/_auth/reset-password/$token'
    | '/_dashboard/_mobile/admin'
    | '/_dashboard/_mobile/device'
    | '/_dashboard/_mobile/fish-farming'
    | '/_dashboard/_mobile/monitoring'
    | '/_dashboard/devices/manage'
    | '/_dashboard/devices/manual-data'
    | '/_dashboard/devices/sensor-data'
    | '/_dashboard/devices/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  R404Route: typeof R404Route
  AuthRoute: typeof AuthRouteWithChildren
  DashboardRoute: typeof DashboardRouteWithChildren
  UnauthorizedRoute: typeof UnauthorizedRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/unauthorized': {
      id: '/unauthorized'
      path: '/unauthorized'
      fullPath: '/unauthorized'
      preLoaderRoute: typeof UnauthorizedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_dashboard': {
      id: '/_dashboard'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/404': {
      id: '/404'
      path: '/404'
      fullPath: '/404'
      preLoaderRoute: typeof R404RouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_dashboard/water-events': {
      id: '/_dashboard/water-events'
      path: '/water-events'
      fullPath: '/water-events'
      preLoaderRoute: typeof DashboardWaterEventsRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/users': {
      id: '/_dashboard/users'
      path: '/users'
      fullPath: '/users'
      preLoaderRoute: typeof DashboardUsersRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/notifications': {
      id: '/_dashboard/notifications'
      path: '/notifications'
      fullPath: '/notifications'
      preLoaderRoute: typeof DashboardNotificationsRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/manage-devices': {
      id: '/_dashboard/manage-devices'
      path: '/manage-devices'
      fullPath: '/manage-devices'
      preLoaderRoute: typeof DashboardManageDevicesRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/fish-mortality': {
      id: '/_dashboard/fish-mortality'
      path: '/fish-mortality'
      fullPath: '/fish-mortality'
      preLoaderRoute: typeof DashboardFishMortalityRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/fish-growth': {
      id: '/_dashboard/fish-growth'
      path: '/fish-growth'
      fullPath: '/fish-growth'
      preLoaderRoute: typeof DashboardFishGrowthRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/feeds': {
      id: '/_dashboard/feeds'
      path: '/feeds'
      fullPath: '/feeds'
      preLoaderRoute: typeof DashboardFeedsRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/dashboard': {
      id: '/_dashboard/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardDashboardRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_auth/register': {
      id: '/_auth/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof AuthRegisterRouteImport
      parentRoute: typeof AuthRoute
    }
    '/_auth/login': {
      id: '/_auth/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof AuthLoginRouteImport
      parentRoute: typeof AuthRoute
    }
    '/_auth/forgot-password': {
      id: '/_auth/forgot-password'
      path: '/forgot-password'
      fullPath: '/forgot-password'
      preLoaderRoute: typeof AuthForgotPasswordRouteImport
      parentRoute: typeof AuthRoute
    }
    '/_dashboard/devices/': {
      id: '/_dashboard/devices/'
      path: '/devices'
      fullPath: '/devices'
      preLoaderRoute: typeof DashboardDevicesIndexRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/devices/sensor-data': {
      id: '/_dashboard/devices/sensor-data'
      path: '/devices/sensor-data'
      fullPath: '/devices/sensor-data'
      preLoaderRoute: typeof DashboardDevicesSensorDataRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/devices/manual-data': {
      id: '/_dashboard/devices/manual-data'
      path: '/devices/manual-data'
      fullPath: '/devices/manual-data'
      preLoaderRoute: typeof DashboardDevicesManualDataRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/devices/manage': {
      id: '/_dashboard/devices/manage'
      path: '/devices/manage'
      fullPath: '/devices/manage'
      preLoaderRoute: typeof DashboardDevicesManageRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/_mobile/monitoring': {
      id: '/_dashboard/_mobile/monitoring'
      path: '/monitoring'
      fullPath: '/monitoring'
      preLoaderRoute: typeof DashboardMobileMonitoringRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/_mobile/fish-farming': {
      id: '/_dashboard/_mobile/fish-farming'
      path: '/fish-farming'
      fullPath: '/fish-farming'
      preLoaderRoute: typeof DashboardMobileFishFarmingRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/_mobile/device': {
      id: '/_dashboard/_mobile/device'
      path: '/device'
      fullPath: '/device'
      preLoaderRoute: typeof DashboardMobileDeviceRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_dashboard/_mobile/admin': {
      id: '/_dashboard/_mobile/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof DashboardMobileAdminRouteImport
      parentRoute: typeof DashboardRoute
    }
    '/_auth/reset-password/$token': {
      id: '/_auth/reset-password/$token'
      path: '/reset-password/$token'
      fullPath: '/reset-password/$token'
      preLoaderRoute: typeof AuthResetPasswordTokenRouteImport
      parentRoute: typeof AuthRoute
    }
  }
}

interface AuthRouteChildren {
  AuthForgotPasswordRoute: typeof AuthForgotPasswordRoute
  AuthLoginRoute: typeof AuthLoginRoute
  AuthRegisterRoute: typeof AuthRegisterRoute
  AuthResetPasswordTokenRoute: typeof AuthResetPasswordTokenRoute
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthForgotPasswordRoute: AuthForgotPasswordRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthRegisterRoute: AuthRegisterRoute,
  AuthResetPasswordTokenRoute: AuthResetPasswordTokenRoute,
}

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren)

interface DashboardRouteChildren {
  DashboardDashboardRoute: typeof DashboardDashboardRoute
  DashboardFeedsRoute: typeof DashboardFeedsRoute
  DashboardFishGrowthRoute: typeof DashboardFishGrowthRoute
  DashboardFishMortalityRoute: typeof DashboardFishMortalityRoute
  DashboardManageDevicesRoute: typeof DashboardManageDevicesRoute
  DashboardNotificationsRoute: typeof DashboardNotificationsRoute
  DashboardUsersRoute: typeof DashboardUsersRoute
  DashboardWaterEventsRoute: typeof DashboardWaterEventsRoute
  DashboardMobileAdminRoute: typeof DashboardMobileAdminRoute
  DashboardMobileDeviceRoute: typeof DashboardMobileDeviceRoute
  DashboardMobileFishFarmingRoute: typeof DashboardMobileFishFarmingRoute
  DashboardMobileMonitoringRoute: typeof DashboardMobileMonitoringRoute
  DashboardDevicesManageRoute: typeof DashboardDevicesManageRoute
  DashboardDevicesManualDataRoute: typeof DashboardDevicesManualDataRoute
  DashboardDevicesSensorDataRoute: typeof DashboardDevicesSensorDataRoute
  DashboardDevicesIndexRoute: typeof DashboardDevicesIndexRoute
}

const DashboardRouteChildren: DashboardRouteChildren = {
  DashboardDashboardRoute: DashboardDashboardRoute,
  DashboardFeedsRoute: DashboardFeedsRoute,
  DashboardFishGrowthRoute: DashboardFishGrowthRoute,
  DashboardFishMortalityRoute: DashboardFishMortalityRoute,
  DashboardManageDevicesRoute: DashboardManageDevicesRoute,
  DashboardNotificationsRoute: DashboardNotificationsRoute,
  DashboardUsersRoute: DashboardUsersRoute,
  DashboardWaterEventsRoute: DashboardWaterEventsRoute,
  DashboardMobileAdminRoute: DashboardMobileAdminRoute,
  DashboardMobileDeviceRoute: DashboardMobileDeviceRoute,
  DashboardMobileFishFarmingRoute: DashboardMobileFishFarmingRoute,
  DashboardMobileMonitoringRoute: DashboardMobileMonitoringRoute,
  DashboardDevicesManageRoute: DashboardDevicesManageRoute,
  DashboardDevicesManualDataRoute: DashboardDevicesManualDataRoute,
  DashboardDevicesSensorDataRoute: DashboardDevicesSensorDataRoute,
  DashboardDevicesIndexRoute: DashboardDevicesIndexRoute,
}

const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  R404Route: R404Route,
  AuthRoute: AuthRouteWithChildren,
  DashboardRoute: DashboardRouteWithChildren,
  UnauthorizedRoute: UnauthorizedRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
