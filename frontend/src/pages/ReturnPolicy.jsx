import React from "react";
import Title from "../components/Title";

const ReturnPolicy = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-20 py-10 border-t text-gray-200">
      <div className="text-2xl text-center mb-8">
        <Title text1={"RETURN"} text2={"POLICY"} />
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto text-sm leading-relaxed">
        <p>
          At <strong>DAIZLY</strong>, we want you to be completely satisfied
          with your purchase. If for any reason you are not entirely happy with
          your order, we're here to help. Please review our return policy below:
        </p>

        <h3 className="font-semibold text-base">1. Return Window</h3>
        <p>
          You may return or exchange your purchase within{" "}
          <strong>3 days of delivery</strong>. After this period, we are unable
          to offer returns or exchanges.
        </p>

        <h3 className="font-semibold text-base">
          2. Conditions for Returns & Exchange
        </h3>
        <ul className="list-disc list-inside ml-4">
          <li>
            To be eligible for a return, your item must be unused, unworn, and
            in the same condition that you received it. It must also be in the
            original packaging.
          </li>
          <li>
            For <strong>exchanges</strong>, there are{" "}
            <strong>no charges</strong> — the exchange is{" "}
            <strong>completely free of cost</strong>. To initiate an exchange,
            please send us the <strong>unboxing video</strong> within 24 hours
            of delivery by sharing it on Instagram, and our team will assist you
            instantly during working hours.
          </li>
          <li>
            For <strong>returns</strong>, customers will need to{" "}
            <strong>bear the shipping cost of ₹299/-</strong> for both pickup
            and delivery of the product. This amount will be{" "}
            <strong>deducted</strong> from the refund. Refunds are processed{" "}
            <strong>within 24 hours</strong> of the product’s delivery to our
            warehouse.
          </li>
        </ul>

        <h3 className="font-semibold text-base">3. Size Exchanges</h3>
        <p>
          We understand the importance of choosing the correct size. Please
          review our sizing guides before purchasing. If you need to exchange an
          item due to size issues, we're happy to assist you. However, the
          customer will be responsible for the return shipping costs in this
          case.
        </p>

        <h3 className="font-semibold text-base">4. Return Process</h3>
        <ol className="list-decimal list-inside ml-4">
          <li>
            Contact our customer support team within the 3-day return window
            through the “Contact Us” section on our website.
          </li>
          <li>
            Provide your order number and the reason for your return or
            exchange.
          </li>
          <li>
            Our team will guide you through the process and provide you with a
            return authorization and shipping instructions.
          </li>
        </ol>

        <h3 className="font-semibold text-base">5. Refunds</h3>
        <p>
          Once your return is received and inspected, we will initiate your
          refund, and it will be settled within <strong>24 hours</strong>.
        </p>

        <h3 className="font-semibold text-base">6. Important Note</h3>
        <p>
          Returns and exchanges are{" "}
          <strong>not applicable on sale products</strong>. Items purchased at a
          discounted price or during a sale event cannot be returned or
          exchanged. Please check the specific terms and conditions of the sale,
          as they may vary depending on the store.
        </p>
      </div>
    </div>
  );
};

export default ReturnPolicy;
