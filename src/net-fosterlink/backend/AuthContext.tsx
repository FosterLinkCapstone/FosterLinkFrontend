import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { UserModel } from './models/UserModel'
import type { PrivilegeModel } from './models/PrivilegeModel'
import Cookies from 'js-cookie'

const STORAGE_KEY = 'jwt'
const PERSISTENT_FLAG = 'auth_persistent'

function readStoredToken(): string | null {
    try {
        if (localStorage.getItem(PERSISTENT_FLAG) === 'true') {
            return localStorage.getItem(STORAGE_KEY)
        }
        return sessionStorage.getItem(STORAGE_KEY)
    } catch {
        return null
    }
}

function writeToken(token: string, stayLoggedIn: boolean) {
    try {
        if (stayLoggedIn) {
            localStorage.setItem(PERSISTENT_FLAG, 'true')
            localStorage.setItem(STORAGE_KEY, token)
            sessionStorage.removeItem(STORAGE_KEY)
        } else {
            sessionStorage.setItem(STORAGE_KEY, token)
            localStorage.removeItem(PERSISTENT_FLAG)
            localStorage.removeItem(STORAGE_KEY)
        }
    } catch {
        // ignore
    }
}

function clearToken() {
    try {
        localStorage.removeItem(PERSISTENT_FLAG)
        localStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
}

export interface AuthContextType {
    token: string | null,
    isAuthenticated: boolean,
    setToken: (token: string | null, stayLoggedIn?: boolean) => void,
    api: ReturnType<typeof axios.create>,
    isLoggedIn: () => boolean,
    logout: () => void,
    logoutAll: () => void,
    setUserInfo: (user: UserModel) => void,
    getUserInfo: () => UserModel | undefined,
    faqAuthor: boolean,
    agent: boolean,
    admin: boolean | null,
    restricted: boolean,
    banned: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ apiUrl, children }: { apiUrl: string, children: React.ReactNode }) => {
    const navigate = useNavigate()

    const [token, setTokenState] = useState<string | null>(readStoredToken)

    const [admin, setAdmin] = useState<boolean | null>(null)
    const [faqAuthor, setFaqAuthor] = useState(false)
    const [agent, setAgent] = useState(false)
    const [restricted, setRestricted] = useState(false)
    const [banned, setBanned] = useState(false)
    const currentUserInfo = useRef<UserModel | undefined>(undefined)

    // Refs for the refresh queue (single-flight refresh with concurrent request queuing)
    const isRefreshing = useRef(false)
    const failedQueue = useRef<Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }>>([])

    // Main API client — token applied synchronously so child components can make
    // authenticated requests during their own mount effects without racing the
    // deferred useEffect that sets up interceptors.
    const api = useMemo(() => {
        const instance = axios.create({ baseURL: apiUrl })
        const stored = readStoredToken()
        if (stored) {
            instance.defaults.headers.common.Authorization = `Bearer ${stored}`
        }
        return instance
    }, [apiUrl])

    // Dedicated refresh client — no auth interceptor, no 401 retry, no CSRF header.
    // withCredentials ensures the HttpOnly refresh_token cookie is sent.
    const refreshClient = useMemo(() => axios.create({ baseURL: apiUrl, withCredentials: true }), [apiUrl])

    const setToken = (newToken: string | null, stayLoggedIn?: boolean) => {
        if (newToken) {
            const persist = stayLoggedIn ?? (typeof localStorage !== 'undefined' && localStorage.getItem(PERSISTENT_FLAG) === 'true')
            writeToken(newToken, persist)
            setTokenState(newToken)
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        } else {
            clearToken()
            setTokenState(null)
            delete api.defaults.headers.common.Authorization
        }
    }

    const forceLogout = () => {
        clearToken()
        setTokenState(null)
        delete api.defaults.headers.common.Authorization
        setAdmin(false)
        setAgent(false)
        setFaqAuthor(false)
        setRestricted(false)
        currentUserInfo.current = undefined
        navigate('/')
    }

    const flushQueue = (newToken: string) => {
        failedQueue.current.forEach(({ resolve }) => resolve(newToken))
        failedQueue.current = []
    }

    const rejectQueue = (err: unknown) => {
        failedQueue.current.forEach(({ reject }) => reject(err))
        failedQueue.current = []
    }

    useEffect(() => {
        // Request interceptor: attach Bearer token
        const reqId = api.interceptors.request.use((cfg) => {
            const currentToken = readStoredToken()
            if (currentToken) {
                cfg.headers.Authorization = `Bearer ${currentToken}`
            }
            return cfg
        })

        // Request interceptor: attach CSRF token
        const csrfId = api.interceptors.request.use((cfg) => {
            const csrf = Cookies.get('XSRF-TOKEN')
            if (csrf) cfg.headers['X-XSRF-TOKEN'] = csrf
            return cfg
        })

        // Response interceptor: on 401, attempt single-flight refresh then retry
        const resId = api.interceptors.response.use(
            (res) => res,
            async (err) => {
                const status = err?.response?.status
                const url: string = err?.config?.url ?? ''

                // Never retry login or refresh failures
                if (url.includes('/users/login') || url.includes('/users/refresh')) {
                    if (status === 401 && !url.includes('/users/login')) {
                        forceLogout()
                    }
                    return Promise.reject(err)
                }

                if (status === 403 && url.includes('/users/getInfo')) {
                    forceLogout()
                    return Promise.reject(err)
                }

                if (status !== 401) {
                    return Promise.reject(err)
                }

                // Already retried once -- give up
                if (err.config._retry) {
                    forceLogout()
                    return Promise.reject(err)
                }

                // If a refresh is already in flight, queue this request
                if (isRefreshing.current) {
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.current.push({ resolve, reject })
                    }).then((newToken) => {
                        err.config.headers.Authorization = `Bearer ${newToken}`
                        err.config._retry = true
                        return api(err.config)
                    })
                }

                // Start a refresh
                isRefreshing.current = true
                try {
                    const refreshRes = await refreshClient.post('/users/refresh')
                    const newToken: string = refreshRes.data.token
                    setToken(newToken)
                    flushQueue(newToken)
                    err.config.headers.Authorization = `Bearer ${newToken}`
                    err.config._retry = true
                    return api(err.config)
                } catch (refreshErr) {
                    rejectQueue(refreshErr)
                    forceLogout()
                    return Promise.reject(refreshErr)
                } finally {
                    isRefreshing.current = false
                }
            }
        )

        return () => {
            api.interceptors.request.eject(reqId)
            api.interceptors.request.eject(csrfId)
            api.interceptors.response.eject(resId)
        }
    }, [api, refreshClient]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (token) {
            api.get('/users/getInfo').then(res => {
                if (res.status === 200) {
                    currentUserInfo.current = res.data
                    setRestricted(res.data.restricted ?? false)
                    setBanned(res.data.banned ?? false)
                    api.get('/users/privileges').then(pri => {
                        const priv: PrivilegeModel = pri.data
                        setAdmin(priv.admin)
                        setAgent(priv.agent)
                        setFaqAuthor(priv.faqAuthor)
                    })
                }
                })
        }
    }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

    const isLoggedIn = () => !!token

    const logout = () => {
        api.post('/users/logout', {}, { withCredentials: true })
            .then(forceLogout)
            .catch(forceLogout)
    }

    const logoutAll = () => {
        api.post('/users/logout-all', {}, { withCredentials: true })
            .then(forceLogout)
            .catch(forceLogout)
    }

    const setUserInfo = (user: UserModel) => {
        currentUserInfo.current = user
    }

    const getUserInfo = (): UserModel | undefined => {
        return currentUserInfo.current
    }

    const contextValue = useMemo(() => ({
        token,
        isAuthenticated: !!token,
        setToken,
        api,
        isLoggedIn,
        logout,
        logoutAll,
        setUserInfo,
        getUserInfo,
        faqAuthor,
        agent,
        admin,
        restricted,
        banned
    }), [token, faqAuthor, agent, admin, restricted, banned]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside auth provider')
    return ctx
}
