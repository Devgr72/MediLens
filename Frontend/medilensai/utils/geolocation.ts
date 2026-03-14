/**
 * Geolocation — Context Utility
 * Detects device location and sends it to the backend for environmental context.
 */

const API_ENDPOINT = "/api/v1/environment/context";

interface GeolocationResponse {
  latitude: number;
  longitude: number;
  [key: string]: any;
}

/**
 * Sends coordinates to the backend API.
 */
async function sendContextToBackend(latitude: number, longitude: number): Promise<any> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn(`Backend sync failed (HTTP ${response.status}). Proceeding with local context only.`);
      return null;
    }

    console.log("Location context synchronized successfully.");
    const responseData = await response.json();
    console.log("Server Response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Failed to sync location context:", error);
    // We don't throw here to allow the detection to succeed even if sync fails
    return null;
  }
}

/**
 * Detects user device location and triggers backend sync.
 */
export async function detectLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser.";
      console.error(errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Location detected: ${latitude}, ${longitude}`);
        
        try {
          await sendContextToBackend(latitude, longitude);
          resolve({ lat: latitude, lon: longitude });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        let errorMsg = "An unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "The request to get user location timed out.";
            break;
        }
        console.error("Geolocation Error:", errorMsg);
        reject(new Error(errorMsg));
      },
      options
    );
  });
}
