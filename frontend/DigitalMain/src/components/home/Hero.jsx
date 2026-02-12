import { useEffect, useRef, useState } from "react";
import "../../styles/hero.css";

import banner1 from '../../assets/banners/bg1.jpg'; // Rename files
import banner2 from '../../assets/banners/bg2.jpg';
import banner3 from '../../assets/banners/bg3.jpg';
import banner4 from '../../assets/banners/bg4.jfif';
import banner5 from '../../assets/banners/bg5.png';
import { FadeFeature } from "./FadeFeature";
import { useNavigate } from "react-router-dom";

import category1 from '../../assets/categories/crop2.png';
import category2 from '../../assets/categories/fertilizer1.png';
import category3 from '../../assets/categories/medician1.png';
import category4 from '../../assets/categories/seed1.png';






const images = [
  banner1,
  banner2,
  banner3,
  banner4,
];



const categories = [
  { id: 1, name: "Crop", img:category1 },
  { id: 3, name: "Fertilizer", img: category2 },
  { id: 2, name: "Seed", img:  category4},
  { id: 4, name: "Medicine", img:category3 },
];

function Categories() {
  const sliderRef = useRef(null);
  const navigate = useNavigate(); // ✅ ADD THIS

  return (
    <div className="hero-section">
      <div className="category-wrapper">
        <div className="category-slider" ref={sliderRef}>
          <section className="category-section">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => navigate(`/products/category/${cat.id}`)}
              >
                <img src={cat.img} alt={cat.name} />
                <h3>{cat.name}</h3>
              </div>
            ))}
          </section>

        </div>
      </div>
    </div>
  );
}

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* HERO SLIDER */}
      <section className="hero-slider">
        {images.map((img, index) => (
          <div
            key={index}
            className={`slide ${index === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="hero-overlay">
          <h1>Digital Krishi Bazaar</h1>
          <p>Connecting Farmers Directly to Digital Markets</p>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="category-section" ref={sliderRef}>
        {categories.map(cat => (
          <div
            key={cat.id}
            className="category-card"
            onClick={() => navigate(`/products/category/${cat.id}`)}
          >
            <img src={cat.img} alt={cat.name} />
            <h3>{cat.name}</h3>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section className="feature-wrapper">
        <FadeFeature
          image="https://images.unsplash.com/photo-1605000797499-95a51c5269ae"
          texts={[
            "Buy seeds, fertilizers, medicines, sell crops, access loans — all in one platform.",
            "A single digital marketplace built to simplify every farmer’s journey."
          ]}
        />

        <FadeFeature
          image={banner5}
          texts={[
            "Transparent pricing, secure payments, and faster settlements.",
            "Empowering modern agriculture with smart digital tools."
          ]}
          reverse
        />
      </section>
    </>
  );
};

export default Hero;