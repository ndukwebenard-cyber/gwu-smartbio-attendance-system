/**
 * SMARTBIO ATTENDANCE SYSTEM - CLASSROOM GEOFENCING & PROXIMITY ENGINE
 * Physical Attendance Boundary Enforcement & NDPA 2023 Privacy-Compliant Proximity Verification
 */

class SmartBioGeofence {
  constructor() {
    // Authoritative University Campus Venue Boundaries
    this.venues = [
      {
        id: 1,
        name: 'ICT Hall A',
        building: 'Computer Science & Software Complex',
        latitude: 6.524379,
        longitude: 3.379206,
        radiusMeters: 50.0 // 50m geofence covers seating and podium
      },
      {
        id: 2,
        name: 'Engineering Hall B',
        building: 'Faculty of Engineering Block',
        latitude: 6.525100,
        longitude: 3.378900,
        radiusMeters: 45.0
      },
      {
        id: 3,
        name: 'Science Auditorium',
        building: 'Natural Sciences Complex',
        latitude: 6.523800,
        longitude: 3.380100,
        radiusMeters: 60.0
      }
    ];

    // Current simulation mode for defense/testing: 'SIM_IN_CLASS' | 'SIM_HOSTEL_REMOTE' | 'DEVICE_GPS'
    this.currentMode = 'SIM_IN_CLASS';
  }

  setSimulationMode(mode) {
    if (['SIM_IN_CLASS', 'SIM_HOSTEL_REMOTE', 'DEVICE_GPS'].includes(mode)) {
      this.currentMode = mode;
      return true;
    }
    return false;
  }

  getSimulationMode() {
    return this.currentMode;
  }

  getVenues() {
    return this.venues;
  }

  getVenueByName(venueName) {
    if (!venueName) return this.venues[0];
    const normalized = venueName.trim().toLowerCase();
    const found = this.venues.find(v => v.name.toLowerCase() === normalized || normalized.includes(v.name.toLowerCase()));
    return found || this.venues[0]; // Fallback to default hall
  }

  /**
   * Authoritative Haversine Formula for Great-Circle Distance (in meters)
   */
  calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Acquire Coordinates based on active mode (NDPA Sec. 24 compliant: point-in-time calculation only)
   */
  async acquireCoordinates(venue, mode = this.currentMode) {
    if (mode === 'SIM_IN_CLASS') {
      // Offset slightly (approx 4.8 meters from venue center) to simulate student in row 3
      return {
        latitude: venue.latitude + 0.000035,
        longitude: venue.longitude + 0.000025,
        accuracy: 3.5,
        mode: 'SIMULATED_IN_CLASS'
      };
    }

    if (mode === 'SIM_HOSTEL_REMOTE') {
      // Off-campus / Hostel student quarters approx 1.25 km away
      return {
        latitude: 6.535200,
        longitude: 3.371100,
        accuracy: 10.0,
        mode: 'SIMULATED_HOSTEL_REMOTE'
      };
    }

    // Real Browser Geolocation API
    if (!navigator.geolocation) {
      throw new Error('Geolocation hardware API is not supported by this browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            mode: 'DEVICE_HARDWARE_GPS'
          });
        },
        (err) => {
          reject(new Error(`GPS Sensor error: ${err.message}`));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  /**
   * Verify whether the student is physically within the active lecture venue
   */
  async verifyProximity(venueName = 'ICT Hall A', modeOverride = null) {
    const venue = this.getVenueByName(venueName);
    const mode = modeOverride || this.currentMode;

    try {
      const coords = await this.acquireCoordinates(venue, mode);
      const distance = this.calculateDistanceMeters(
        coords.latitude,
        coords.longitude,
        venue.latitude,
        venue.longitude
      );

      const isInside = distance <= venue.radiusMeters;

      return {
        success: isInside,
        status: isInside ? 'WITHIN_CLASSROOM' : 'OUT_OF_BOUNDS_LOCATION_BREACH',
        distanceMeters: distance,
        allowedRadiusMeters: venue.radiusMeters,
        venueName: venue.name,
        mode: coords.mode,
        accuracy: coords.accuracy,
        complianceNotice: 'NDPA 2023 Sec. 24 Compliant: Ephemeral location verification complete; coordinates discarded from persistent storage.'
      };
    } catch (e) {
      return {
        success: false,
        status: 'GPS_ACQUISITION_FAILED',
        error: e.message,
        distanceMeters: null,
        allowedRadiusMeters: venue.radiusMeters,
        venueName: venue.name
      };
    }
  }
}

window.smartBioGeofence = new SmartBioGeofence();
