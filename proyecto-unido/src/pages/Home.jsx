import React from "react";
import Navbar from "@/components/banco/Navbar";
import HeroSection from "@/components/banco/HeroSection";
import SocialSidebar from "@/components/banco/SocialSidebar";
import ProductCards from "@/components/banco/ProductCards";
import Testimonials from "@/components/banco/Testimonials";
import ProductsForYou from "@/components/banco/ProductsForYou";
import Footer from "@/components/banco/Footer";

export default function Home() {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        fontFamily: "'Raleway', 'Poppins', sans-serif",
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <SocialSidebar />
      <HeroSection />
      <ProductCards />
      <Testimonials />
      <ProductsForYou />
      <Footer />
    </div>
  );
}