import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Is my camera data stored?",
      answer: "No. Zenith Health processes all video feeds locally on your device in real-time. No video data is ever recorded, stored, or sent to our servers. Your privacy is our top priority."
    },
    {
      question: "Is it free?",
      answer: "We offer a generous free tier that includes basic posture tracking and movement analysis. Premium features like advanced AI coaching and historical trend analytics require a subscription."
    },
    {
      question: "Does it work on mobile?",
      answer: "Yes! Our platform is fully responsive and works on any modern smartphone, tablet, or laptop camera without needing to download an app."
    },
    {
      question: "Is it medically accurate?",
      answer: "Zenith Health is designed for wellness and fitness optimization, not medical diagnosis. While our AI is highly accurate at detecting form and posture, you should always consult a healthcare professional for medical advice."
    },
    {
      question: "How does AI detect posture?",
      answer: "We use advanced computer vision models that plot a real-time 3D skeleton over your body. The AI then calculates joint angles and positioning to evaluate your form against biomechanical baselines."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq" id="faq">
      <div className="container faq-container">
        <div className="section-title">
          <h2>Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p>Everything you need to know about Zenith Health and how it works.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item glass-card ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="faq-header">
                <h3>{faq.question}</h3>
                <ChevronDown 
                  className={`faq-icon ${activeIndex === index ? 'rotated' : ''}`} 
                  size={20} 
                />
              </div>
              <div className="faq-content">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
