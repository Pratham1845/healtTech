import './SectionHeader.css';

const SectionHeader = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`section-header ${className}`}>
      <h2 className="section-title-main">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
