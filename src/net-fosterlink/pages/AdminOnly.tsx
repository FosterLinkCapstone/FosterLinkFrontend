import { type ReactNode } from "react";
import { useAuth } from "../backend/AuthContext";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";

export const AdminOnly = ({ children }: {children: ReactNode}) => {
    const auth = useAuth()

    return auth.admin == null ? (auth.isLoggedIn() ? <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div> : <Navigate to="/login" replace/>) : (auth.admin ? children : <Navigate to="/login" replace />)

}