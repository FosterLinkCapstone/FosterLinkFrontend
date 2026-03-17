import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../backend/AuthContext";

export const RestrictGateway = ({children}: {children: React.ReactNode}) => {
    const auth = useAuth();
    const naviagate = useNavigate();
    const location = useLocation();

    if (auth.banned && location.pathname !== "/banned") {
        naviagate("/banned", { replace: true })
        return null;
    } else {
        return children
    }
}