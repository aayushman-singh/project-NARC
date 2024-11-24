"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DataAnalysisPage() {
  const [username, setUsername] = useState("");
  const [chartData, setChartData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/instagram/users");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const apiData = await response.json();
  
      const userData = apiData.find(
        (user) => user.username === username.trim()
      );
  
      if (userData && userData.profile.length > 0) {
        const profile = userData.profile[0];
        const posts = userData.posts || []; // Ensure posts is always an array
  
        // Calculate total likes, comments, and views
        const totalLikes = posts.reduce(
          (sum, post) => sum + (post.likesCount || 0),
          0
        );
        const totalComments = posts.reduce(
          (sum, post) => sum + (post.commentsCount || 0),
          0
        );
        const totalViews = posts.reduce(
          (sum, post) => sum + (post.videoViewCount || 0),
          0
        );
  
        // Chart Data
        const labels = [
          "Followers",
          "Following",
          "Total Likes",
          "Total Comments",
          "Total Views",
        ];
        const data = [
          profile.followersCount || 0,
          profile.followsCount || 0,
          totalLikes,
          totalComments,
          totalViews,
        ];
  
        setChartData({
          labels,
          datasets: [
            {
              label: `${userData.fullName || username}'s Data`,
              data,
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } else {
        alert("User not found or data is incomplete.");
        setChartData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Error fetching data: ${error.message}`);
    }
  };
  
  

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Instagram Data Analysis",
        color: "white",
      },
    },
    scales: {
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start p-4 space-y-8">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-100">
          Instagram Data Analysis
        </h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md transition duration-300 ${
                username.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              disabled={!username.trim()}
            >
              Analyze
            </button>
          </div>
        </form>
      </div>

      {chartData && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <Bar options={options} data={chartData} />
        </div>
      )}
    </div>
  );
}
