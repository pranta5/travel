import React from "react";
import AboutHero from "@/components/page/aboutComp/aboutHeroComp";
import Contactform_comp from "@/components/page/contactComp/contact_des";

export type AboutHeroProps = {
  heroImage?: string;
  title?: string;
  subtitle?: string;
};

const AboutSection: React.FC<AboutHeroProps> = ({
  heroImage = "/img/about-side.png",
  title = "Contact Us",
  subtitle = "Stay informed and inspired for your next journey",
}) => {
  return (
    <section className="w-full">
      <AboutHero image={heroImage} title={title} subtitle={subtitle} />
      <Contactform_comp />
    </section>
  );
};

export default AboutSection;
