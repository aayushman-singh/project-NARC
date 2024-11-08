import React, { useState } from "react";

const SearchPage = () => {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Maigret Search</h1>

      <form
        onSubmit={handleSearch}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a username"
          required
          className="w-full p-3 mb-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          Search
        </button>
      </form>

      <div className="mt-6 w-full max-w-md">
        {loading && <p className="text-center text-gray-400">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {results && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
            <h3 className="text-xl font-bold mb-4 text-blue-500">
              Results for {username}:
            </h3>
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li key={index} className="bg-gray-700 p-3 rounded-md">
                  <span className="font-semibold">{result.site_name}:</span>{" "}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {result.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
