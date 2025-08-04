'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<{ document_id?: string; error?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResponse(null);
    } else {
      setFile(null);
      setResponse({ error: 'Please select a valid PDF file' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: 'Error uploading file' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            PDF Security Scanner
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Upload your PDF documents to scan for sensitive information
          </p>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select PDF File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PDF files only
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="text-sm text-gray-300">
                Selected file: {file.name}
              </div>
            )}

            {response?.error && (
              <div className="text-sm text-red-400">
                {response.error}
              </div>
            )}

            {response?.document_id && (
              <div className="text-sm text-green-400">
                File uploaded successfully! Document ID: {response.document_id}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !file || uploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
