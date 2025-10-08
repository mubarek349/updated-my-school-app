/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ZoomRedirectClient() {
  const searchParams = useSearchParams();
  const url = searchParams?.get('url') || '';
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');

  // Function to convert zoommtg:// to web URL
  const convertToWebUrl = (url: string): string => {
    if (url.startsWith('zoommtg://')) {
      // Extract meeting ID and password from zoommtg:// URL
      const meetingIdMatch = url.match(/zoommtg:\/\/.*?\/j\/(\d+)/);
      const passwordMatch = url.match(/pwd=([^&]+)/);
      
      if (meetingIdMatch) {
        const meetingId = meetingIdMatch[1];
        const password = passwordMatch ? passwordMatch[1] : '';
        return `https://zoom.us/j/${meetingId}${password ? `?pwd=${password}` : ''}`;
      }
    }
    return url;
  };

  useEffect(() => {
    if (!url) return;

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    setZoomUrl(decodedUrl);
    
    // Convert to web URL
    const convertedUrl = convertToWebUrl(decodedUrl);
    setWebUrl(convertedUrl);
    
    try {
      // Check if it's a valid Zoom URL
      if (decodedUrl.includes('zoom.us') || decodedUrl.includes('zoommtg://')) {
        setStatus('redirecting');
        
        // Try multiple approaches to open Zoom
        setTimeout(() => {
          try {
            // Method 1: Try to open Zoom Workspace app first (for mobile)
            if (decodedUrl.startsWith('zoommtg://')) {
              // Try to open the original zoommtg:// URL first
              const appWindow = window.open(decodedUrl, '_self');
              
              // If that doesn't work, try opening in new tab
              setTimeout(() => {
                if (!appWindow || appWindow.closed) {
                  const newWindow = window.open(convertedUrl, '_blank', 'noopener,noreferrer');
                  if (!newWindow) {
                    // Fallback: redirect current window
                    window.location.href = convertedUrl;
                  }
                }
                setStatus('success');
              }, 1000);
            } else {
              // For web URLs, try to detect if we're in a mobile environment
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              if (isMobile) {
                // On mobile, try to open Zoom app first
                const appUrl = decodedUrl.replace('https://zoom.us/j/', 'zoommtg://zoom.us/j/');
                const appWindow = window.open(appUrl, '_self');
                
                setTimeout(() => {
                  if (!appWindow || appWindow.closed) {
                    // Fallback to web version
                    const newWindow = window.open(convertedUrl, '_blank', 'noopener,noreferrer');
                    if (!newWindow) {
                      window.location.href = convertedUrl;
                    }
                  }
                  setStatus('success');
                }, 1000);
              } else {
                // On desktop, open web version directly
                const newWindow = window.open(convertedUrl, '_blank', 'noopener,noreferrer');
                if (!newWindow) {
                  window.location.href = convertedUrl;
                }
                setStatus('success');
              }
            }
          } catch (error) {
            console.error('Error opening Zoom link:', error);
            setStatus('error');
            setErrorMessage('Unable to open Zoom link. Please try manual join.');
          }
        }, 500);
      } else {
        throw new Error('Invalid Zoom URL');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Invalid Zoom link provided');
    }
  }, [url]);

  const handleRetry = () => {
    if (webUrl) {
      setStatus('redirecting');
      
      try {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && zoomUrl) {
          // Try to open Zoom app first on mobile
          const appUrl = zoomUrl.startsWith('zoommtg://') ? zoomUrl : zoomUrl.replace('https://zoom.us/j/', 'zoommtg://zoom.us/j/');
          const appWindow = window.open(appUrl, '_self');
          
          setTimeout(() => {
            if (!appWindow || appWindow.closed) {
              // Fallback to web version
              const newWindow = window.open(webUrl, '_blank', 'noopener,noreferrer');
              if (!newWindow) {
                window.location.href = webUrl;
              }
            }
            setStatus('success');
          }, 1000);
        } else {
          // Desktop or web fallback
          const newWindow = window.open(webUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            window.location.href = webUrl;
          }
          setTimeout(() => setStatus('success'), 1000);
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Unable to open Zoom link. Please try manual join.');
      }
    }
  };

  const handleManualJoin = () => {
    if (webUrl) {
      try {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && zoomUrl) {
          // Try to open Zoom app first on mobile
          const appUrl = zoomUrl.startsWith('zoommtg://') ? zoomUrl : zoomUrl.replace('https://zoom.us/j/', 'zoommtg://zoom.us/j/');
          window.open(appUrl, '_self');
        } else {
          // Desktop or web fallback
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        // Fallback: redirect current window
        window.location.href = webUrl;
      }
    }
  };

  const handleCopyLink = () => {
    if (webUrl) {
      navigator.clipboard.writeText(webUrl).then(() => {
        alert('Link copied to clipboard! You can now paste it in your browser.');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = webUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          alert('Link copied to clipboard! You can now paste it in your browser.');
        } catch (err) {
          alert('Unable to copy link. Please manually copy: ' + webUrl);
        }
        
        document.body.removeChild(textArea);
      });
    }
  };

  const handleOpenZoomApp = () => {
    if (zoomUrl) {
      try {
        // Force open Zoom Workspace app
        const appUrl = zoomUrl.startsWith('zoommtg://') ? zoomUrl : zoomUrl.replace('https://zoom.us/j/', 'zoommtg://zoom.us/j/');
        window.location.href = appUrl;
      } catch (error) {
        console.error('Error opening Zoom app:', error);
        alert('Unable to open Zoom Workspace app. Please try manual join.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ተርቢያህ</h1>
          <p className="text-gray-600 mt-2">የትምህርት ስርዓት</p>
        </div>

        {/* Status Content */}
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-800">በመጫን ላይ...</h2>
            <p className="text-gray-600">የዙም ስብሰባ እየተጫነ ነው።</p>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">ወደ ዙም እየተዛወር ነው...</h2>
            <p className="text-gray-600">እባክዎ ይጠብቁ።</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">በደህና ተገኝተዋል!</h2>
            <p className="text-gray-600">የዙም ስብሰባ ተከፍቷል።</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">ስህተት!</h2>
            <p className="text-gray-600">{errorMessage}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleOpenZoomApp}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📱 የዙም ዎርክስፔስ አፕ ይክፈቱ
              </button>
              
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 እንደገና ይሞክሩ
              </button>
              
              <button
                onClick={handleManualJoin}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                🔗 በእጅ ይገቡ
              </button>
              
              <button
                onClick={handleCopyLink}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📋 ሊንክ ይቅዱ
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
          <h3 className="font-semibold text-gray-800 mb-2">📋 መመሪያዎች:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• የዙም ዎርክስፔስ አፕ ካለዎት በራስ-ሰር ይከፈታል</li>
            <li>• ካልተጫነ ወደ የዙም ድረ-ገጽ ይዛወራል</li>
            <li>• ችግር ካጋጠመዎት ከላይ ያለውን ቁልፍ ይጫኑ</li>
            <li>• ሊንኩን ቅዱት እና በሌላ መሳሪያ ይጫኑ</li>
            <li>• የዙም ዎርክስፔስ አፕ ለመጫን ከላይ ያለውን ቁልፍ ይጫኑ</li>
          </ul>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && webUrl && (
          <div className="mt-4 p-3 bg-yellow-50 rounded text-left">
            <h4 className="font-semibold text-yellow-800 mb-1">Debug Info:</h4>
            <p className="text-xs text-yellow-700 break-all">Web URL: {webUrl}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500">
          <p>© 2025 ተርቢያህ - የትምህርት ስርዓት</p>
        </div>
      </div>
    </div>
  );
}
