
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-blue-600">MediVault</span>
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-md">
              A secure, centralized platform for managing your medical records, 
              making healthcare information accessible when you need it most.
            </p>
            <div className="mt-4 flex space-x-4">
              <a className="text-gray-400 hover:text-medical-blue transition-colors">
                <Github size={20} />
              </a>
              <a className="text-gray-400 hover:text-medical-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a className="text-gray-400 hover:text-medical-blue transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-medical-blue">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/records" className="text-sm text-gray-600 hover:text-medical-blue">
                  Medical Records
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-medical-blue">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-medical-blue">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-medical-blue">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-medical-blue">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} MediVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
