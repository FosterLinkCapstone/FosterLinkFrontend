import axios from 'axios'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router'

export interface AuthContextType {
    token: string | null,
    setToken: (token: string | null) => void,
    api: ReturnType<typeof axios.create>,
    isLoggedIn: () => boolean,
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({apiUrl, children}: { apiUrl: string, children: React.ReactNode}) => {
    const navigate = useNavigate()
    const [token, setToken] = useState<string | null>(
        sessionStorage.getItem("jwt")
    )
    const api = axios.create({baseURL: apiUrl})

    api.interceptors.request.use((cfg) => {
        cfg.headers.Authorization = `Bearer ${token}`
        return cfg
    })

    const isLoggedIn = () => {
        const s = sessionStorage.getItem("jwt")
        return s != null && s != "" 
    }

    const updateToken = (newToken: string | null) => {
        setToken(newToken)
        if (newToken) sessionStorage.setItem("jwt", newToken)
        else sessionStorage.removeItem("jwt")
    };
    const logout = () => {
        updateToken(null)
        navigate("/")
    }
    return(
        <AuthContext.Provider value={{token, setToken:updateToken, api, isLoggedIn, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used insisde auth provider")
    return ctx
}