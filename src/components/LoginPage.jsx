import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Brain, Quote } from 'lucide-react';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-800 to-dark-900 flex-col justify-center px-12">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <Brain className="h-10 w-10 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">MindBinder</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">Inspiration that sticks.</p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Quote className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
              <p className="text-gray-400 italic">"The way to get started is to quit talking and begin doing." - Walt Disney</p>
            </div>
            <div className="flex items-start space-x-3">
              <Quote className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
              <p className="text-gray-400 italic">"In all thy ways acknowledge Him, and He shall direct thy paths." - Proverbs 3:6</p>
            </div>
            <div className="flex items-start space-x-3">
              <Quote className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
              <p className="text-gray-400 italic">"Well done is better than well said." - Benjamin Franklin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-blue-400 mr-2" />
              <h1 className="text-2xl font-bold text-white">MindBinder</h1>
            </div>
            <p className="text-gray-400">Inspiration that sticks.</p>
          </div>

          <div className="bg-dark-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;