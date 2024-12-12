import React, { useState } from 'react';
import axios from 'axios';

const UserActivity = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentLogs, setCurrentLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const handleFileSelect = (event) => {
        clearMessages();
        const files = Array.from(event.target.files);
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const sortLogs = (logs, order) => {
        return [...logs].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select files to upload');
            return;
        }

        clearMessages();
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            setLoading(true);

            const response = await axios.post(
                'http://localhost:5002/api/upload/text',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    },
                }
            );

            setSuccess(`Successfully uploaded ${response.data.count} log entries`);
            setSelectedFiles([]);
            setCurrentLogs(sortLogs(response.data.logs, sortOrder));

        } catch (error) {
            console.error('Upload failed:', error);
            setError(error.response?.data?.error || error.message || 'Failed to upload files');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const toggleSort = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        setCurrentLogs(prev => sortLogs(prev, newOrder));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Upload and View Logs</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="mb-6">
                <div className="p-4 border rounded-lg bg-white shadow">
                    <h2 className="text-lg font-semibold mb-2">Upload Text Logs</h2>
                    <input
                        type="file"
                        multiple
                        accept=".txt"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={loading}
                    />
                    
                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-2">Selected Files: {selectedFiles.length}</h3>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm truncate">{file.name}</span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700 text-sm ml-2"
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                            >
                                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Loading... {uploadProgress > 0 && `${uploadProgress}%`}</span>
                </div>
            )}

            {currentLogs.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Current Upload ({currentLogs.length} entries)</h3>
                        <button
                            onClick={toggleSort}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
                        >
                            <span>Sort {sortOrder === 'asc' ? '↑' : '↓'}</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Platform
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Source
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.platform}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {log.activity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.source}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserActivity;