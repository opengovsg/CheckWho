import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import ProfileForm from '../pages/profile'
import WelcomePage from '../pages/welcome'
import CallForm from '../pages/dashboard'
import LoadingSpinner from '../components/LoadingSpinner'
import ProfileGuard from '../components/ProfileGuard'

import {
  LOGIN_ROUTE,
  ROOT_ROUTE,
  CALLFORM_ROUTE,
  PROFILE_ROUTE,
  WELCOME_ROUTE,
} from '../constants/routes'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

const LoginPage = lazy(() => import('../pages/login'))

export const AppRouter = (): JSX.Element => {
  const history = useHistory()

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* TODO: add root page */}
        <PublicRoute exact path={ROOT_ROUTE}>
          <Redirect to={LOGIN_ROUTE} />
        </PublicRoute>
        <PublicRoute exact path={LOGIN_ROUTE}>
          <LoginPage onLogin={() => history.push(CALLFORM_ROUTE)} />
        </PublicRoute>
        <PrivateRoute exact path={CALLFORM_ROUTE}>
          <ProfileGuard>
            <CallForm />
          </ProfileGuard>
        </PrivateRoute>
        <PrivateRoute exact path={WELCOME_ROUTE}>
          <WelcomePage />
        </PrivateRoute>
        <PrivateRoute exact path={PROFILE_ROUTE}>
          <ProfileForm onSubmit={() => history.push(CALLFORM_ROUTE)} />
        </PrivateRoute>
        {/* TODO: add 404 page */}
        <Route path="*">404</Route>
      </Switch>
    </Suspense>
  )
}
