import React, {
  createContext,
  Dispatch,
  ReactChild,
  ReactChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react'

interface AuthProps {
  children: ReactChild | ReactChildren
}

interface AuthState {
  isAuthenticated: boolean
  email: string
  name: string
  _id: string
}

interface AuthContext {
  authState: AuthState
  setAuthState: (authState: AuthState) => void
}

export const AuthContext = createContext<AuthContext>({
  authState: {
    isAuthenticated: false,
    email: '',
    name: '',
    _id: '',
  },
  setAuthState: (authState) => {},
})

const AuthProvider = ({ children }: AuthProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: '',
    name: '',
    _id: '',
  })
  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider