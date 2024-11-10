import React, { useState } from 'react'
import { Search } from 'lucide-react'

const SearchPage = () => {
  const [username, setUsername] = useState('')
  const [urls, setUrls] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUrls(null)

    try {
      const response = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`)
      }

      const data = await response.json()
      const rawOutput = data.rawOutput
      console.log(rawOutput) // Log to verify the structure of rawOutput

      // Extract URLs from the rawOutput string
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const extractedUrls = rawOutput.match(urlRegex)

      // If URLs were found, set them in state; otherwise, handle as no URLs found
      if (extractedUrls && extractedUrls.length > 0) {
        setUrls(extractedUrls)
      } else {
        throw new Error('No URLs found for the given username.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Maigret Search
      </h1>

      <form
        onSubmit={handleSearch}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700"
      >
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            required
            className="w-full p-4 pl-12 mb-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300 placeholder-gray-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="mt-8 w-full max-w-2xl">
        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <p className="text-center text-red-500 bg-red-100 border border-red-400 rounded-md p-4">
            Error: {error}
          </p>
        )}
        {urls && urls.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-blue-400">Results for {username}:</h3>
            <ul className="space-y-4">
              {urls.map((url, index) => (
                <li
                  key={index}
                  className="bg-gray-700 p-4 rounded-md transition duration-300 ease-in-out hover:bg-gray-600"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <span className="mr-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="truncate">{url}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {urls && urls.length === 0 && (
          <p className="text-center text-gray-400 bg-gray-800 p-4 rounded-md border border-gray-700">
            No URLs found for the given username.
          </p>
        )}
      </div>
    </div>
  )
}

export default SearchPage
