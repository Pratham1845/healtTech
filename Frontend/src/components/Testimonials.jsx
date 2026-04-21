import { Star } from 'lucide-react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Looks like the future of fitness. The real-time posture correction completely changed how I work at my desk.",
      author: "Sarah J.",
      role: "Software Engineer"
    },
    {
      quote: "Best AI trainer I've used. It caught form mistakes during my squats that I've been making for years.",
      author: "Michael T.",
      role: "Fitness Enthusiast"
    },
    {
      quote: "Simple, smart, and effective. The mood detection feature is surprisingly accurate and helps me manage my stress.",
      author: "Elena R.",
      role: "Product Manager"
    }
  ];

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-title">
          <h2>User <span className="text-gradient">Success Stories</span></h2>
          <p>Join thousands of users who have transformed their health with Zenith.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((test, index) => (
            <div key={index} className="testimonial-card glass-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="quote">"{test.quote}"</p>
              <div className="author-info">
                <div className="author-avatar">
                  {test.author.charAt(0)}
                </div>
                <div>
                  <h4>{test.author}</h4>
                  <span>{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
