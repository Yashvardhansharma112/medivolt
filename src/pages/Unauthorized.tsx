
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import PageTransition from '@/components/animations/PageTransition';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Unauthorized = () => {
  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="inline-flex justify-center items-center p-4 bg-red-100 rounded-full mb-6">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              You don't have permission to access this page. Please contact support if you think this is an error.
            </p>
            <div className="space-y-4">
              <Button asChild className="bg-medical-blue hover:bg-blue-700">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userRole');
                    window.location.href = '/user-login';
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default Unauthorized;
