import { forwardRef } from 'react'

/**
 * Clean, modern Card component inspired by Groww
 */
const Card = forwardRef(
  (
    {
      title,
      subtitle,
      children,
      className = '',
      headerAction,
      ...props
    },
    ref
  ) => {
    return (
      <div 
        ref={ref} 
        className={`
          bg-white rounded-lg border border-gray-200 p-6 shadow-sm
          ${className}
        `} 
        {...props}
      >
        {/* Card Header */}
        {(title || subtitle || headerAction) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        {/* Card Content */}
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card