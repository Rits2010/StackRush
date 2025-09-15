import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Download, Eye, EyeOff } from 'lucide-react';

interface APITestModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: {
    title: string;
    apiEndpoint?: string;
    method?: string;
    samplePayload?: any;
    headers?: Record<string, string>;
  };
}

interface APIResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  responseTime: number;
}

export const APITestModal: React.FC<APITestModalProps> = ({ isOpen, onClose, challenge }) => {
  const [method, setMethod] = useState(challenge.method || 'GET');
  const [url, setUrl] = useState(challenge.apiEndpoint || '');
  const [headers, setHeaders] = useState(JSON.stringify(challenge.headers || {}, null, 2));
  const [payload, setPayload] = useState(JSON.stringify(challenge.samplePayload || {}, null, 2));
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  useEffect(() => {
    if (challenge.apiEndpoint) {
      setUrl(challenge.apiEndpoint);
    }
    if (challenge.method) {
      setMethod(challenge.method);
    }
    if (challenge.samplePayload) {
      setPayload(JSON.stringify(challenge.samplePayload, null, 2));
    }
    if (challenge.headers) {
      setHeaders(JSON.stringify(challenge.headers, null, 2));
    }
  }, [challenge]);

  const handleTest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Parse headers
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        console.warn('Invalid headers JSON, using empty headers');
      }

      // Parse payload for POST/PUT requests
      let parsedPayload = null;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          parsedPayload = JSON.parse(payload);
        } catch (e) {
          console.warn('Invalid payload JSON');
        }
      }

      // Simulate API call (in real implementation, this would be an actual fetch)
      const mockResponse = await simulateAPICall(method, url, parsedHeaders, parsedPayload);
      const responseTime = Date.now() - startTime;

      setResponse({
        ...mockResponse,
        responseTime
      });
    } catch (error) {
      setResponse({
        status: 500,
        statusText: 'Internal Server Error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        headers: {},
        responseTime: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateAPICall = async (method: string, url: string, headers: any, payload: any): Promise<Omit<APIResponse, 'responseTime'>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Mock different responses based on URL and method
    if (url.includes('/api/payments')) {
      if (method === 'POST') {
        return {
          status: 201,
          statusText: 'Created',
          data: {
            id: 'pay_' + Math.random().toString(36).substr(2, 9),
            amount: payload?.amount || 100,
            currency: payload?.currency || 'USD',
            status: 'completed',
            created_at: new Date().toISOString()
          },
          headers: { 'Content-Type': 'application/json' }
        };
      }
    } else if (url.includes('/api/users')) {
      if (method === 'GET') {
        return {
          status: 200,
          statusText: 'OK',
          data: {
            users: [
              { id: 1, name: 'John Doe', email: 'john@example.com' },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ]
          },
          headers: { 'Content-Type': 'application/json' }
        };
      }
    }

    // Default success response
    return {
      status: 200,
      statusText: 'OK',
      data: { message: 'API test successful', timestamp: new Date().toISOString() },
      headers: { 'Content-Type': 'application/json' }
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            API Testing - {challenge.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Request Panel */}
          <div className="w-1/2 p-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Request</h3>
            
            {/* Method and URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method & URL
              </label>
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                  placeholder="API endpoint (immutable)"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                * URL is pre-configured and cannot be modified
              </p>
            </div>

            {/* Headers */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Headers
                </label>
                <button
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showHeaders ? 'Hide' : 'Show'}
                </button>
              </div>
              {showHeaders && (
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Enter headers as JSON"
                />
              )}
            </div>

            {/* Payload */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Enter request body as JSON"
                />
              </div>
            )}

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Testing...' : 'Send Request'}
            </button>
          </div>

          {/* Response Panel */}
          <div className="w-1/2 p-4 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Response</h3>
            
            {response ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`font-mono ${getStatusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {response.responseTime}ms
                  </div>
                </div>

                {/* Response Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Response Body
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Copy response"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'api-response.json';
                          a.click();
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Download response"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono text-gray-900 dark:text-white">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>

                {/* Response Headers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Headers
                  </label>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono text-gray-900 dark:text-white">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                <p>Send a request to see the response</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};