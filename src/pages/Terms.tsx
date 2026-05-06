import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/CustomCard';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using MediVault ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. This Terms of Service applies to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.`
    },
    {
      title: '2. Use License',
      content: `Permission is granted to temporarily download one copy of the materials (information or software) on MediVault for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

- Modifying or copying the materials
- Using the materials for any commercial purpose or for any public display
- Attempting to decompile or reverse engineer any software contained on MediVault
- Removing any copyright or other proprietary notations from the materials
- Transferring the materials to another person or "mirroring" the materials on any other server
- Accessing the materials for any reason if you are not authorized by MediVault
- Circumventing, disabling, or otherwise interfering with security-related features of the Service`
    },
    {
      title: '3. Medical Records Management',
      content: `MediVault is designed for secure management and storage of medical records. Users acknowledge that:

- All medical records uploaded must be your own records or records for which you have legal authority to manage
- The Service is not a substitute for professional medical advice or treatment
- You retain all rights to your medical records
- You are responsible for maintaining accurate and current information
- MediVault does not provide medical diagnosis or treatment recommendations`
    },
    {
      title: '4. User Responsibilities',
      content: `You agree to:

- Provide accurate and complete registration information
- Maintain the confidentiality of your username and password
- Be responsible for all activities that occur under your account
- Immediately notify MediVault of any unauthorized use of your account
- Not engage in activities that violate applicable laws and regulations
- Not transmit viruses, malware, or any code of destructive nature
- Not engage in harassment, abuse, or any behavior that violates others' rights
- Comply with all applicable laws regarding medical records management`
    },
    {
      title: '5. Data Security and Privacy',
      content: `MediVault implements industry-standard security measures to protect your medical records, including:

- End-to-end encryption of data in transit and at rest
- Secure authentication mechanisms
- Regular security audits and updates
- Compliance with HIPAA and GDPR requirements
- Limited access controls and role-based permissions

However, no system is completely secure. MediVault cannot guarantee absolute security and is not responsible for unauthorized access due to factors beyond reasonable control.`
    },
    {
      title: '6. Laboratory Partners',
      content: `For Laboratory users:

- You agree to use the Service in compliance with all applicable medical regulations
- You are responsible for obtaining appropriate informed consent from patients
- You maintain liability for the accuracy and completeness of medical reports
- You comply with all applicable medical licensing and certification requirements
- You will not disclose patient information except as authorized by law or patient consent`
    },
    {
      title: '7. Disclaimer of Warranties',
      content: `The materials on MediVault are provided on an "as-is" basis. MediVault makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

Further, MediVault does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.`
    },
    {
      title: '8. Limitations of Liability',
      content: `In no event shall MediVault or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MediVault, even if MediVault or an authorized representative has been notified orally or in writing of the possibility of such damage.`
    },
    {
      title: '9. Accuracy of Materials',
      content: `The materials appearing on MediVault could include technical, typographical, or photographic errors. MediVault does not warrant that any of the materials on its Service are accurate, complete, or current. MediVault may make changes to the materials contained on its Service at any time without notice.`
    },
    {
      title: '10. Links',
      content: `MediVault has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by MediVault of the site. Use of any such linked website is at the user's own risk.`
    },
    {
      title: '11. Modifications',
      content: `MediVault may revise these terms of service for its Service at any time without notice. You are responsible for reviewing these terms periodically for updates. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.`
    },
    {
      title: '12. Governing Law',
      content: `These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which MediVault operates, and you irrevocably submit to the exclusive jurisdiction of the courts that are located in that state or location.`
    },
    {
      title: '13. Termination of Service',
      content: `MediVault reserves the right to terminate or suspend your account and access to the Service at any time, for any reason, including:

- Violation of these Terms of Service
- Illegal activities or fraud
- Violation of medical regulations or HIPAA requirements
- Non-payment of services

Upon termination, you will be given reasonable notice and an opportunity to download your records, except in cases of gross abuse or illegal activity.`
    },
    {
      title: '14. User Content and Licensing',
      content: `You retain all rights to any content you submit, post, or display on MediVault. By submitting content to MediVault, you grant MediVault a world-wide, non-exclusive license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any media for the purpose of providing the Service and improving its features.`
    },
    {
      title: '15. Contact Information',
      content: `For any questions about these Terms of Service, please contact our support team at:

MediVault Support
Email: support@medivault.com
Response time: Within 48 business hours

For legal notices, please send written correspondence to our registered office.`
    }
  ];

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="page-container min-h-screen pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
              <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Introduction */}
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                Welcome to MediVault, a secure medical records management platform. These Terms of Service ("Terms") govern your use of our website, application, and services. Please read these terms carefully before using our Service. Your use of MediVault constitutes your agreement to be bound by these Terms.
              </p>
            </Card>

            {/* Content Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Footer Notice */}
            <Card className="p-6 mt-12 bg-gray-50 border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                By using MediVault, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the Service.
              </p>
            </Card>

            {/* Action Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-medical-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default Terms;