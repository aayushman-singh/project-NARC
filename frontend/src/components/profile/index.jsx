'use client'

import React, { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, Mail, User } from 'lucide-react'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfoString = localStorage.getItem('userInfo')
        
        if (!userInfoString) {
          throw new Error("No user information found in local storage")
        }
        
        const userInfo = JSON.parse(userInfoString)

        if (!userInfo.token) {
          throw new Error("No authentication token found")
        }

        const response = await axios.get(`http://localhost:5001/api/users/`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        })

        setUser(response.data)
      } catch (err) {
        setError(
          err.response?.data?.message || 
          err.message || 
          "Failed to fetch user data"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])
  
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full bg-gray-700 mx-auto" />
        <Skeleton className="h-4 w-48 bg-gray-700 mx-auto" />
        <Skeleton className="h-4 w-32 bg-gray-700 mx-auto" />
      </div>
    </div>
  )
  
  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <Card className="max-w-md w-full bg-gray-800 text-white border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center text-red-500">
            <AlertCircle className="mr-2" />
            Profile Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-400">Please check your connection or try again later.</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-0">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-blue-500">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  {user.name}
                </h1>
                <p className="text-gray-400 mt-1">Joined on {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-2">
              <Mail className="text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="font-medium text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Account Type</p>
                <p className="font-medium text-white">{user.isAdmin ? "Administrator" : "Standard User"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="font-medium text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search History */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Search History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.searchHistory && user.searchHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Identifier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {user.searchHistory.map((history, index) => (
                      <tr key={index} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant="outline" className="bg-blue-900 text-blue-300 border-blue-500">
                            {history.platform}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{history.identifier}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(history.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-lg font-semibold text-gray-400">No search history available</p>
                <p className="text-sm text-gray-500">Your recent searches will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage

