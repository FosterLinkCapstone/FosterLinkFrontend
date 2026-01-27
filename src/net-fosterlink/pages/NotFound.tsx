import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../backend/AuthContext';

export const NotFound = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar userInfo={auth.getUserInfo()} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

