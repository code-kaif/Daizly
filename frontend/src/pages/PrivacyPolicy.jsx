import React from "react";
import Title from "../components/Title";

const PrivacyPolicy = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-20 py-10 border-t text-gray-700">
      <div className="text-2xl text-center mb-8">
        <Title text1={"PRIVACY"} text2={"POLICY"} />
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto text-sm leading-relaxed">
        <p>
          At <strong>UniqueVilla7</strong>, we are committed to protecting the
          privacy and security of our customers. This Privacy Policy outlines
          how we collect, use, and protect your personal information when you
          interact with our website and services.
        </p>

        <h3 className="font-semibold text-base text-black">
          1. Information We Collect
        </h3>
        <ul className="list-disc list-inside ml-4">
          <li>
            Personal details like name, email, phone number, and address during
            account creation or order placement.
          </li>
          <li>
            Payment information (secured and encrypted via trusted gateways).
          </li>
          <li>
            Browsing behavior, device details, and usage data through cookies.
          </li>
        </ul>

        <h3 className="font-semibold text-base text-black">
          2. How We Use Your Information
        </h3>
        <p>We use your data to:</p>
        <ul className="list-disc list-inside ml-4">
          <li>
            Process and fulfill orders, provide delivery updates, and send
            invoices.
          </li>
          <li>
            Improve user experience, enhance our product offerings, and optimize
            website functionality.
          </li>
          <li>
            Send updates about promotions, new arrivals, or changes to our
            services (with your consent).
          </li>
        </ul>

        <h3 className="font-semibold text-base text-black">
          3. Data Protection
        </h3>
        <p>
          UniqueVilla7 employs strict security measures to safeguard your
          personal information. All payment data is processed using encrypted,
          secure channels.
        </p>

        <h3 className="font-semibold text-base text-black">
          4. Sharing Information
        </h3>
        <p>
          We do not sell, rent, or trade your personal data with third parties.
          We only share your data with trusted logistics, payment processors, or
          when legally required.
        </p>

        <h3 className="font-semibold text-base text-black">5. Cookies</h3>
        <p>
          We use cookies to enhance your browsing experience and collect
          anonymous usage data. You can control cookies through your browser
          settings.
        </p>

        <h3 className="font-semibold text-base text-black">6. Your Rights</h3>
        <p>
          You can request to access, modify, or delete your personal data at any
          time. Contact our support team for any privacy-related requests.
        </p>

        <h3 className="font-semibold text-base text-black">
          7. Changes to This Policy
        </h3>
        <p>
          We may update our Privacy Policy to reflect changes in our practices.
          We encourage you to review this page periodically.
        </p>

        <h3 className="font-semibold text-base text-black">8. Contact Us</h3>
        <p>
          For any privacy concerns or questions, please email us at{" "}
          <a
            href="mailto:fashionvilla7@gmail.com"
            className="text-blue-600 underline"
          >
            uniquevilla7@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
