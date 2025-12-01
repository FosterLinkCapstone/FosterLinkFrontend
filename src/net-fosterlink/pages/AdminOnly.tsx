import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";

export const AdminOnly = ({ children }: {children: ReactNode}) => {
    const auth = useAuth()
    const userApiRef = userApi(auth)
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

    useEffect(() => {
        userApiRef.isAdmin().then(res => {
            setIsAdmin(res)
        })
    }, [])

    return isAdmin == null ? <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div> : (isAdmin ? children : <Navigate to="/login" replace />)

}