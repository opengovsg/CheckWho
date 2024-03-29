import { Redirect, Route, RouteProps } from 'react-router-dom'
import { LOGIN_ROUTE } from '@constants/routes'

import { useAuth } from '@/contexts/auth/AuthContext'

export const PrivateRoute = ({
  children,
  ...rest
}: Omit<RouteProps, 'render'>): JSX.Element => {
  const { isAuthenticated } = useAuth()

  return (
    <Route
      {...rest}
      render={({ location }) => {
        return isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: LOGIN_ROUTE,
              state: { from: location },
            }}
          />
        )
      }}
    />
  )
}
