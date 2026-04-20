import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

// Desktop components
import Hero from "../components/landingPage/Hero";
import PublicNavbar from "../components/PublicNavbar";
import TopNav from "../components/landingPage/TopNav";
import TrustBar from "../components/landingPage/TrustBar";
import PromoBar from "../components/landingPage/PromoBar";
import CoursesSection from "../components/course/CoursesSection";
import AboutSection from "../components/landingPage/AboutSection";
import ClientsSection from "../components/landingPage/ClientsSection";
import ContactEnrollment from "../components/landingPage/ContactEnrollment";
import Footer from "../components/landingPage/Footer";
import Carousel from "../components/CarouselMain";
import ViewAllCoursesMobile from "../components/mobile/components/ViewAllCoursesMobile";

// Mobile component
import MobileLandingPage from "../components/mobile/components/MobileLandingPage";

import "../styles/LandingPage.css";

// ── Custom hook: returns true when viewport is ≤ 768 px ──────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}
// ─────────────────────────────────────────────────────────────────────────────

function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `https://api.octosofttechnologies.in/api/courses`
        );
        setCourses(res.data);
        const uniqueCategories = [
          ...new Set(res.data.map((c) => c.category)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  // ── Mobile view ──────────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileLandingPage courses={courses} />;
  }

  // ── Desktop view (original layout) ───────────────────────────────────────
  return (
    <div>
      <TopNav />
      <PublicNavbar courses={courses} />
      <Hero />

      <div className="adv-bar">
        <div>
          <PromoBar />
        </div>
        <div className="tru-bar">
          <TrustBar />
        </div>
      </div>

      <div>
        <Carousel courses={courses} />
      </div>

      <div id="courses">
        <CoursesSection categories={categories} />
      </div>

      <AboutSection />
      <ClientsSection />
      <ContactEnrollment />
      <Footer />
    </div>
  );
}

export default LandingPage;