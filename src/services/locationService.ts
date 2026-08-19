/**
 * Centralized Location Service for Funshann.
 * Handles Android / Browser Geolocation requests, coordinate formatting, and graceful fallbacks.
 */

export interface LocationResult {
  city: string;
  country?: string;
  formatted: string;
  latitude: number;
  longitude: number;
}

/**
 * Resolves approximate city and region from coordinates.
 */
function approximateLocationFromCoords(lat: number, lng: number): string {
  // Common bounding box approximations for common regions
  if (lat >= 37.0 && lat <= 38.5 && lng >= -123.0 && lng <= -121.5) {
    return 'San Francisco, CA';
  } else if (lat >= 33.5 && lat <= 34.5 && lng >= -118.8 && lng <= -117.8) {
    return 'Los Angeles, CA';
  } else if (lat >= 40.5 && lat <= 41.0 && lng >= -74.3 && lng <= -73.7) {
    return 'New York, NY';
  } else if (lat >= 51.3 && lat <= 51.7 && lng >= -0.5 && lng <= 0.3) {
    return 'London, United Kingdom';
  } else if (lat >= 41.2 && lat <= 41.6 && lng >= 2.0 && lng <= 2.3) {
    return 'Barcelona, Spain';
  } else if (lat >= 52.3 && lat <= 52.7 && lng >= 13.2 && lng <= 13.6) {
    return 'Berlin, Germany';
  } else if (lat >= 35.5 && lat <= 35.8 && lng >= 139.5 && lng <= 140.0) {
    return 'Tokyo, Japan';
  } else if (lat >= 30.5 && lat <= 32.0 && lng >= 74.5 && lng <= 76.5) {
    return 'Punjab, India';
  } else if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) {
    return 'New Delhi, India';
  } else if (lat >= 48.7 && lat <= 49.0 && lng >= 2.1 && lng <= 2.6) {
    return 'Paris, France';
  } else if (lat >= 40.3 && lat <= 40.6 && lng >= -3.8 && lng <= -3.5) {
    return 'Madrid, Spain';
  } else if (lat >= 45.4 && lat <= 45.6 && lng >= 9.0 && lng <= 9.3) {
    return 'Milan, Italy';
  } else if (lat >= 43.7 && lat <= 44.2 && lng >= 7.1 && lng <= 7.5) {
    return 'Nice, French Riviera';
  }

  // Format cleanly as latitude & longitude degrees if outside indexed cities
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

/**
 * Fetch current device location using browser / Android geolocation API.
 */
export async function getDeviceCurrentLocation(): Promise<LocationResult | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formatted = approximateLocationFromCoords(latitude, longitude);

        // Try reverse geocoding via OpenStreetMap Nominatim with a short timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county;
            const stateOrCountry = address.state || address.country;

            if (city && stateOrCountry) {
              formatted = `${city}, ${stateOrCountry}`;
            } else if (city) {
              formatted = city;
            } else if (data.display_name) {
              const parts = data.display_name.split(',').map((p: string) => p.trim());
              formatted = parts.slice(0, 2).join(', ');
            }
          }
        } catch {
          // Keep approximation if reverse geocoding is slow or network changes
        }

        resolve({
          city: formatted.split(',')[0].trim(),
          formatted,
          latitude,
          longitude,
        });
      },
      (error) => {
        console.warn('Geolocation lookup notice:', error.message);
        resolve(null);
      },
      {
        timeout: 6000,
        maximumAge: 60000,
        enableHighAccuracy: false,
      }
    );
  });
}
