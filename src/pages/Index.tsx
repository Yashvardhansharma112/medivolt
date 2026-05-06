
import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
// import { AnimatedCard } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Heart, Lock, LogOut, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication state
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(loggedIn);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <PageTransition>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-medical-lightBlue/30 to-white z-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block px-3 py-1 mb-6 text-xs font-medium text-medical-blue bg-medical-lightBlue rounded-full">
                  Secure Medical Record Management
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
                  Your Medical Records,{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-blue-600">
                    All in One Place
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-lg">
                  Securely store, access, and manage all your medical records in a centralized platform designed for privacy and convenience.
                </p>
                <div className="flex flex-wrap gap-4">
                  {isLoggedIn ? (
                    <>
                      <Button asChild size="lg" className="bg-medical-blue hover:bg-blue-700 text-white">
                        <Link to="/dashboard">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={handleLogout}
                        className="flex items-center"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild size="lg" className="bg-medical-blue hover:bg-blue-700 text-white">
                        <Link to="/user-login">
                          Patient Login
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link to="/pathlab-login">Lab Login</Link>
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-medical-blue/5 to-transparent rounded-2xl transform rotate-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                  alt="Medical Records Dashboard"
                  className="relative z-10 rounded-2xl shadow-xl w-full object-cover transform -rotate-3 transition-all hover:rotate-0 duration-300"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Why Choose <span className="text-medical-blue">MediVault</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our platform provides a comprehensive solution for managing your health records securely and efficiently.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-medical-blue to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                {isLoggedIn 
                  ? "Thank you for using MediVault!" 
                  : "Ready to take control of your medical records?"}
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {isLoggedIn 
                  ? "Your medical information is securely stored and accessible whenever you need it." 
                  : "Join thousands of users who trust MediVault with their medical information."}
              </p>
              {isLoggedIn ? (
                <Button asChild size="lg" variant="secondary" className="font-medium">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="secondary" className="font-medium">
                  <Link to="/user-login">Get Started Now</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        <Footer />
      </PageTransition>
    </>
  );
};

export default Index;
