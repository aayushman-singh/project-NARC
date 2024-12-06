import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const GoogleDriveFileExplorer = () => {
  const [authUrl, setAuthUrl] = useState(null);
  const [error, setError] = useState(null);

  // Fetch the Google OAuth URL
  const fetchAuthUrl = async () => {
    try {
      const response = await axios.get("http://localhost:3006/");
      setAuthUrl(response.data.authUrl);  // Store the auth URL
    } catch (err) {
      console.error("Error fetching auth URL:", err);
      setError("Failed to fetch authentication URL.");
    }
  };

  useEffect(() => {
    // Fetch the auth URL when the component mounts
    fetchAuthUrl();
  }, []);

  // Redirect to the Google authentication page
  const handleRedirect = () => {
    if (authUrl) {
      window.location.href = authUrl;  // Redirect the user to the Google auth URL
    } else {
      console.error("Auth URL is not available.");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Google Drive File Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        {!authUrl ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p>Loading authentication URL...</p>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Button onClick={handleRedirect}>Authenticate with Google</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleDriveFileExplorer;
