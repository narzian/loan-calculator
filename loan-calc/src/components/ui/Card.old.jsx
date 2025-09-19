/**
 * Modern Card component with consistent styling
 */
const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  padding = true,
  shadow = true,
}) => {
  const baseClasses = `
    bg-white rounded-2xl border border-gray-200
    ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
    transition-shadow duration-200
  `

  const paddingClasses = padding ? 'p-6' : ''
  const finalClasses = `${baseClasses} ${paddingClasses} ${className}`.trim()

  return (
    <div className={finalClasses}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>}
            {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
          </div>
          {headerAction && <div className="ml-4 flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      {children}
    </div>
  )
}

export default Card
