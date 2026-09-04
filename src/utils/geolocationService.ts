export interface DetectedLocationResult {
  formattedAddress: string;
  shortAddress: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  cityOrDistrict?: string;
  state?: string;
  postcode?: string;
  timestamp: string;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN';
  message: string;
}

/**
 * Detects current user GPS location using browser Geolocation API
 * and performs reverse-geocoding to produce an accurate farm delivery address.
 */
export async function detectCurrentDeliveryLocation(): Promise<{
  success: boolean;
  location?: DetectedLocationResult;
  error?: GeolocationError;
}> {
  if (!navigator || !navigator.geolocation) {
    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser or device.',
      },
    };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        }
      );
    });

    const { latitude, longitude, accuracy } = position.coords;

    // Attempt reverse geocoding via OpenStreetMap Nominatim with graceful fallback
    let addressData: any = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        addressData = await res.json();
      }
    } catch {
      // Network timeout or offline - use coordinate fallback
      addressData = null;
    }

    let formattedAddress = '';
    let shortAddress = '';
    let cityOrDistrict = '';
    let state = '';
    let postcode = '';

    if (addressData && addressData.address) {
      const a = addressData.address;
      const road = a.road || a.street || a.neighbourhood || a.suburb || a.hamlet || a.village || 'Farm Road Gate';
      const locality = a.village || a.suburb || a.town || a.city || a.county || 'Agricultural Sector';
      cityOrDistrict = a.city || a.town || a.district || a.state_district || a.county || '';
      state = a.state || a.region || '';
      postcode = a.postcode || '';

      const parts = [road, locality];
      if (cityOrDistrict && cityOrDistrict !== locality) parts.push(cityOrDistrict);
      if (state) parts.push(state);
      if (postcode) parts.push(`PIN: ${postcode}`);

      formattedAddress = `Farm Gate - ${parts.filter(Boolean).join(', ')} [GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E]`;
      shortAddress = `${road}, ${locality}`;
    } else {
      // Coordinate-based robust farm address fallback
      formattedAddress = `Farm Staging Point - Lat ${latitude.toFixed(5)}°, Lon ${longitude.toFixed(5)}° (Accuracy: ±${Math.round(accuracy)}m)`;
      shortAddress = `GPS ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
    }

    return {
      success: true,
      location: {
        formattedAddress,
        shortAddress,
        latitude,
        longitude,
        accuracyMeters: Math.round(accuracy),
        cityOrDistrict,
        state,
        postcode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    };
  } catch (err: any) {
    let code: GeolocationError['code'] = 'UNKNOWN';
    let message = 'Unable to determine your delivery location.';

    if (err && typeof err.code === 'number') {
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          code = 'PERMISSION_DENIED';
          message = 'Location permission was denied. Please allow location access in your browser settings to auto-detect your farm delivery gate.';
          break;
        case 2: // POSITION_UNAVAILABLE
          code = 'POSITION_UNAVAILABLE';
          message = 'GPS position is currently unavailable. Please verify device location services are enabled.';
          break;
        case 3: // TIMEOUT
          code = 'TIMEOUT';
          message = 'Location request timed out. Please tap retry to detect again.';
          break;
      }
    } else if (err?.message) {
      message = err.message;
    }

    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }
}
