import { Suspense } from 'react';
import ZoomRedirectClient from './ZoomRedirectClient';

export default function ZoomRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">በመጫን ላይ...</h2>
        </div>
      </div>
    }>
      <ZoomRedirectClient />
    </Suspense>
  );
}