import React, { useContext } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

const Contact = () => {
  const { backendUrl } = useContext(ShopContext);
  const [result, setResult] = React.useState("Submit");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending...");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(backendUrl + "/api/user/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (resData.success) {
        setResult("Form Submitted Successfully");
        form.reset();
      } else {
        setResult(resData.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error sending form:", error);
      setResult("Submission failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="text-center text-2xl md:pt-6 pt-12 border-t">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      <div className="my-5 flex flex-col justify-center md:flex-row gap-10 mb-28 px-5">
        {/* Left Side Image */}
        <img
          className="w-full md:max-w-[400px] object-cover md:block hidden"
          src={assets.contact_img}
          alt="contact us"
        />

        {/* Right Side Contact Form */}
        <form
          onSubmit={onSubmit}
          className="w-full md:max-w-[500px] flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1">
            <input type="hidden" name="apikey" value="YOUR_ACCESS_KEY_HERE" />
            <label htmlFor="name" className="text-sm text-gray-600">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your full name"
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-sm text-gray-600">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Write your message..."
              className="border border-gray-300 px-4 py-2 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white duration-300 rounded-md"
          >
            {result}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
