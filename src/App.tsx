import { Route, Routes } from 'react-router-dom';
import AuthGuard from './components/auth/AuthGuard';
import { Toaster } from './components/ui/toaster';
import { RecordsProvider } from './contexts/RecordsContext';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import PathLabLogin from './pages/PathLabLogin';
import PathLabSignUp from './pages/PathLabSignUp';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Records from './pages/Records';
import RecordUpload from './pages/RecordUpload';
import ResetPassword from './pages/ResetPassword';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Terms from './pages/Terms';
import UserLogin from './pages/UserLogin';

function App() {
  return (
    <div className="App">
      <RecordsProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/pathlab-login" element={<PathLabLogin />} />
          <Route path="/pathlab-signup" element={<PathLabSignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/records/upload" element={<RecordUpload />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          <Route path="/records" element={
            <AuthGuard>
              <Records />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </RecordsProvider>
    </div>
  );
}

export default App;