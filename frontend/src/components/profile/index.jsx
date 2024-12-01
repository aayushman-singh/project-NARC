'use client'
import { SiInstagram, SiX, SiWhatsapp, SiTelegram } from "react-icons/si"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Calendar, Edit, Mail, User, Save, X } from 'lucide-react'
import { toast, Toaster } from "sonner"

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

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
        setEditName(response.data.name)
        setEditEmail(response.data.email)
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

  const handleUpdateUser = async () => {
    try {
      const userInfoString = localStorage.getItem('userInfo')
      const userInfo = JSON.parse(userInfoString)

      const response = await axios.put(
        'http://localhost:5001/api/users/userInfo', 
        { name: editName, email: editEmail },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        }
      )

      // Update user in state and local storage
      setUser(response.data)
      userInfo.name = response.data.name
      userInfo.email = response.data.email
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      // Update edit state
      setIsEditing(false)
      
      // Show success toast
      toast.success("Profile updated successfully!", {
        description: `Name: ${response.data.name}, Email: ${response.data.email}`
      })
    } catch (err) {
      // Show error toast
      toast.error("Failed to update profile", {
        description: err.response?.data?.message || err.message
      })
    }
  }

  const platformData = {
    Instagram: {
      icon: <SiInstagram className="text-pink-500 h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      textColor: "text-white",
    },
    X: {
      icon: <SiX className="text-blue-500 h-6 w-6" />,
      color: "bg-blue-500",
      textColor: "text-white",
    },
    WhatsApp: {
      icon: <SiWhatsapp className="text-green-500 h-6 w-6" />,
      color: "bg-green-500",
      textColor: "text-white",
    },
    Telegram: {
      icon: <SiTelegram className="text-blue-400 h-6 w-6" />,
      color: "bg-blue-400",
      textColor: "text-white",
    },
  }
  
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
      <Toaster richColors />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-0">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-blue-500">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    {user.name}
                  </h1>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-300 bg-slate-500 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </div>
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

        {/* Edit Profile Modal */}
        {isEditing && (
  <Dialog open={isEditing} onOpenChange={setIsEditing}>
    <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl rounded-xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
          Edit Profile
        </DialogTitle>
        <p className="text-sm text-slate-400">Update your personal information</p>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right text-slate-300 font-medium">Name</Label>
          <Input 
            id="name" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)} 
            className="col-span-3 bg-slate-700/50 border-slate-600/50 text-white focus:ring-2 focus:ring-teal-500 transition-all duration-300" 
            placeholder="Enter your full name"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right text-slate-300 font-medium">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={editEmail} 
            onChange={(e) => setEditEmail(e.target.value)} 
            className="col-span-3 bg-slate-700/50 border-slate-600/50 text-white focus:ring-2 focus:ring-teal-500 transition-all duration-300" 
            placeholder="Enter your email address"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          className="text-slate-300 hover:text-white hover:bg-slate-700 bg-slate-600 border-slate-600 transition-all duration-300"
        >
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button 
          onClick={handleUpdateUser}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all duration-300"
        >
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}


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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
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