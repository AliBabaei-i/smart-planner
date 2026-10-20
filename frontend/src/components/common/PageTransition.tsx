import React, { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition       