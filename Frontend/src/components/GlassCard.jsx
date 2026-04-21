import './GlassCard.css';

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div 
      className={`glass-card ${hover ? 'hover-lift' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
