import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const role = localStorage.getItem('userRole');
      setIsLoggedIn(loggedIn);
      setUserRole(role);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setUserRole(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Dynamic navigation items based on authentication state and role
  const navItems = [
    { name: 'Home', path: '/' },
    ...(isLoggedIn ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    ...(isLoggedIn ? [{ name: 'Medical Records', path: '/records' }] : []),
    { name: 'About', path: '/about' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/80 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-blue-600">MediVault</span>
              </motion.div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-medical-blue relative py-2',
                  location.pathname === item.path
                    ? 'text-medical-blue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-medical-blue'
                    : 'text-gray-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <>
                {/* Added direct logout button for the header */}
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      {userRole === 'pathlab' ? 
                        <Building2 size={18} /> : 
                        <User size={18} />
                      }
                      <span>{userRole === 'pathlab' ? 'Lab Account' : 'Profile'}</span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 premium-card">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem className="text-sm">
                      Signed in as {userRole === 'pathlab' ? 'Lab' : 'Patient'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-500 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="hover:bg-gray-100">
                  <Link to="/user-login">Patient Login</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-medical-blue hover:bg-blue-700 text-white">
                      Lab Portal
                      <ChevronDown size={16} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link to="/pathlab-login">Lab Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/pathlab-signup">Register Lab</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('md:hidden', isOpen ? 'block' : 'hidden')}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm shadow-md">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium',
                location.pathname === item.path
                  ? 'text-medical-blue bg-blue-50'
                  : 'text-gray-600 hover:text-medical-blue hover:bg-gray-50'
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <>
                {/* Added direct logout button to mobile menu */}
                <button
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-medical-blue hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Profile Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/user-login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-medical-blue hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Patient Login
                </Link>
                <Link
                  to="/pathlab-login"
                  className="mt-1 block px-3 py-2 rounded-md text-base font-medium text-white bg-medical-blue hover:bg-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  Lab Login
                </Link>
                <Link
                  to="/pathlab-signup"
                  className="mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-medical-blue hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Register Laboratory
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;