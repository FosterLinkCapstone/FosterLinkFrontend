import { Navbar } from "./navbar/Navbar";
import { useAuth } from "../backend/AuthContext";

export const PageLayout: React.FC<{ auth: ReturnType<typeof useAuth>; children: React.ReactNode }> = ({ auth, children }) => (
  <div className="min-h-screen bg-background">
    <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
      <Navbar userInfo={auth.getUserInfo()} />
    </div>
    {children}
  </div>
);
