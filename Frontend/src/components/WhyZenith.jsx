import { Webcam, Brain, Coins } from 'lucide-react';
import './WhyZenith.css';

const WhyZenith = () => {
  const reasons = [
    {
      icon: <Webcam size={40} />,
      title: 'No Wearables Needed',
      description: 'Forget expensive smartwatches and uncomfortable straps. Your device\'s camera is the only hardware you need.'
    },
    {
      icon: <Brain size={40} />,
      title: 'AI Personal Trainer + Coach',
      description: 'Get actionable insights on your form, posture, and mood in real-time, just like having a professional by your side.'
    },
    {
      icon: <Coins size={40} />,
      title: 'Accessible Preventive Care',
      description: 'Democratizing access to high-end movement analysis and wellness monitoring directly from your personal device.'
    }
  ];

  return (
    <section className="why-zenith" id="why-zenith">
      <div className="container">
        <div className="section-title">
          <h2>Why Choose <span className="text-gradient">Zenith Health</span></h2>
          <p>The smartest, most accessible way to monitor and improve your physical and mental wellbeing.</p>
        </div>

        <div className="reasons-grid">
          {reasons.map((reason, index) => (
            <div key={index} className="reason-card glass-card">
              <div className="reason-icon">
                {reason.icon}
              </div>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyZenith;
