import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ icon: Icon, label, value, trend, trendType, className = '' }) => {
  return (
    <div className={`stat-card glass-card ${className}`}>
      <div className="stat-card-header">
        {Icon && <div className="stat-icon"><Icon size={20} /></div>}
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`stat-trend ${trendType || 'positive'}`}>
          {trendType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
