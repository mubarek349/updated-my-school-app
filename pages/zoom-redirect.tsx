/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ZoomRedirect() {
  const router = useRouter();
  const { url } = router.query;
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!url) return;

    const zoomUrl = Array.isArray(url) ? url[0] : url;
    
    // Decode the URL
    const decodedUrl = decodeURIComponent(zoomUrl);
    
    try {
      // Check if it's a valid Zoom URL
      if (decodedUrl.includes('zoom.us') || decodedUrl.includes('zoommtg://')) {
        setStatus('redirecting');
        
        // Try to open Zoom app first
        if (decodedUrl.startsWith('zoommtg://')) {
          // For mobile devices, try to open the Zoom app
          window.location.href = decodedUrl;
          
          // Fallback: redirect to web version after a delay
          setTimeout(() => {
            const webUrl = decodedUrl.replace('zoommtg://', 'https://zoom.us/j/');
            window.location.href = webUrl;
          }, 2000);
        } else {
          // Direct web URL
          window.location.href = decodedUrl;
        }
        
        setStatus('success');
      } else {
        throw new Error('Invalid Zoom URL');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Invalid Zoom link provided');
    }
  }, [url]);

  const handleRetry = () => {
    if (url) {
      const zoomUrl = Array.isArray(url) ? url[0] : url;
      const decodedUrl = decodeURIComponent(zoomUrl);
      
      if (decodedUrl.includes('zoom.us')) {
        window.location.href = decodedUrl;
      }
    }
  };

  const handleManualJoin = () => {
    if (url) {
      const zoomUrl = Array.isArray(url) ? url[0] : url;
      const decodedUrl = decodeURIComponent(zoomUrl);
      
      // Extract meeting ID and password from URL
      const meetingIdMatch = decodedUrl.match(/\/j\/(\d+)/);
      const passwordMatch = decodedUrl.match(/pwd=([^&]+)/);
      
      if (meetingIdMatch) {
        const meetingId = meetingIdMatch[1];
        const password = passwordMatch ? passwordMatch[1] : '';
        
        // Create a manual join URL
        const manualUrl = `https://zoom.us/j/${meetingId}${password ? `?pwd=${password}` : ''}`;
        window.location.href = manualUrl;
      }
    }
  };

  return (
    <>
      <Head>
        <title>Joining Zoom Meeting...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
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
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
            <h3 className="font-semibold text-gray-800 mb-2">📋 መመሪያዎች:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• የዙም መተግበሪያ ካለዎት በራስ-ሰር ይከፈታል</li>
              <li>• ካልተጫነ ወደ የዙም ድረ-ገጽ ይዛወራል</li>
              <li>• ችግር ካጋጠመዎት ከላይ ያለውን ቁልፍ ይጫኑ</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-500">
            <p>© 2025 ተርቢያህ - የትምህርት ስርዓት</p>
          </div>
        </div>
      </div>
    </>
  );
}
