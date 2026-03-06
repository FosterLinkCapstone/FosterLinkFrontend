import { useNavigate } from "react-router";
import { useAuth } from "../backend/AuthContext";

export const RestrictGateway = ({children}: {children: React.ReactNode}) => {
    const auth = useAuth();
    const naviagate = useNavigate();

    if (auth.banned && window.location.pathname !== "/banned") {
        naviagate("/banned", { replace: true })
    } else {
        return children
    }
}