import { useEffect, useState } from "react";


export const FadeFeature = ({ image, texts, reverse }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [texts.length]);

  return (
    <div className={`feature-section ${reverse ? "reverse" : ""}`}>
      <div className="feature-image">
        <img src={image} alt="Feature" />
      </div>

      <div className="feature-text">
        <p key={index} className="fade-text">
          {texts[index]}
        </p>
      </div>
    </div>
  );
};
