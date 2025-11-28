import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import './LandingPage.css'; // Reuse styles

const LegalPage = ({ type, onClose }) => {
    const isPrivacy = type === 'privacy';

    return (
        <div className="legal-page full-screen glass">
            <div className="legal-header">
                <button className="back-btn" onClick={onClose}>
                    <ArrowLeft size={24} />
                </button>
                <h2>{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h2>
            </div>

            <div className="legal-content">
                {isPrivacy ? (
                    <>
                        <h3>Privacy Policy for DRIPR8</h3>
                        <p><strong>Effective Date:</strong> November 28, 2025</p>

                        <h4>1. Introduction</h4>
                        <p>Welcome to DRIPR8. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our app and tell you about your privacy rights.</p>

                        <h4>2. Data We Collect</h4>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul>
                            <li><strong>Image Data:</strong> Photos you upload for analysis. These are processed by AI and may be stored if you choose to share them.</li>
                            <li><strong>Identity Data:</strong> Username and User ID (if you sign in).</li>
                            <li><strong>Usage Data:</strong> Information about how you use our app.</li>
                        </ul>

                        <h4>3. How We Use Your Data</h4>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we use your personal data in the following circumstances:</p>
                        <ul>
                            <li>To provide the AI rating service.</li>
                            <li>To generate your premium cards.</li>
                            <li>To manage your account.</li>
                        </ul>

                        <h4>4. Data Security</h4>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way.</p>

                        <h4>5. Contact Us</h4>
                        <p>If you have any questions about this privacy policy, please contact us at support@dripr8.com.</p>
                    </>
                ) : (
                    <>
                        <h3>Terms of Service for DRIPR8</h3>
                        <p><strong>Effective Date:</strong> November 28, 2025</p>

                        <h4>1. Acceptance of Terms</h4>
                        <p>By accessing or using DRIPR8, you agree to be bound by these Terms of Service.</p>

                        <h4>2. User Content</h4>
                        <p>You retain ownership of the photos you upload. By uploading, you grant DRIPR8 a license to process the image for the purpose of providing the service.</p>

                        <h4>3. Prohibited Conduct</h4>
                        <p>You agree not to upload content that is illegal, offensive, or violates the rights of others.</p>

                        <h4>4. Disclaimer</h4>
                        <p>The AI ratings are for entertainment purposes only.</p>

                        <h4>5. Termination</h4>
                        <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default LegalPage;
