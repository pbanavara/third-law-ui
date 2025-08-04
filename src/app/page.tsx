'use client';

import { useState } from 'react';

interface Finding {
  type: string;
  value?: string;
  location?: number;
  confidence?: number;
  context?: string;
  matched_text?: string;
  category?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface AnalysisStatistics {
  total_chars_processed: number;
  handlers_used: number;
  total_findings: number;
  findings_by_type: Record<string, number>;
}

interface Analysis {
  success: boolean;
  findings: Finding[];
  statistics: AnalysisStatistics;
}

interface ApiResponse {
  status: 'success' | 'error';
  document_id?: string;
  message?: string;
  api_version?: string;
  analysis?: Analysis;
  error?: string;
}

interface ProcessedFile {
  id: string;
  name: string;
  timestamp: string;
  status: 'success' | 'error';
  findings: number;
  documentId?: string;
}

function SeverityBadge({ severity }: { severity?: string }) {
  const colors = {
    LOW: 'bg-blue-500/20 text-blue-300 border-blue-500',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
    HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500',
    CRITICAL: 'bg-red-500/20 text-red-300 border-red-500',
  };

  if (!severity) return null;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[severity as keyof typeof colors]}`}>
      {severity}
    </span>
  );
}

function FindingsList({ findings }: { findings: Finding[] }) {
  if (!findings || findings.length === 0) {
    return (
      <div className="text-gray-400 italic">
        No sensitive information detected
      </div>
    );
  }

  const hasSensitiveInfo = findings.length > 0;

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${hasSensitiveInfo ? 'bg-red-900/20 border border-red-500/50' : 'bg-green-900/20 border border-green-500/50'}`}>
        <p className={`text-lg font-medium ${hasSensitiveInfo ? 'text-red-400' : 'text-green-400'}`}>
          {hasSensitiveInfo 
            ? '⚠️ This document contains sensitive information'
            : '✓ No sensitive information detected'}
        </p>
        {hasSensitiveInfo && (
          <p className="text-gray-300 mt-2">
            Here are the findings:
          </p>
        )}
      </div>

      <div className="space-y-3">
        {findings.map((finding, index) => (
          <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 font-medium capitalize">
                  {finding.type.toLowerCase().replace(/_/g, ' ')}:
                </span>
                <span className="text-white font-mono">
                  {finding.value}
                </span>
              </div>
              {finding.location !== undefined && (
                <span className="text-gray-400 text-sm">
                  Line {finding.location}
                </span>
              )}
            </div>

            {finding.context && (
              <div className="mt-2 text-sm">
                <span className="text-gray-400">Context: </span>
                <span className="text-gray-300">{finding.context}</span>
              </div>
            )}

            {finding.confidence !== undefined && (
              <div className="mt-1 text-sm text-gray-400">
                Confidence: {(finding.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {findings.length > 0 && (
        <div className="text-sm text-gray-400 bg-gray-800/30 rounded-lg p-4">
          <div className="font-medium mb-2">Summary:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Total findings: {findings.length}</li>
            <li>Types of sensitive data found:
              <span className="ml-2 text-gray-300">
                {Object.entries(findings.reduce((acc, finding) => {
                  acc[finding.type] = (acc[finding.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>))
                  .map(([type, count]) => `${type.toLowerCase()} (${count})`)
                  .join(', ')}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function ResponseDisplay({ response }: { response: ApiResponse }) {
  if (response.status === 'error') {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded-md p-4 mt-4">
        <h3 className="text-red-400 font-semibold mb-2">Error</h3>
        <p className="text-red-300">{response.error || response.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-md p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
          <h3 className="text-green-400 font-semibold">Success</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Document ID</p>
            <p className="text-white font-mono">{response.document_id}</p>
          </div>
          <div>
            <p className="text-gray-400">API Version</p>
            <p className="text-white">{response.api_version}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-400 mb-1">Message</p>
          <p className="text-white">{response.message}</p>
        </div>

        {response.analysis && (
          <div className="border-t border-gray-600 pt-4 mt-4">
            <h4 className="text-gray-300 font-semibold mb-3">Analysis Results</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Characters Processed</p>
                  <p className="text-white">{response.analysis.statistics.total_chars_processed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Handlers Used</p>
                  <p className="text-white">{response.analysis.statistics.handlers_used}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400">Total Findings</p>
                <p className="text-white">{response.analysis.statistics.total_findings}</p>
              </div>

              <div>
                <h5 className="text-gray-300 font-medium mb-3">Findings</h5>
                <FindingsList findings={response.analysis.findings} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProcessedFilesTable({ 
  files, 
  onSelectFile 
}: { 
  files: ProcessedFile[];
  onSelectFile: (file: ProcessedFile) => void;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Processed Files</h2>
        <span className="text-sm text-gray-400">
          Total: {files.length}
        </span>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No files processed yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">File Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Findings</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr 
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-white">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {new Date(file.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      file.status === 'success' 
                        ? 'bg-green-100/10 text-green-400' 
                        : 'bg-red-100/10 text-red-400'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {file.findings > 0 ? (
                      <span className="text-red-400">{file.findings} found</span>
                    ) : (
                      <span className="text-green-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UploadSection({
  onFileProcessed
}: {
  onFileProcessed: (fileInfo: ProcessedFile) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResponse(null);
    } else {
      setFile(null);
      setResponse({
        status: 'error',
        error: 'Please select a valid PDF file'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResponse(data);

      // Create processed file entry
      const fileInfo: ProcessedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        timestamp: new Date().toISOString(),
        status: data.status,
        findings: data.analysis?.statistics?.total_findings || 0,
        documentId: data.document_id
      };
      onFileProcessed(fileInfo);

    } catch (error) {
      setResponse({
        status: 'error',
        error: error instanceof Error ? error.message : 'Error uploading file'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 h-full">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select PDF File
          </label>
          <div className="flex flex-col space-y-3">
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-gray-500 transition-colors">
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

            {file && (
              <div className="text-sm text-gray-300 px-1">
                Selected file: {file.name}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !file || uploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        </div>

        {response && <ResponseDisplay response={response} />}
      </div>
    </div>
  );
}

export default function Home() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);

  const handleFileProcessed = (fileInfo: ProcessedFile) => {
    setProcessedFiles(prev => [fileInfo, ...prev]);
    setSelectedFile(fileInfo);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            PDF Security Scanner
          </h1>
          <p className="text-xl text-gray-300">
            Upload your PDF documents to scan for sensitive information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <UploadSection onFileProcessed={handleFileProcessed} />
          </div>
          <div>
            <ProcessedFilesTable 
              files={processedFiles} 
              onSelectFile={setSelectedFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
