import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center md:pt-6 pt-12 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="my-5 flex flex-col md:flex-row justify-center gap-16">
        {/* <img
          className="w-full md:max-w-[350px] md:block hidden"
          src={assets.about}
          alt="about us image"
        /> */}
        <div className="flex flex-col justify-center gap-6 md:w-3/4 text-gray-200">
          <p>
            At <b>DAIZLY</b>, we’re not just creating jackets — we’re creating
            the future of fashion.
          </p>
          <p>
            Our journey started with a simple idea: <br />
            👉 What if a leather jacket could be more than just style?
          </p>
          <p>
            We combine timeless leather craftsmanship with cutting-edge
            technology, bringing innovation into everyday fashion. Every DAIZLY
            leather jacket is carefully designed to deliver unmatched comfort,
            durability, and style — while also offering something truly unique:
            <b> NFC-powered smart features.</b>
          </p>

          <b className="text-gray-400">NFC Innovation in Fashion</b>
          <p>
            Each DAIZLY jacket comes with an integrated NFC tag, allowing you
            to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Instantly verify product authenticity</li>
              <li>Access exclusive DAIZLY content & styling tips</li>
              <li>Register your jacket for warranty & updates</li>
              <li>Connect to digital experiences with just a tap</li>
            </ul>
          </p>

          <b className="text-gray-400">Why Choose DAIZLY?</b>
          <ul className="list-disc list-inside space-y-1">
            <li>Premium leather with modern designs</li>
            <li>Jackets that blend fashion + technology</li>
            <li>
              A brand that values individuality, innovation, and timeless
              confidence
            </li>
          </ul>

          <p>
            With DAIZLY, your jacket is more than clothing —{" "}
            <b>it’s your digital companion.</b>
          </p>
          <p>
            <b>Wear the future. Own the style.</b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
