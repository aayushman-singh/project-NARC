import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';

const GoogleSection = ({ activeSection, isLoading, handleSubmit, handleShowDetails }) => {
  const [googleSearchData, setGoogleSearchData] = useState(null);
  const [youtubeHistoryData, setYoutubeHistoryData] = useState(null);
  const [showGoogleSearchDetails, setShowGoogleSearchDetails] = useState(false);
  const [showYoutubeHistoryDetails, setShowYoutubeHistoryDetails] = useState(false);
  const [googleSearchDateRange, setGoogleSearchDateRange] = useState({ from: null, to: null });
  const [youtubeHistoryDateRange, setYoutubeHistoryDateRange] = useState({ from: null, to: null });

  if (activeSection !== "google") return null;
  

  const renderDatePicker = (section, range, setRange) => (
    <div className="flex space-x-4 mt-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range.from ? format(range.from, "dd-MM-yyyy") : <span>From Date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={range.from}
            onSelect={(date) => setRange({ ...range, from: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range.to ? format(range.to, "dd-MM-yyyy") : <span>To Date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={range.to}
            onSelect={(date) => setRange({ ...range, to: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">Google</h2>
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Google Search</TabsTrigger>
          <TabsTrigger value="youtube">YouTube History</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter Google account email"
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {renderDatePicker("googleSearch", googleSearchDateRange, setGoogleSearchDateRange)}
            <div className="flex space-x-4 mt-4">
              <Button
                onClick={() => handleSubmit("googleSearch")}
                className="bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                Submit
              </Button>
              <Button
                onClick={() => setShowGoogleSearchDetails(!showGoogleSearchDetails)}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Show Details
              </Button>
            </div>
            {googleSearchData && showGoogleSearchDetails && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">Google Search History</h3>
                {/* Add Google Search history display component here */}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="youtube">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter YouTube account email"
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {renderDatePicker("youtubeHistory", youtubeHistoryDateRange, setYoutubeHistoryDateRange)}
            <div className="flex space-x-4 mt-4">
              <Button
                onClick={() => handleSubmit("youtubeHistory")}
                className="bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                Submit
              </Button>
              <Button
                onClick={() => setShowYoutubeHistoryDetails(!showYoutubeHistoryDetails)}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Show Details
              </Button>
            </div>
            {youtubeHistoryData && showYoutubeHistoryDetails && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">YouTube History</h3>
                {/* Add YouTube history display component here */}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleSection;

