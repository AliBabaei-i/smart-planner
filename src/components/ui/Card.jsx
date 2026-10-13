import React, { memo } from 'react'

const Card = memo(({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        transition-all hover:shadow-md
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = 'Card'

export default Card