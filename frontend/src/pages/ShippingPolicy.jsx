import React from "react";
import Title from "../components/Title";

const ShippingPolicy = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-20 py-10 border-t text-gray-200">
      <div className="text-2xl text-center mb-8">
        <Title text1={"SHIPPING"} text2={"POLICY"} />
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto text-sm leading-relaxed">
        <p>
          At <strong>DAIZLY</strong>, we aim to deliver your orders quickly and
          safely. Please read our shipping policy below:
        </p>

        <h3 className="font-semibold text-base">1. Order Processing</h3>
        <ul className="list-disc list-inside ml-4">
          <li>
            All orders are processed within 1 business day (excluding weekends
            and holidays).
          </li>
          <li>
            You will receive an order confirmation email once your order has
            been placed.
          </li>
          <li>
            Once shipped, you will receive a tracking number via email/SMS.
          </li>
        </ul>

        <h3 className="font-semibold text-base">2. Shipping Time</h3>
        <ul className="list-disc list-inside ml-4">
          <li>Standard Delivery (India): 3–7 business days</li>
          <li>
            International Shipping: 7–15 business days (may vary depending on
            customs and location)
          </li>
        </ul>

        <h3 className="font-semibold text-base">3. Delays</h3>
        <p>
          We are not responsible for delays caused by courier services, customs
          clearance, weather conditions, or unforeseen events.
        </p>

        <h3 className="font-semibold text-base">4. Address Accuracy</h3>
        <p>
          Customers are responsible for providing the correct shipping address.
          Orders delivered to a wrong address due to incorrect information will
          not be eligible for refunds.
        </p>

        <h3 className="font-semibold text-base">5. Damaged or Lost Packages</h3>
        <p>
          If your order arrives damaged or is lost in transit, please contact us
          within 24 hours at <strong>daizly01@gmail.com</strong> or call{" "}
          <strong>+91 93159 43603</strong>. We will assist you with a
          replacement or refund as per our policy.
        </p>

        <h3 className="font-semibold text-base">6. Contact Us</h3>
        <p>
          For any shipping-related queries, reach out to us: <br />
          📧 Email:{" "}
          <a
            href="mailto:daizly01@gmail.com"
            className="text-blue-600 underline"
          >
            daizly01@gmail.com
          </a>{" "}
          <br />
          📞 Phone: +91 93159 43603
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicy;
