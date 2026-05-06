import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
      <Navbar />
      <PageTransition>
        <section className="relative pt-28 pb-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-medical-blue mb-4">
                About This Website
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Your secure medical record assistant.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                This platform helps patients and lab professionals manage medical records, track health analytics, and securely share results in one central place.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-10 lg:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-medical-lightBlue text-medical-blue mb-6">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">What it does</h2>
                <p className="text-gray-600 leading-relaxed">
                  Upload medical reports, store patient data, and automatically analyze health scores. The site lets you view, download, and securely share records with authorized users.
                </p>
              </div>

              <div className="rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-medical-lightBlue text-medical-blue mb-6">
                  <Shield size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Why it exists</h2>
                <p className="text-gray-600 leading-relaxed">
                  Healthcare records are sensitive. This website simplifies management while preserving privacy, reducing repeated analysis work, and making record access faster for patients and labs.
                </p>
              </div>

              <div className="rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-medical-lightBlue text-medical-blue mb-6">
                  <UserPlus size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Who should use it</h2>
                <p className="text-gray-600 leading-relaxed">
                  Patients looking for a secure record hub and pathology labs that need to share reports and results with ease will both find value in this system.
                </p>
              </div>
            </div>

            <div className="mt-20 grid gap-10 lg:grid-cols-2">
              <div className="rounded-3xl bg-medical-lightBlue/50 p-10 border border-medical-lightBlue">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Manual</h2>
                <ul className="space-y-4 text-gray-600">
                  <li>
                    <strong className="font-semibold">1. Register or login:</strong> Patients and labs sign in with separate credentials.
                  </li>
                  <li>
                    <strong className="font-semibold">2. Upload a report:</strong> Labs upload patient files through the upload page.
                  </li>
                  <li>
                    <strong className="font-semibold">3. Review records:</strong> Patients can view and download their history from the Records page.
                  </li>
                  <li>
                    <strong className="font-semibold">4. Track health scores:</strong> The dashboard shows score trends across all uploaded reports.
                  </li>
                  <li>
                    <strong className="font-semibold">5. Share securely:</strong> Use the built-in share function to send reports safely.
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 p-10 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key advantages</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong className="font-semibold">Centralized health data:</strong> All records are available in one secure location, removing clutter and lost paperwork.
                  </p>
                  <p>
                    <strong className="font-semibold">Faster analysis:</strong> Cached predictions reduce duplicate computation and speed up result retrieval.
                  </p>
                  <p>
                    <strong className="font-semibold">Secure sharing:</strong> Share reports only with authorized viewers, while audit and access are controlled.
                  </p>
                  <p>
                    <strong className="font-semibold">Patient empowerment:</strong> Patients can monitor health score changes over time and keep better control of their care.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-20 rounded-3xl border border-gray-200 p-10 bg-white shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Important Notes</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  The website is designed to support medical record management, but it is not a substitute for professional medical advice. Always consult your doctor for clinical decisions.
                </p>
                <p>
                  If a file is deleted, its associated score entry is removed to keep patient history consistent.
                </p>
                <p>
                  Keep your login credentials private and do not share account access. The system stores sensitive health information and must be treated with care.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link to="/">
                <Button className="bg-medical-blue hover:bg-blue-700 text-white inline-flex items-center">
                  Back to Home
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </PageTransition>
    </>
  );
};

export default About;
