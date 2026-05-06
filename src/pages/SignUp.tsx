import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/CustomCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, EyeIcon, EyeOffIcon, Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    if (!firstName || !lastName || !email || !password || !termsAccepted) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      // Register patient using API
      const response = await axios.post(`${API_URL}/auth/patient/register`, {
        firstName,
        lastName,
        email,
        password
      });
      
      toast.success('Account created successfully');
      navigate('/user-login');
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || 'Failed to create account');
      } else {
        toast.error('An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Create an Account</h1>
              <p className="mt-2 text-gray-600">
                Join MediVault to securely manage your medical records
              </p>
            </div>

            <Card className="backdrop-blur-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        required
                        className="pl-10"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="email"
                      placeholder="your@email.com"
                      type="email"
                      autoComplete="email"
                      required
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Password Requirements:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center">
                        <span className={hasMinLength ? 'text-green-500' : 'text-gray-400'}>
                          {hasMinLength ? <CheckCircle size={14} className="mr-1.5 inline" /> : '•'}
                        </span>
                        <span className={hasMinLength ? 'text-green-700' : 'text-gray-500'}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className={hasUpperCase ? 'text-green-500' : 'text-gray-400'}>
                          {hasUpperCase ? <CheckCircle size={14} className="mr-1.5 inline" /> : '•'}
                        </span>
                        <span className={hasUpperCase ? 'text-green-700' : 'text-gray-500'}>
                          At least one uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className={hasLowerCase ? 'text-green-500' : 'text-gray-400'}>
                          {hasLowerCase ? <CheckCircle size={14} className="mr-1.5 inline" /> : '•'}
                        </span>
                        <span className={hasLowerCase ? 'text-green-700' : 'text-gray-500'}>
                          At least one lowercase letter
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className={hasNumber ? 'text-green-500' : 'text-gray-400'}>
                          {hasNumber ? <CheckCircle size={14} className="mr-1.5 inline" /> : '•'}
                        </span>
                        <span className={hasNumber ? 'text-green-700' : 'text-gray-500'}>
                          At least one number
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className={hasSpecialChar ? 'text-green-500' : 'text-gray-400'}>
                          {hasSpecialChar ? <CheckCircle size={14} className="mr-1.5 inline" /> : '•'}
                        </span>
                        <span className={hasSpecialChar ? 'text-green-700' : 'text-gray-500'}>
                          At least one special character
                        </span>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-medical-blue hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-medical-blue hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-medical-blue hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative px-4 text-sm bg-white">
                    <span className="text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button" className="w-full">
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    Apple
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/user-login" className="text-medical-blue hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default SignUp;