import React from "react";
import AboutHero from "@/components/page/aboutComp/aboutHeroComp";
import { AboutFeaturesComp } from "@/components/page/aboutComp/featureComp";
import WhyChooseUs from "@/components/page/homeComp/WhyChooseUs";
import AboutGallerySection from "@/components/page/aboutComp/AboutGallerySection";

export type AboutHeroProps = {
  heroImage?: string;
  title?: string;
  subtitle?: string;
};

const AboutSection: React.FC<AboutHeroProps> = ({
  heroImage = "/img/about-hero.png",
  title = "About Us",
  subtitle = "Stay informed and inspired for your next journey",
}) => {
  return (
    <section className="w-full">
      <AboutHero image={heroImage} title={title} subtitle={subtitle} />
      <AboutFeaturesComp />
      <AboutGallerySection />
      <WhyChooseUs />
    </section>
  );
};

export default AboutSection;
