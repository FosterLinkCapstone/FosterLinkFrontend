import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { UserModel } from './models/UserModel'
import type { PrivilegeModel } from './models/PrivilegeModel'
import Cookies from 'js-cookie'

export interface AuthContextType {
    token: string | null,
    setToken: (token: string | null, options?: { stayLoggedIn?: boolean }) => void,
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

// Storage helpers -- access token only (refresh token is in HttpOnly cookie, never JS-readable)
const STORAGE_KEY = 'jwt'
const PERSISTENT_FLAG = 'auth_persistent'

function readStoredToken(): string | null {
    if (localStorage.getItem(PERSISTENT_FLAG)) {
        return localStorage.getItem(STORAGE_KEY)
    }
    return sessionStorage.getItem(STORAGE_KEY)
}

function writeToken(token: string, stayLoggedIn: boolean) {
    if (stayLoggedIn) {
        localStorage.setItem(STORAGE_KEY, token)
        localStorage.setItem(PERSISTENT_FLAG, '1')
        sessionStorage.removeItem(STORAGE_KEY)
    } else {
        sessionStorage.setItem(STORAGE_KEY, token)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(PERSISTENT_FLAG)
    }
}

function clearToken() {
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PERSISTENT_FLAG)
}

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

    // Main API client -- attach any stored Bearer token immediately to avoid
    // first-request races before interceptors are mounted.
    const api = useMemo(() => {
        const client = axios.create({ baseURL: apiUrl })
        const initialToken = readStoredToken()
        if (initialToken) {
            client.defaults.headers.common.Authorization = `Bearer ${initialToken}`
        }
        return client
    }, [apiUrl])

    // Dedicated refresh client -- no auth interceptor, no 401 retry, no CSRF header
    // withCredentials ensures the HttpOnly refresh_token cookie is sent
    const refreshClient = useMemo(() => axios.create({ baseURL: apiUrl, withCredentials: true }), [apiUrl])

    // Keep a ref so interceptors can always read the latest token without stale closures
    const tokenRef = useRef<string | null>(token)
    useEffect(() => { tokenRef.current = token }, [token])

    const setToken = (newToken: string | null, options?: { stayLoggedIn?: boolean }) => {
        if (newToken) {
            const stayLoggedIn = options?.stayLoggedIn ?? !!localStorage.getItem(PERSISTENT_FLAG)
            writeToken(newToken, stayLoggedIn)
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        } else {
            clearToken()
            delete api.defaults.headers.common.Authorization
        }
        setTokenState(newToken)
        tokenRef.current = newToken
    }

    const forceLogout = () => {
        setToken(null)
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
            if (tokenRef.current) {
                cfg.headers.Authorization = `Bearer ${tokenRef.current}`
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
    }, [api, refreshClient])

    useEffect(() => {
        if (token != null) {
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
    }, [token])

    const isLoggedIn = () => {
        return readStoredToken() != null
    }

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
