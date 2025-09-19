import { forwardRef } from 'react'

/**
 * Clean, modern Input component inspired by Groww
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      required = false,
      disabled = false,
      className = '',
      prefix,
      suffix,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`
              w-full h-12 px-4 text-base text-gray-900 placeholder-gray-400 
              border border-gray-300 rounded-lg bg-white
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${
                prefix ? 'pl-10' : ''
              } ${
                suffix ? 'pr-10' : ''
              } ${
                error
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : ''
              }
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-red-600 mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
