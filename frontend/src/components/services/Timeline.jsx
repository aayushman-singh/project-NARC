import React, { useState } from "react";
import { X, User, MapPin } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TimelineDataViewer({ timelineData }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!timelineData) {
    return <div className="text-gray-400">No timeline data available</div>;
  }

  const timelines = [
    timelineData.timeline,
    timelineData.timeline_1,
    timelineData.timeline_2,
    timelineData.timeline_3,
    timelineData.timeline_4,
    timelineData.timeline_5,
    timelineData.timeline_6,
    timelineData.timeline_7,
    timelineData.timeline_8,
    timelineData.timeline_9,
    timelineData.timeline_10
  ].filter(Boolean);
  
  const openImageViewer = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeImageViewer = (e) => {
    if (e) e.stopPropagation();
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = timelines.length - 1;
    if (newIndex >= timelines.length) newIndex = 0;
    setCurrentImageIndex(newIndex);
    setSelectedImage(timelines[newIndex]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-xl shadow-lg border border-blue-700/20">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-blue-600">
              <User className="w-8 h-8 text-white" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-white">{timelineData.username}</h2>
            <div className="flex items-center text-blue-400 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Timeline Data ({timelines.length} entries)</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {timelines.map((item, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg overflow-hidden cursor-pointer bg-gray-700/50"
                  onClick={() => openImageViewer(item, index)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={item}
                      alt={`Timeline ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-end p-3">
                      <span className="text-white text-sm font-medium">Click to View Full</span>
                      <span className="text-blue-300 text-xs mt-1">Timeline Entry {index + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={closeImageViewer}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt={`Timeline ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeImageViewer}
              className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4">
              <button
                onClick={() => navigateImage(-1)}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
              >
                ←
              </button>
              <span className="text-white">
                Timeline Entry {currentImageIndex + 1} of {timelines.length}
              </span>
              <button
                onClick={() => navigateImage(1)}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}