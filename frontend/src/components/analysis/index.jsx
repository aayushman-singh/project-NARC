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
import { 
  Instagram, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle 
} from "lucide-react";

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
  const [userDetails, setUserDetails] = useState(null);

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
        const posts = userData.posts || [];
  
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

        // Set user details
        setUserDetails({
          fullName: userData.fullName,
          username: userData.username,
          profilePic: profile.profilePicUrl,
          postsCount: posts.length,
          avgLikesPerPost: (totalLikes / posts.length).toFixed(2),
          avgCommentsPerPost: (totalComments / posts.length).toFixed(2)
        });
      } else {
        alert("User not found or data is incomplete.");
        setChartData(null);
        setUserDetails(null);
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
        labels: {
          color: "white",
        }
      },
      title: {
        display: true,
        text: "User Instagram Performance Breakdown",
        color: "white",
        font: {
          size: 18,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      }
    },
    scales: {
      y: {
        ticks: { 
          color: "white",
          beginAtZero: true,
        },
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
      },
      x: {
        ticks: { color: "white" },
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gradient-to-br from-gray-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <Instagram className="w-12 h-12 text-pink-500 mr-4" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Instagram Analytics
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Instagram username"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 transition-all duration-300"
              />
              <button
                type="submit"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-md transition duration-300 ${
                  username.trim()
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!username.trim()}
              >
                Analyze
              </button>
            </div>
          </form>
        </div>

        {chartData && userDetails && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-slate-900 rounded-2xl shadow-2xl p-6">
              <Bar options={options} data={chartData} />
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-slate-900 rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center space-x-4 border-b border-slate-700 pb-4">
                <img 
                  src={userDetails.profilePic} 
                  alt={userDetails.fullName} 
                  className="w-20 h-20 rounded-full border-4 border-purple-500"
                />
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    {userDetails.fullName}
                  </h2>
                  <p className="text-gray-400">@{userDetails.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-slate-700/50 p-3 rounded-lg">
                  <Users className="text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-400">Total Posts</p>
                    <p className="font-bold">{userDetails.postsCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-700/50 p-3 rounded-lg">
                  <Heart className="text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Likes/Post</p>
                    <p className="font-bold">{userDetails.avgLikesPerPost}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-700/50 p-3 rounded-lg">
                  <MessageCircle className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Comments/Post</p>
                    <p className="font-bold">{userDetails.avgCommentsPerPost}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-700/50 p-3 rounded-lg">
                  <TrendingUp className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Engagement Rate</p>
                    <p className="font-bold">
                      {((parseFloat(userDetails.avgLikesPerPost) / 100) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}