import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/CustomCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, EyeIcon, EyeOffIcon, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, role } = location.state || {};

  // Password strength indicators
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, otp, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully! Please login with your new password.');
        navigate('/user-login');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !role) {
    return (
      <>
        <Navbar />
        <div className="page-container min-h-screen pt-24 pb-16 flex items-center justify-center">
          <Card className="p-8 text-center">
            <p className="text-gray-600">Invalid access. Please go back to forgot password.</p>
            <Link to="/forgot-password" className="text-medical-blue hover:underline mt-4 inline-block">
              Go to Forgot Password
            </Link>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="page-container min-h-screen pt-24 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-medical-lightBlue text-medical-blue mb-4">
                  <Lock size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-600 mt-2">
                  Enter the OTP sent to {email} and your new password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {newPassword.length > 0 && (
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

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-medical-blue hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center text-sm text-medical-blue hover:underline"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Forgot Password
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default ResetPassword;