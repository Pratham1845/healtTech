import './Badge.css';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'badge-default',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
