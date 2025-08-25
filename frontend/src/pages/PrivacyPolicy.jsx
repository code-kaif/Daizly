import React from "react";
import Title from "../components/Title";

const PrivacyPolicy = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-20 py-10 border-t text-gray-200">
      <div className="text-2xl text-center mb-8">
        <Title text1={"PRIVACY"} text2={"POLICY"} />
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto text-sm leading-relaxed">
        <p>
          <strong>DAIZLY</strong> (“we”, “our”, “us”) respects your privacy and
          is committed to protecting your personal information. This Privacy
          Policy explains how we collect, use, and safeguard your data when you
          visit or make a purchase from our website <strong>[Daizly.in]</strong>
          .
        </p>

        <h3 className="font-semibold text-base">1. Information We Collect</h3>
        <ul className="list-disc list-inside ml-4">
          <li>
            <strong>Personal Information:</strong> name, email address, phone
            number, shipping/billing address, payment details
          </li>
          <li>
            <strong>Non-Personal Information:</strong> browser type, IP address,
            device information, cookies, browsing behavior on our site
          </li>
        </ul>

        <h3 className="font-semibold text-base">
          2. How We Use Your Information
        </h3>
        <ul className="list-disc list-inside ml-4">
          <li>Process and deliver your orders</li>
          <li>Improve our website and customer experience</li>
          <li>
            Send you updates, promotions, and offers (you may opt out anytime)
          </li>
          <li>Prevent fraudulent transactions and ensure security</li>
        </ul>

        <h3 className="font-semibold text-base">3. Sharing of Information</h3>
        <p>
          We do not sell or rent your personal information. We may share your
          data only with:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>
            Trusted third-party service providers (payment gateways, shipping
            partners, analytics tools)
          </li>
          <li>Legal authorities if required by law</li>
        </ul>

        <h3 className="font-semibold text-base">4. Cookies</h3>
        <p>
          Our website uses cookies to enhance your browsing experience. You can
          disable cookies from your browser settings, but some features of the
          site may not work properly.
        </p>

        <h3 className="font-semibold text-base">5. Data Security</h3>
        <p>
          We implement industry-standard security measures to protect your
          personal information. However, no method of online transmission is
          100% secure, and we cannot guarantee absolute security.
        </p>

        <h3 className="font-semibold text-base">6. Your Rights</h3>
        <ul className="list-disc list-inside ml-4">
          <li>Access, update, or delete your personal data</li>
          <li>Opt-out of marketing communications</li>
          <li>Contact us for any privacy-related concerns</li>
        </ul>

        <h3 className="font-semibold text-base">7. Contact Us</h3>
        <p>
          If you have any questions regarding this Privacy Policy, please
          contact us:
        </p>
        <p>
          📧 Email:{" "}
          <a
            href="mailto:daizly01@gmail.com"
            className="text-blue-600 underline"
          >
            daizly01@gmail.com
          </a>
        </p>
        <p>📞 Phone: +91 93159 43603</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
