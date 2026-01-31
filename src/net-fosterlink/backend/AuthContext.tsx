import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { UserModel } from './models/UserModel'
import type { PrivilegeModel } from './models/PrivilegeModel'

export interface AuthContextType {
    token: string | null,
    setToken: (token: string | null) => void,
    api: ReturnType<typeof axios.create>,
    isLoggedIn: () => boolean,
    logout: () => void,
    setUserInfo: (user: UserModel) => void,
    getUserInfo: () => UserModel | undefined,
    getMapsApiKey: () => string,
    faqAuthor: boolean,
    agent: boolean,
    admin: boolean | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ apiUrl, mapsApiKey, children }: { apiUrl: string, mapsApiKey: string, children: React.ReactNode }) => {
    const navigate = useNavigate()
    const [token, setToken] = useState<string | null>(
        sessionStorage.getItem("jwt")
    )
    const [admin, setAdmin] = useState<boolean | null>(null)
    const [faqAuthor, setFaqAuthor] = useState(false)
    const [agent, setAgent] = useState(false)
    const currentUserInfo = useRef<UserModel | undefined>(
        undefined
    )
    const api = axios.create({ baseURL: apiUrl })
    api.interceptors.request.use((cfg) => {
        cfg.headers.Authorization = `Bearer ${token}`
        return cfg
    })

    const updateToken = (newToken: string | null) => {
        setToken(newToken)
        if (newToken) sessionStorage.setItem("jwt", newToken)
        else sessionStorage.removeItem("jwt")
    }

    const forceLogout = () => {
        updateToken(null)
        setAdmin(false)
        setAgent(false)
        setFaqAuthor(false)
        currentUserInfo.current = undefined
        navigate("/")
    }

    api.interceptors.response.use(
        (res) => res,
        (err) => {
            const status = err?.response?.status
            const url = err?.config?.url ?? ""
            const isLoginRequest = String(url).includes("/users/login")
            if (status === 401 && !isLoginRequest) {
                forceLogout()
            }
            return Promise.reject(err)
        }
    )

    useEffect(() => {
        if (token != null) {
            api.get(`/users/getInfo`).then(res => {
                if (res.status == 200) {
                    currentUserInfo.current = res.data
                    api.get(`/users/privileges`).then(pri => {
                        const priv: PrivilegeModel = pri.data
                        setAdmin(priv.admin)
                        setAgent(priv.agent)
                        setFaqAuthor(priv.faqAuthor)
                    })
                }
            })
        }
    }, [token])
    const isLoggedIn = () => {
        const s = sessionStorage.getItem("jwt")
        return s != null && s != ""
    }
    const getMapsApiKey = () => {
        return mapsApiKey
    }
    const logout = () => {
        api.post("/users/logout").then(forceLogout).catch(forceLogout)
    }
    const setUserInfo = (user: UserModel) => {
        currentUserInfo.current = user
    }
    const getUserInfo = (): UserModel | undefined => {
        return currentUserInfo.current
    }

    const contextValue = useMemo(() => ({
        token,
        setToken: updateToken,
        api,
        isLoggedIn,
        logout,
        setUserInfo,
        getUserInfo,
        getMapsApiKey,
        faqAuthor,
        agent,
        admin
    }), [token, faqAuthor, agent, admin])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used insisde auth provider")
    return ctx
}