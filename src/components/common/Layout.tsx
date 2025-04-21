import React, { ReactNode } from 'react'

interface LayoutProps { children: ReactNode }

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="layout">
    {children}
  </div>
)

export default Layout
