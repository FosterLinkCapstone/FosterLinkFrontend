import { Navbar } from '../components/Navbar';
import { useAuth } from '../backend/AuthContext';

export const Banned = () => {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <title>FosterLink - Account Banned</title>
      <Navbar userInfo={auth.getUserInfo()} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-9xl font-bold text-destructive mb-4">Banned</h1>
          <h2 className="text-4xl font-bold text-foreground mb-4">Account Suspended</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your account has been banned. You no longer have access to FosterLink. If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};
