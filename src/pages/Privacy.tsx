import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/CustomCard';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Introduction and Scope',
      content: `MediVault ("we," "us," "our," or "Company") is committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services.

Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service. Your use of MediVault signifies your acceptance of this Privacy Policy.`
    },
    {
      title: '2. Information We Collect',
      content: `We collect information in various ways, including:

A. Information You Provide Directly:
- Account registration information (name, email, phone, password)
- Medical records and health information you upload
- Profile information and preferences
- Communication with our support team
- Payment and billing information (for premium services)

B. Information Collected Automatically:
- Device information (device type, operating system, browser type)
- Usage data (pages visited, features used, time spent)
- IP address and location data
- Cookies and similar tracking technologies

C. Information from Third Parties:
- Laboratory partners may provide medical records on your behalf (with consent)
- Healthcare providers may share information with authorization
- Payment processors for transaction processing`
    },
    {
      title: '3. How We Use Your Information',
      content: `We use the information we collect for the following purposes:

1. Service Provision:
   - To create and maintain your account
   - To securely store and manage your medical records
   - To enable sharing of records with authorized healthcare providers
   - To provide customer support and technical assistance

2. Communication:
   - To send service notifications and updates
   - To respond to your inquiries and requests
   - To provide educational information about health management
   - To send administrative information and policy updates

3. Analytical and Improvement:
   - To analyze usage patterns and improve our Service
   - To troubleshoot technical issues
   - To develop new features and functionality
   - To understand user needs and preferences

4. Security and Legal:
   - To detect, prevent, and address fraud and security issues
   - To comply with legal obligations and regulations
   - To enforce our Terms of Service
   - To protect the rights, privacy, and safety of our users

5. With Your Consent:
   - For research purposes (with explicit opt-in consent)
   - For marketing communications (which you can opt-out from)
   - For any other purpose you authorize`
    },
    {
      title: '4. HIPAA Compliance',
      content: `As a healthcare information management platform, MediVault complies with the Health Insurance Portability and Accountability Act (HIPAA):

- We implement administrative, physical, and technical safeguards to protect Protected Health Information (PHI)
- Access to medical records is restricted to authorized individuals
- We maintain comprehensive audit logs of all access to medical records
- We have Business Associate Agreements (BAAs) with healthcare providers and labs
- We provide breach notification in accordance with HIPAA requirements
- Your medical records are not sold or used for marketing without explicit consent
- You have the right to access, amend, and receive an accounting of disclosures of your PHI

For laboratories and healthcare providers, MediVault acts as a Business Associate under HIPAA regulations.`
    },
    {
      title: '5. GDPR Compliance',
      content: `For users in the European Union and those subject to GDPR, we comply with all applicable requirements:

Your Rights Under GDPR:
- Right to Access: Request a copy of your personal data
- Right to Rectification: Correct inaccurate personal data
- Right to Erasure: Request deletion of your data
- Right to Restrict Processing: Limit how we use your data
- Right to Portability: Receive your data in a portable format
- Right to Object: Object to specific processing activities

Data Processing:
- We process personal data only with your consent or legal basis
- We implement data minimization principles
- We conduct Data Protection Impact Assessments for high-risk processing
- We employ Data Protection by Design and Default
- We have appointed a Data Protection Officer (DPO) for oversight

To exercise any GDPR rights, please contact our DPO at privacy@medivault.com`
    },
    {
      title: '6. Data Storage and Security',
      content: `Data Protection Measures:

1. Encryption:
   - All data transmitted over the internet uses SSL/TLS encryption
   - Medical records are encrypted at rest using AES-256 encryption
   - End-to-end encryption available for sensitive information

2. Access Controls:
   - Role-based access control (RBAC) limits data access
   - Multi-factor authentication required for all accounts
   - Regular access reviews and revocation of unnecessary permissions
   - Session timeouts and automatic logout for security

3. Infrastructure Security:
   - Data stored in secure, certified data centers
   - Regular security audits and penetration testing
   - Firewalls and intrusion detection systems
   - DDoS protection and network monitoring

4. Data Retention:
   - Medical records retained according to legal and regulatory requirements
   - Deleted data securely wiped using industry-standard methods
   - Regular data backups stored securely and separately
   - Retention schedules reviewed and updated annually

5. Incident Response:
   - 24/7 monitoring for security incidents
   - Documented incident response procedures
   - Timely notification of data breaches as required by law
   - Regular security training for all staff members`
    },
    {
      title: '7. Information Sharing and Disclosure',
      content: `We share your information in the following circumstances:

With Your Consent:
- Healthcare providers you authorize
- Laboratories for analysis and reporting
- Family members or caregivers as you designate
- Any other third parties you specifically authorize

Legal Requirements:
- When required by law, court order, or government request
- To comply with public health and safety requirements
- To report suspected abuse or illegal activity
- To enforce our Terms of Service

Service Providers:
- Hosting providers (subject to strict data processing agreements)
- Payment processors and financial institutions
- Customer support platforms
- Analytics providers

We never:
- Sell your personal data or medical records
- Share data for marketing purposes without consent
- Disclose data to unrelated third parties
- Use your data for targeted advertising of medical products

Business Transfers:
In case of merger, acquisition, or bankruptcy, your data may be transferred as part of that transaction, with notification and opt-out options provided where possible.`
    },
    {
      title: '8. Cookies and Tracking Technologies',
      content: `We use the following technologies on our platform:

Cookies:
- Session cookies for authentication and security
- Persistent cookies for user preferences and remembered login
- Analytics cookies to understand usage patterns
- You can control cookies through your browser settings

Other Tracking Technologies:
- Pixels and web beacons for analytics
- Local storage for application preferences
- Device identifiers for analytics

Your Choices:
- You can disable cookies in your browser settings
- Most browsers can be set to notify you before accepting cookies
- You can clear cookies at any time
- Disabling cookies may limit certain Service features
- We provide opt-out options for analytics tracking`
    },
    {
      title: '9. Third-Party Links',
      content: `Our Service may contain links to third-party websites and services that are not operated by MediVault. This Privacy Policy does not apply to third-party services, and we are not responsible for their privacy practices.

We recommend:
- Reviewing the privacy policies of any third-party services
- Being cautious when providing information on third-party sites
- Understanding the data practices of healthcare providers and labs you connect with

We do not endorse or guarantee third-party services and are not responsible for their content or security.`
    },
    {
      title: '10. Children\'s Privacy',
      content: `MediVault is not intended for children under the age of 18 (or the age of majority in your jurisdiction). We do not knowingly collect information from children.

For Minors:
- Parents/guardians can manage medical records for minors
- Appropriate parental consent mechanisms are in place
- We follow all applicable laws regarding minors' medical information
- Special protections are applied to children's health records

If we learn that a child has provided information directly, we will delete such information promptly.`
    },
    {
      title: '11. Your Privacy Rights and Choices',
      content: `You have control over your information:

Account Settings:
- Update your profile and contact information
- Manage privacy settings for record sharing
- Change your password and security settings
- View your login history and active sessions

Data Access and Portability:
- Request a complete copy of your medical records
- Export data in standard formats (PDF, HL7, etc.)
- Download your account information at any time

Opt-Out Options:
- Unsubscribe from marketing communications
- Disable analytics and tracking (where applicable)
- Revoke access for third-party applications
- Delete your account and associated data

To exercise any of these rights, contact privacy@medivault.com with your request details.`
    },
    {
      title: '12. Data Retention',
      content: `We retain your information as follows:

Medical Records:
- Retained for the duration of your active account
- For 3-6 years after account closure (as required by law)
- Permanently deleted upon your request (where legally permitted)

Backup Data:
- Maintained for 30-90 days for disaster recovery
- Securely deleted after retention period

Log and Analytics Data:
- Retained for 12 months for security and troubleshooting
- Aggregated, anonymized data may be retained indefinitely

Compliance:
- Retention periods may be extended for legal holds
- Different retention periods apply to different data types
- You can request data deletion subject to legal requirements`
    },
    {
      title: '13. International Data Transfers',
      content: `If you are located outside the United States:

Data Transfers:
- Your data may be transferred to, stored, and processed in the United States or other countries
- We implement appropriate safeguards for international transfers
- For EU users, we use Standard Contractual Clauses and other approved mechanisms
- We ensure transfers comply with applicable privacy laws

Your Rights:
- You have the right to object to international transfers
- We provide information about transfer mechanisms upon request
- EU users have rights under GDPR for transfers`
    },
    {
      title: '14. Policy Updates',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, regulations, and other factors.

Notification:
- We will notify you of material changes via email
- We will post the updated policy with the "Last Updated" date
- Your continued use after updates constitutes acceptance

Your Responsibility:
- Review this policy periodically for updates
- Understand the current privacy practices
- Contact us if you have questions about changes

Significant changes will be communicated at least 30 days in advance of implementation.`
    },
    {
      title: '15. Contact Us',
      content: `For any questions, concerns, or requests regarding this Privacy Policy:

MediVault Privacy Team
Email: privacy@medivault.com
Support Email: support@medivault.com
Office: MediVault Headquarters
Response Time: Within 48 business hours

Data Protection Officer (GDPR):
Email: dpo@medivault.com

Legal Notices:
For legal correspondence, send written notice to our registered office.

We are committed to addressing any privacy concerns promptly and thoroughly.`
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
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
              <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Introduction */}
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                MediVault takes your privacy seriously. This Privacy Policy explains our data handling practices and your rights regarding your personal information and medical records. We comply with HIPAA, GDPR, and other applicable privacy regulations. Please read this policy carefully to understand our privacy practices.
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
                We are committed to safeguarding your medical information and personal privacy. If you have any concerns about how your data is handled, please contact our Privacy Team immediately at privacy@medivault.com.
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

export default Privacy;