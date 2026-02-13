import React from 'react'
import { assets, footer_data } from '../assets/assets' // adjust path

const Footer = () => {
  return (
    <footer className="bg-primary/10 px-6 md:px-16 lg:px-24 xl:px-32 py-12">
      {/* Logo and description */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10">
        <div className="max-w-[400px]">
          <img src={assets.logo} alt="logo" className="w-32 sm:w-44 mb-6" />
          <p className="text-gray-700 text-sm sm:text-base">
            QuickBlog is a platform where knowledge meets creativity. Explore insightful articles, 
            trending topics, and expert opinions.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap gap-10 md:gap-20">
          {footer_data.map((section, index) => (
            <div key={index} className="min-w-[120px]">
              <h3 className="font-semibold text-gray-900 text-base mb-4">{section.title}</h3>
              <ul className="flex flex-col gap-2 text-gray-600 text-sm">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm md:text-base">
        © 2025 QuickBlog GreatStack - All Rights Reserved.
      </div>
    </footer>
  )
}

export default Footer
