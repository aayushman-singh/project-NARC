'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Twitter, MessageCircle, Phone } from 'lucide-react'

// Import the platform-specific components
import InstagramSection from './InstagramSection'
import WhatsAppSection from './WhatsAppSection'
import TelegramSection from './TelegramSection'
import TwitterSection from './TwitterSection'
import FacebookSection from './FacebookSection'

const platforms = [
  { name: "Instagram", icon: Instagram, activeColor: "text-pink-500", inactiveColor: "text-gray-400" },
  { name: "Facebook", icon: Facebook, activeColor: "text-blue-600", inactiveColor: "text-gray-400" },
  { name: "X", icon: Twitter, activeColor: "text-blue-500", inactiveColor: "text-gray-400" },
  { name: "Telegram", icon: MessageCircle, activeColor: "text-blue-400", inactiveColor: "text-gray-400" },
  { name: "WhatsApp", icon: Phone, activeColor: "text-green-500", inactiveColor: "text-gray-400" },
]

export default function SocialMediaDataDisplay() {
  const [activeSection, setActiveSection] = useState("Instagram")

  const handleSectionClick = (platform) => {
    setActiveSection(platform)
  }

  // Map of sections to components
  const sections = {
    Instagram: <InstagramSection />,
    WhatsApp: <WhatsAppSection />,
    Telegram: <TelegramSection />,
    X: <TwitterSection />,
    Facebook: <FacebookSection />,
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in-down">
          Social Media Data
        </h1>
        <p className="text-xl text-gray-200 animate-fade-in-up">
          Explore user data from various platforms
        </p>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              variant="ghost"
              className={`flex items-center space-x-2 ${
                activeSection === platform.name ? platform.activeColor : platform.inactiveColor
              }`}
              onClick={() => handleSectionClick(platform.name)}
            >
              <platform.icon className={`w-6 h-6 ${activeSection === platform.name ? platform.activeColor : "text-gray-400"}`} />
              <span className="text-lg">{platform.name}</span>
            </Button>
          ))}
        </div>

        <div className="bg-gray-800 text-gray-100 rounded-lg p-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">{activeSection} Data</h2>

          {/* Render the component based on the active section */}
          {sections[activeSection]}
        </div>
      </main>
    </div>
  )
}
