import React from 'react';

const formatDate = (dateString) => {
  try {
    const date = new Date(Number(dateString)); // Convert timestamp to a valid date
    return date.toLocaleString();
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'Invalid Date';
  }
};

const Attachment = ({ attachment }) => (
  <div className="bg-gray-700 p-2 rounded-md text-white text-sm">
    <p>Filename: {attachment.filename}</p>
    <p>Type: {attachment.mimeType}</p>
    <p>Size: {attachment.size} bytes</p>
  </div>
);

const EmailDetails = ({ email }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mb-4">
    <h4 className="text-lg font-bold text-blue-400">{email.subject}</h4>
    <p className="text-gray-300">
      From: {email.from} | To: {email.to}
    </p>
    <p className="text-gray-400">Date: {formatDate(email.internalDate)}</p>
    <p className="text-gray-500 mt-2">{email.snippet}</p>
    {email.attachments && email.attachments.length > 0 && (
      <div className="mt-4">
        <h5 className="text-blue-400 font-semibold">Attachments:</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {email.attachments.map((attachment, index) => (
            <Attachment key={index} attachment={attachment} />
          ))}
        </div>
      </div>
    )}
  </div>
);

const GmailInUser = ({ user }) => (
  <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 rounded-xl shadow-lg border border-blue-700/30">
    <h3 className="text-xl font-bold text-white mb-4">{user.email}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {user.emails.map((email, index) => (
        <EmailDetails key={index} email={email} />
      ))}
    </div>
  </div>
);

const GmailInUsers = ({ users }) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return <p className="text-white">No email data available</p>;
  }

  return (
    <div className="space-y-6">
      {users.map((user, index) => (
        <GmailInUser key={index} user={user} />
      ))}
    </div>
  );
};

export default GmailInUsers;
