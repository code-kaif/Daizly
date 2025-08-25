import React from "react";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import Testimonials from "../components/Testimonials";
import CategorySection from "../components/Categories";
import GallerySection from "../components/Gallery";

const Home = () => {
  return (
    <div>
      <Hero />
      <CategorySection />
      <BestSeller />
      <GallerySection />
      <OurPolicy />
      <Testimonials />
    </div>
  );
};

export default Home;
