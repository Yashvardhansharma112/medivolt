import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/CustomCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, EyeIcon, EyeOffIcon, Lock, Mail, MapPin, Phone } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

const PathLabSignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [labName, setLabName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [description, setDescription] = useState('');
  
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
    if (!labName || !email || !password || !phone || !address || !licenseNumber) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      // Register lab using API
      const response = await axios.post(`${API_URL}/auth/lab/register`, {
        labName,
        email,
        password,
        phone,
        address,
        licenseNumber,
        description
      });
      
      toast.success('Laboratory registered successfully');
      navigate('/pathlab-login');
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || 'Failed to register laboratory');
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
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Register Your Laboratory</h1>
              <p className="mt-2 text-gray-600">
                Join MediVault to securely manage and upload patient test reports
              </p>
            </div>

            <Card className="backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="labName" className="font-medium">Laboratory Name*</Label>
                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="labName"
                        placeholder="Enter lab name"
                        required
                        className="pl-10"
                        value={labName}
                        onChange={(e) => setLabName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="font-medium">Email*</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="email"
                          placeholder="lab@example.com"
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
                      <Label htmlFor="phone" className="font-medium">Phone Number*</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="phone"
                          placeholder="+1 (555) 000-0000"
                          type="tel"
                          required
                          className="pl-10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="font-medium">Laboratory Address*</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <Textarea
                        id="address"
                        placeholder="Complete address"
                        required
                        className="pl-10 min-h-[80px]"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licenseNumber" className="font-medium">License/Registration Number*</Label>
                    <div className="relative mt-1">
                      <Input
                        id="licenseNumber"
                        placeholder="Enter your laboratory license number"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="font-medium">Laboratory Description</Label>
                    <div className="relative mt-1">
                      <Textarea
                        id="description"
                        placeholder="Briefly describe your laboratory services"
                        className="min-h-[100px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="font-medium">Password*</Label>
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
                    <div className="text-sm border rounded p-3 bg-gray-50">
                      <p className="font-medium mb-2">Password Requirements:</p>
                      <ul className="space-y-1">
                        <li className={`flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasMinLength ? '✓' : '○'} At least 8 characters
                        </li>
                        <li className={`flex items-center ${hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasUpperCase ? '✓' : '○'} At least one uppercase letter
                        </li>
                        <li className={`flex items-center ${hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasLowerCase ? '✓' : '○'} At least one lowercase letter
                        </li>
                        <li className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasNumber ? '✓' : '○'} At least one number
                        </li>
                        <li className={`flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasSpecialChar ? '✓' : '○'} At least one special character
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
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
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register Laboratory'}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have a lab account?{' '}
                    <Link to="/pathlab-login" className="text-medical-blue hover:underline font-medium">
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

export default PathLabSignUp;