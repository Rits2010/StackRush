import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Code,
  FileText
} from 'lucide-react';
import { ProfessionalCard } from './ui/ProfessionalCard';
import { ProfessionalButton } from './ui/ProfessionalButton';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface APIRequest {
  id: string;
  name: string;
  method: HTTPMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyType: 'json' | 'form' | 'raw' | 'none';
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  timing: {
    total: number;
    dns?: number;
    connect?: number;
    send?: number;
    wait?: number;
    receive?: number;
  };
  size: number;
}

export interface APITestHistory {
  id: string;
  request: APIRequest;
  response: APIResponse;
  timestamp: Date;
  success: boolean;
}

interface APITesterProps {
  baseUrl?: string;
  onRequestSent?: (request: APIRequest, response: APIResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

const methodColors: Record<HTTPMethod, string> = {
  GET: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  POST: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  PUT: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  DELETE: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  HEAD: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
  OPTIONS: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
};

export const APITester: React.FC<APITesterProps> = ({
  baseUrl = 'http://localhost:3001',
  onRequestSent,
  onError,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'history'>('request');
  const [currentRequest, setCurrentRequest] = useState<APIRequest>({
    id: crypto.randomUUID(),
    name: 'New Request',
    method: 'GET',
    url: '/api/test',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '',
    bodyType: 'json'
  });
  
  const [currentResponse, setCurrentResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<APITestHistory[]>([]);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved requests from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('api-test-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.warn('Failed to load API test history:', error);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('api-test-history', JSON.stringify(history));
  }, [history]);

  const sendRequest = async () => {
    if (isLoading) {
      // Cancel current request
      abortControllerRef.current?.abort();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setCurrentResponse(null);
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startTime = performance.now();

    try {
      const fullUrl = currentRequest.url.startsWith('http') 
        ? currentRequest.url 
        : `${baseUrl}${currentRequest.url}`;

      const requestOptions: RequestInit = {
        method: currentRequest.method,
        headers: currentRequest.headers,
        signal: controller.signal
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(currentRequest.method) && currentRequest.body) {
        if (currentRequest.bodyType === 'json') {
          try {
            JSON.parse(currentRequest.body); // Validate JSON
            requestOptions.body = currentRequest.body;
          } catch (error) {
            throw new Error('Invalid JSON in request body');
          }
        } else {
          requestOptions.body = currentRequest.body;
        }
      }

      const response = await fetch(fullUrl, requestOptions);
      const endTime = performance.now();

      // Parse response
      let responseBody: any;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          responseBody = await response.json();
        } catch (error) {
          responseBody = await response.text();
        }
      } else {
        responseBody = await response.text();
      }

      // Build response headers object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const apiResponse: APIResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        timing: {
          total: endTime - startTime
        },
        size: JSON.stringify(responseBody).length
      };

      setCurrentResponse(apiResponse);
      
      // Add to history
      const historyItem: APITestHistory = {
        id: crypto.randomUUID(),
        request: { ...currentRequest },
        response: apiResponse,
        timestamp: new Date(),
        success: response.ok
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 requests

      onRequestSent?.(currentRequest, apiResponse);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      onError?.(errorMessage);
      
      const errorResponse: APIResponse = {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: { error: errorMessage },
        timing: { total: performance.now() - startTime },
        size: 0
      };
      
      setCurrentResponse(errorResponse);

      // Add error to history
      const historyItem: APITestHistory = {
        id: crypto.randomUUID(),
        request: { ...currentRequest },
        response: errorResponse,
        timestamp: new Date(),
        success: false
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const updateRequest = (updates: Partial<APIRequest>) => {
    setCurrentRequest(prev => ({ ...prev, ...updates }));
  };

  const addHeader = () => {
    const key = prompt('Header name:');
    if (key) {
      const value = prompt('Header value:') || '';
      updateRequest({
        headers: { ...currentRequest.headers, [key]: value }
      });
    }
  };

  const removeHeader = (key: string) => {
    const { [key]: removed, ...rest } = currentRequest.headers;
    updateRequest({ headers: rest });
  };

  const loadFromHistory = (historyItem: APITestHistory) => {
    setCurrentRequest({ ...historyItem.request, id: crypto.randomUUID() });
    setCurrentResponse(historyItem.response);
    setActiveTab('request');
  };

  const clearHistory = () => {
    if (confirm('Clear all request history?')) {
      setHistory([]);
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'api-test-history.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatJSON = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return String(obj);
    }
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400';
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
    if (status >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <ProfessionalCard className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          API Tester
        </h3>
        
        <div className="flex items-center space-x-2">
          <ProfessionalButton
            variant="ghost"
            size="sm"
            onClick={exportHistory}
            icon={Download}
            title="Export History"
          />
          <ProfessionalButton
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            icon={Trash2}
            title="Clear History"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['request', 'response', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'request' && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Request Line */}
            <div className="flex items-center space-x-2">
              <select
                value={currentRequest.method}
                onChange={(e) => updateRequest({ method: e.target.value as HTTPMethod })}
                className={`px-3 py-2 rounded-md border text-sm font-medium ${methodColors[currentRequest.method]}`}
              >
                {Object.keys(methodColors).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              
              <input
                type="text"
                value={currentRequest.url}
                onChange={(e) => updateRequest({ url: e.target.value })}
                placeholder="/api/endpoint"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <ProfessionalButton
                onClick={sendRequest}
                disabled={!currentRequest.url}
                variant={isLoading ? 'secondary' : 'primary'}
                icon={isLoading ? XCircle : Send}
              >
                {isLoading ? 'Cancel' : 'Send'}
              </ProfessionalButton>
            </div>

            {/* Headers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Headers</h4>
                <ProfessionalButton
                  variant="ghost"
                  size="sm"
                  onClick={addHeader}
                  icon={Plus}
                >
                  Add Header
                </ProfessionalButton>
              </div>
              
              <div className="space-y-2">
                {Object.entries(currentRequest.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const { [key]: oldValue, ...rest } = currentRequest.headers;
                        updateRequest({ headers: { ...rest, [newKey]: value } });
                      }}
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Header name"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateRequest({
                        headers: { ...currentRequest.headers, [key]: e.target.value }
                      })}
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Header value"
                    />
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(key)}
                      icon={Trash2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(currentRequest.method) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Body</h4>
                  <select
                    value={currentRequest.bodyType}
                    onChange={(e) => updateRequest({ bodyType: e.target.value as any })}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="json">JSON</option>
                    <option value="form">Form Data</option>
                    <option value="raw">Raw</option>
                    <option value="none">None</option>
                  </select>
                </div>
                
                {currentRequest.bodyType !== 'none' && (
                  <textarea
                    value={currentRequest.body}
                    onChange={(e) => updateRequest({ body: e.target.value })}
                    placeholder={currentRequest.bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
                    className="w-full h-32 px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'response' && (
          <div className="h-full overflow-y-auto p-4">
            {currentResponse ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-lg font-bold ${getStatusColor(currentResponse.status)}`}>
                      {currentResponse.status} {currentResponse.statusText}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{currentResponse.timing.total.toFixed(2)}ms</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentResponse.size} bytes
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHeaders(!showHeaders)}
                      icon={showHeaders ? EyeOff : Eye}
                    >
                      Headers
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRawResponse(!showRawResponse)}
                      icon={showRawResponse ? FileText : Code}
                    >
                      {showRawResponse ? 'Formatted' : 'Raw'}
                    </ProfessionalButton>
                  </div>
                </div>

                {/* Headers */}
                {showHeaders && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Response Headers</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono">
                      {Object.entries(currentResponse.headers).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="text-blue-600 dark:text-blue-400 w-32 flex-shrink-0">{key}:</span>
                          <span className="text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Response Body</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
                    <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                      {showRawResponse 
                        ? JSON.stringify(currentResponse.body)
                        : formatJSON(currentResponse.body)
                      }
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Response Yet</p>
                  <p className="text-sm">Send a request to see the response here</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4">
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${methodColors[item.request.method]}`}>
                          {item.request.method}
                        </span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {item.request.url}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${getStatusColor(item.response.status)}`}>
                          {item.response.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{item.timestamp.toLocaleString()}</span>
                      <span>{item.response.timing.total.toFixed(2)}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No History</p>
                  <p className="text-sm">Your API requests will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProfessionalCard>
  );
};

export default APITester;