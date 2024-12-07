import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { ChevronDown, ChevronUp, ExternalLink, Mail, X, User } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'Invalid Date';
  }
};

const EmailCard = ({ email, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/40 hover:border-blue-500/50 transition-all duration-300 ease-in-out cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-lg font-semibold truncate">
            {email.subject}
          </h4>
          <p className="text-blue-400 text-sm">
            {email.from}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {formatDate(email.timestamp)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
        >
          <Mail className="w-4 h-4" />
          <span>View Email</span>
        </button>
      </div>
    </div>
  );
};

const EmailViewer = ({ email, onClose }) => {
  const sanitizedBody = DOMPurify.sanitize(email.body);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-lg relative max-w-4xl w-full text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          aria-label="Close viewer"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <h3 className="text-2xl font-bold mb-4">{email.subject}</h3>
        <div className="space-y-2 mb-4">
          <p className="text-sm flex items-center space-x-2">
            <span className="font-semibold text-blue-400">From:</span>
            <span>{email.from}</span>
          </p>
          <p className="text-sm flex items-center space-x-2">
            <span className="font-semibold text-blue-400">Date:</span>
            <span>{formatDate(email.timestamp)}</span>
          </p>
        </div>
        <ScrollArea className="h-[60vh] mt-4">
          <div 
            className="email-body text-sm space-y-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </ScrollArea>
      </div>
    </div>
  );
};

const GmailUserEmails = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const toggleEmails = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 rounded-xl shadow-lg border border-blue-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Avatar>
            <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.email}`} alt={user.email} />
          </Avatar>
          <h3 className="text-xl font-bold text-white">{user.email}</h3>
        </div>
        <button
          onClick={toggleEmails}
          className="text-blue-400 hover:text-blue-300 flex items-center space-x-2 transition-colors duration-200"
        >
          <span>{isExpanded ? "Hide Emails" : "Show Emails"}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {user.emails.map((email, index) => (
              <EmailCard 
                key={index} 
                email={email} 
                onClick={() => setSelectedEmail(email)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {selectedEmail && (
        <EmailViewer
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
};

const GmailUsers = ({ users }) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return <p className="text-white">No email data available</p>;
  }

  return (
    <div className="space-y-6">
      {users.map((user, index) => (
        <GmailUserEmails key={index} user={user} />
      ))}
    </div>
  );
};

export default GmailUsers;

