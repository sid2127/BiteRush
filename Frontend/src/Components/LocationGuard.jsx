import React, { useEffect, useState } from "react";

function LocationGuard({ children }) {

  const [allowed, setAllowed] = useState(null); // null = checking

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAllowed(true); // ✅ allowed
      },
      (err) => {
        setAllowed(false); // ❌ denied
      }
    );
  }, []);

  // ⏳ while checking
  if (allowed === null) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Checking location permission...
      </div>
    );
  }

  // ❌ denied
  if (allowed === false) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          Location Permission Required 🚫
        </h1>

        <p className="text-gray-600 text-center max-w-md">
          Please allow location access to use this app.  
          Without location, delivery tracking will not work.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ✅ allowed → show actual UI
  return children;
}

export default LocationGuard;