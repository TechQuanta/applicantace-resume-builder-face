import React from 'react'; // Removed useState as visibility is now controlled by parent

// Accept isOpen and onClose props from the parent component
const TermsAndPrivacyModal = ({ isOpen, onClose }) => {
  // If the modal is not open (based on parent's prop), return null to render nothing.
  if (!isOpen) {
    return null;
  }

  // Function to close the modal when clicking on the overlay (background).
  // This function is passed down from the parent (AuthPage)
  const handleOverlayClick = (event) => {
    // Only close if the click occurred directly on the modal-overlay div, not its content.
    if (event.target.id === 'termsPrivacyModalOverlay') {
      onClose(); // Call the onClose prop provided by the parent
    }
  };

  return (
    <div
      id="termsPrivacyModalOverlay" // Unique ID for the overlay to target clicks
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark, semi-transparent overlay
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align content to the top
        zIndex: 1000, // Ensure it's above other content
        overflowY: 'auto', // Allow vertical scrolling if content is too long
        padding: '20px', // Padding around the content
        boxSizing: 'border-box', // Include padding in element's total width and height
        opacity: 1, // Start fully visible
        transition: 'opacity 0.3s ease-in-out', // Smooth fade-in/out
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          fontFamily: "'Roboto', sans-serif",
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', // Premium gradient background
          borderRadius: '15px', // Rounded corners
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', // Deep shadow for premium feel
          padding: '40px', // Ample internal padding
          maxWidth: '900px', // Maximum width for readability
          width: '100%', // Take full width up to maxWidth
          position: 'relative',
          zIndex: 1001, // Above the overlay
          maxHeight: '95vh', // Max height, enabling internal scroll
          overflowY: 'auto', // Enable scrolling for the content itself
          color: '#333', // Default text color
          transform: 'translateY(0)', // No initial vertical offset
          transition: 'transform 0.3s ease-in-out', // Smooth transform effect
        }}
      >
        {/*
          The content of your User Agreement: Terms and Privacy Statement
          (all the sections like Introduction, Eligibility, Data Handling, etc.)
          goes here, exactly as provided in our last turn.
          I'm omitting it here for brevity, but copy-paste it from the previous response.
        */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8em',
            textAlign: 'center',
            color: '#1a2a4e',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '15px',
            marginBottom: '30px',
          }}
        >
          <strong>User Agreement: Terms and Privacy Statement</strong>
        </h1>

        <div
          style={{
            backgroundColor: '#e6f7ff',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #91d5ff',
            marginBottom: '30px',
            textAlign: 'center',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#096dd9',
              margin: '0 0 10px 0',
              fontSize: '1.8em',
            }}
          >
            <strong>Your Agreement to Our Comprehensive Policy</strong>
          </h3>
          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              lineHeight: '1.7',
              fontSize: '1.1em',
              color: '#336699',
            }}
          >
            Welcome to <strong>Applicantace</strong>! By accessing or using our
            services, you signify that you have read, understood, and agree to be
            bound by <strong>this comprehensive User Agreement</strong>, which
            includes our <strong>Terms and Conditions</strong> for service usage
            and our <strong>Privacy Statement</strong> regarding data handling.
            If you do not agree with any part of this Agreement, you must not
            use our services. We reserve the right to update these terms at any
            time without notice, and your continued use constitutes acceptance.
          </p>
        </div>

        <hr style={{ borderTop: '1px solid #eee', margin: '30px 0' }} />

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>1. Introduction and Acceptance of this Agreement</strong>
        </h2>
        <p>
          This <strong>User Agreement</strong> governs your access to and use
          of <strong>Applicantace</strong> and all associated services, features,
          content, and applications (collectively, the "Services"). By
          registering an account, logging in, or simply using any part of our
          Services, you acknowledge that you have read, understood, and agree to
          comply with and be bound by <strong>this entire Agreement</strong>.
          This document constitutes a legally binding contract between you and
          <strong>Applicantace</strong>.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>2. Eligibility and Account Registration</strong>
        </h2>
        <p>
          You must be at least <strong>13 years old</strong> to use our Services.
          When you register an account with <strong>Applicantace</strong>, you agree to:
        </p>
        <ul>
          <li>
            Provide <strong>accurate, current, and complete</strong> information as
            prompted by registration forms.
          </li>
          <li>
            Maintain the <strong>security and confidentiality</strong> of your
            password and account credentials.
          </li>
          <li>
            <strong>Maintain and promptly update</strong> your registration data
            to keep it accurate, current, and complete.
          </li>
          <li>
            Be <strong>solely responsible</strong> for all activity that occurs
            under your account.
          </li>
        </ul>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>3. Service Offerings and Login Methods</strong>
        </h2>
        <p>
          We offer a range of services designed to <strong>enhance your
          resume, prepare for interviews, and optimize your job search</strong>.
          The scope of Services available to you may vary based on your login
          method:
        </p>
        <ul>
          <li>
            <strong>Normal Account (Email/Password):</strong> Provides access to
            our <strong>core resume editor, limited document storage, and
            access to community forums</strong>.
          </li>
          <li>
            <strong>Google Login:</strong> In addition to basic features, logging in
            via Google allows for <strong>seamless document import from Google Drive
            and enhanced profile management linked to your Google account</strong>.
            By using Google login, you acknowledge Google's terms and privacy practices
            govern aspects of their service integration.
          </li>
          <li>
            <strong>GitHub Login:</strong> Logging in via GitHub provides similar
            basic features and enables <strong>code portfolio integration,
            collaborative project features, and access to developer-focused tools</strong>.
            By using GitHub login, you acknowledge GitHub's terms and privacy practices
            govern aspects of their service integration.
          </li>
        </ul>
        <p>
          <strong>Storage Space:</strong> We provide{' '}
          <strong>up to 100MB of free storage space</strong> for your documents
          and related content. This storage is subject to our fair usage policy
          and may be reviewed or adjusted based on your subscription level.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>4. Data Handling and Privacy Statement</strong>
        </h2>
        <p>
          Our Services rely on <strong>robust cloud infrastructure</strong>. We
          are committed to protecting your privacy and handling your data
          responsibly. You acknowledge the following regarding your data:
        </p>
        <ul>
          <li>
            <strong>Data Collection:</strong> We collect information you provide
            directly (e.g., during registration, profile creation, document uploads)
            and data automatically collected as you use our Services (e.g., usage
            data, device information).
          </li>
          <li>
            <strong>Use of Data:</strong> Your data is used to provide, maintain,
            and improve our Services, to process your requests, to personalize your
            experience, and for internal analytics.
          </li>
          <li>
            <strong>Data Residency:</strong> Your data may be stored and processed
            in data centers located in various regions globally by our cloud service
            providers (e.g., AWS, Google Cloud, Azure).
          </li>
          <li>
            <strong>Data Security:</strong> We implement <strong>industry-standard
            security measures</strong> to protect your data from unauthorized access,
            alteration, disclosure, or destruction. However, no internet transmission
            or electronic storage is completely secure.
          </li>
          <li>
            <strong>Data Sharing:</strong> We do not sell your personal data. We may
            share data with trusted third-party service providers (e.g., cloud hosts,
            analytics providers) only to the extent necessary to operate and improve
            our Services, under strict confidentiality agreements. We may also disclose
            data if required by law or to protect our rights.
          </li>
          <li>
            <strong>Your Rights:</strong> You have rights regarding your personal
            data, including access, correction, and deletion, subject to applicable
            laws.
          </li>
          <li>
            <strong>Compliance:</strong> We endeavor to comply with applicable data
            protection regulations concerning your data stored in our cloud infrastructure.
            This section serves as our complete Privacy Statement.
          </li>
        </ul>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>5. Acceptable Use and Prohibited Conduct</strong>
        </h2>
        <p>
          You agree to use the Services only for <strong>lawful purposes</strong> and
          in a manner that does not infringe the rights of, restrict, or inhibit anyone
          else's use and enjoyment of the Services. <strong>Prohibited conduct</strong>
          includes, but is not limited to:
        </p>
        <ul>
          <li>
            Uploading or transmitting any content that is <strong>unlawful,
            harmful, threatening, abusive, harassing, defamatory, vulgar, obscene,
            libelous, invasive of another's privacy, hateful, or racially, ethnically,
            or otherwise objectionable</strong>.
          </li>
          <li>
            Engaging in any activity that could <strong>disable, overburden, damage,
            or impair</strong> the proper working of the Website.
          </li>
          <li>
            Attempting to gain <strong>unauthorized access</strong> to any parts of
            the Website, other accounts, computer systems, or networks connected to
            the Website.
          </li>
          <li>
            Using the Services to transmit <strong>spam, junk mail, chain letters,
            or unsolicited mass distribution of email</strong>.
          </li>
          <li>
            <strong>Impersonating any person or entity</strong> or falsely stating
            or otherwise misrepresenting your affiliation with a person or entity.
          </li>
          <li>
            <strong>Violating any applicable local, state, national, or international
            law or regulation</strong>.
          </li>
          <li>
            <strong style={{ color: '#cf1322' }}>
              Uploading or manipulating content within our editor, especially PDF
              files, that contains abusive, harmful, illegal, or unwanted material.
              This includes, but is not limited to, malware, viruses, hate speech,
              explicit content, or content infringing on intellectual property rights.
            </strong>
          </li>
        </ul>
        <p
          style={{
            backgroundColor: '#ffedeb',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #ff7875',
            color: '#cf1322',
            marginTop: '25px',
            fontWeight: 'bold',
            lineHeight: '1.6',
          }}
        >
          <strong>Abuse Warning:</strong> We reserve the right to investigate and
          take <strong>appropriate legal action</strong> against anyone who, in
          our sole discretion, violates this provision. This may include, without
          limitation, immediate <strong>suspension or termination of your
          account</strong>, removal of the offending content from the Service, and
          reporting to relevant authorities.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>6. ATS Resume Check Policy</strong>
        </h2>
        <p>
          Our ATS (Applicant Tracking System) Resume Check service helps you
          optimize your resume. Please note the following specific terms for this
          service:
        </p>
        <ul>
          <li>
            <strong>Rate Limit (Free Tier):</strong> For our free users, you are
            limited to <strong>one (1) ATS resume check per resume file within
            a two (2) hour period</strong>. This limit resets two hours after your
            last submission of the same file.
          </li>
          <li>
            <strong>Fair Usage:</strong> This policy is in place to ensure fair usage
            of our computational resources and to prevent abuse.
          </li>
          <li>
            <strong>Additional Checks:</strong> If you require more frequent or a
            higher volume of ATS checks beyond the free tier limit, please contact
            us. We offer flexible "pay-as-you-go" options.
          </li>
          <li>
            <strong>Accuracy:</strong> While our ATS check is designed to provide
            valuable insights, it is an <strong>AI-driven tool</strong>. We do not
            guarantee job placement or absolute accuracy of results. It should be
            used as a supplementary tool in your job search.
          </li>
        </ul>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>7. Intellectual Property</strong>
        </h2>
        <p>
          All content, features, and functionality on the Website, including text,
          graphics, logos, icons, images, audio clips, digital downloads, data
          compilations, and software, are the exclusive property of{' '}
          <strong>Applicantace</strong> or its content suppliers and are protected
          by international <strong>copyright, trademark, patent, trade secret</strong>,
          and other intellectual property or proprietary rights laws.
        </p>
        <p>
          You may not modify, copy, distribute, transmit, display, perform, reproduce,
          publish, license, create derivative works from, transfer, or sell any
          information, software, products, or services obtained from the Services
          without our prior written consent.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>8. Termination of Account</strong>
        </h2>
        <p>
          We may <strong>terminate or suspend your account</strong> and bar access
          to the Services immediately, without prior notice or liability, under our
          sole discretion, for any reason whatsoever and without limitation,
          including but not limited to a <strong>breach of this Agreement</strong>.
        </p>
        <p>
          If you wish to terminate your account, you may simply discontinue using
          the Services or contact us for account deletion.
        </p>
        <p>
          All provisions of this Agreement which by their nature should survive
          termination shall survive termination, including, without limitation,
          ownership provisions, warranty disclaimers, indemnity, and limitations
          of liability.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>9. Disclaimer of Warranties</strong>
        </h2>
        <p>
          The Services are provided on an <strong>"AS IS"</strong> and{' '}
          <strong>"AS AVAILABLE"</strong> basis. We make no representations or
          warranties of any kind, express or implied, as to the operation of their
          Services or the information, content, materials, or products included on
          the Services. You expressly agree that your use of the Services is at
          your <strong>sole risk</strong>.
        </p>
        <p>
          To the full extent permissible by applicable law, we{' '}
          <strong>disclaim all warranties</strong>, express or implied, including,
          but not limited to, implied warranties of merchantability and fitness
          for a particular purpose. We do not warrant that the Services, its
          servers, or communications from us are free of viruses or other harmful
          components.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>10. Limitation of Liability</strong>
        </h2>
        <p>
          In no event shall <strong>Applicantace</strong>, nor its directors,
          employees, partners, agents, suppliers, or affiliates, be liable for
          any <strong>indirect, incidental, special, consequential, or punitive
          damages</strong>, including without limitation, loss of profits, data,
          use, goodwill, or other intangible losses, resulting from (i) your access
          to or use of or inability to access or use the Services; (ii) any conduct
          or content of any third party on the Services; (iii) any content obtained
          from the Services; and (iv) unauthorized access, use or alteration of
          your transmissions or content, whether based on warranty, contract, tort
          (including negligence), or any other legal theory, whether or not we have
          been informed of the possibility of such damage, and even if a remedy
          set forth herein is found to have failed of its essential purpose.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>11. Governing Law</strong>
        </h2>
        <p>
          This <strong>User Agreement</strong> shall be governed and construed in
          accordance with the laws of <strong>Indore, Madhya Pradesh, India</strong>,
          without regard to its conflict of law provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of this Agreement will
          not be considered a waiver of those rights. If any provision of this
          Agreement is held to be invalid or unenforceable by a court, the
          remaining provisions will remain in effect.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>12. Changes to this User Agreement</strong>
        </h2>
        <p>
          We reserve the right, at our sole discretion, to <strong>modify or
          replace this User Agreement</strong> at any time. If a revision is
          material, we will provide at least <strong>30 days'</strong> notice
          prior to any new terms taking effect. What constitutes a material
          change will be determined at our sole discretion.
        </p>
        <p>
          By continuing to access or use our Service after any revisions become
          effective, you agree to be bound by the revised terms. If you do not
          agree to the new terms, you are no longer authorized to use the Service.
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2em',
            color: '#34495e',
            marginTop: '40px',
            borderLeft: '5px solid #a8dadc',
            paddingLeft: '15px',
            lineHeight: '1.2',
          }}
        >
          <strong>13. Contact Us</strong>
        </h2>
        <p>
          If you have any questions about this <strong>User Agreement</strong>,
          please contact us directly.
        </p>

        <div
          style={{
            backgroundColor: '#f7f9fc',
            padding: '25px',
            borderRadius: '10px',
            borderTop: '1px solid #e0e0e0',
            marginTop: '40px',
            textAlign: 'center',
            fontSize: '1.1em',
            color: '#666',
          }}
        >
          <p>
            This project, <strong>Applicantace</strong>, is a proud initiative of
            <strong> Community Techquanta</strong>, designed for students building
            projects using Spring Boot, React, external APIs, and AWS
            authentication.
          </p>
          <p>
            Created by: <strong>Himanshu Sahu</strong> (Medicaps student),{' '}
            <strong>Ashmeet Singh</strong> (Holkar Science College student),{' '}
            <strong>Vishal Choudhary</strong> (Holkar Science College student).
          </p>
          <p
            style={{
              fontSize: '1.2em',
              fontWeight: 'bold',
              color: '#389e0d',
              marginTop: '20px',
            }}
          >
            By proceeding to use our Services, you confirm that you have read,
            understood, and agreed to this <strong>User Agreement</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyModal;