const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-3 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card;