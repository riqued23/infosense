import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go to Home
        </button>
      </div>
    </div>
  );
}
