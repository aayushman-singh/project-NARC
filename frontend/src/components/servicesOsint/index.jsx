import React, { useState } from "react"
import { Search, CheckCircle, ExternalLink } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const SearchPage = () => {
  const [username, setUsername] = useState("")
  const [urls, setUrls] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUrls(null)

    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(data)

      let extractedUrls = []

      if (Array.isArray(data.urls)) {
        extractedUrls = data.urls
      } else if (typeof data.rawOutput === "string") {
        const urlRegex = /(https?:\/\/[^\s]+)/g
        extractedUrls = data.rawOutput.match(urlRegex) || []
      } else {
        throw new Error("No URLs found for the given username.")
      }

      setUrls(extractedUrls)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 ">
          Maigret Search
        </h1>
        
        <div className="mb-12 text-center">
          <p className="text-xl text-gray-300 mb-4">
            Uncover digital footprints across the web with Maigret Search, your go-to OSINT tool for comprehensive profile discovery.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            {["500+ websites", "Fast & Efficient", "Detailed Profiles", "Ethical OSINT"].map((feature, index) => (
              <span key={index} className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                <CheckCircle className="mr-1 text-green-500" size={16} />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-800 p-8 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-50">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Start Your Search</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                required
                className="pl-10 bg-gray-700 text-white border-gray-600 focus:border-blue-500 w-full py-3"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              {loading ? "Searching..." : "Unveil Digital Presence"}
            </Button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center items-center my-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-900 border border-red-700 rounded-lg p-4 text-center text-red-300 animate-pulse">
            Error: {error}
          </div>
        )}

        {urls && (
          <div className="mb-12 bg-gray-800 p-8 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-50">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Results for {username}</h2>
            {urls.length > 0 ? (
              <ul className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                {urls.map((url, index) => (
                  <li
                    key={index}
                    className="bg-gray-700 p-4 rounded-md transition duration-300 ease-in-out hover:bg-gray-600 flex items-center"
                  >
                    <span className="mr-3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex-grow truncate"
                    >
                      {url}
                    </a>
                    <ExternalLink className="ml-2 text-gray-400" size={16} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400">
                No URLs found for the given username.
              </p>
            )}
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          <p>Maigret Search respects privacy and adheres to ethical OSINT practices.</p>
          <p>Use responsibly and in compliance with applicable laws and regulations.</p>
        </div>
      </div>
    </div>
  )
}

export default SearchPage