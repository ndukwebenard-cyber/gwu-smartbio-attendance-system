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
        name: 'ICT Hall B',
        building: 'Computer Science & Software Complex',
        latitude: 6.524450,
        longitude: 3.379320,
        radiusMeters: 50.0
      },
      {
        id: 3,
        name: 'Computer Lab 1',
        building: 'Hardware & Biometrics Lab Wing',
        latitude: 6.524250,
        longitude: 3.379150,
        radiusMeters: 35.0
      },
      {
        id: 4,
        name: 'Engineering Hall B',
        building: 'Faculty of Engineering Block',
        latitude: 6.525100,
        longitude: 3.378900,
        radiusMeters: 45.0
      },
      {
        id: 5,
        name: 'Science Auditorium',
        building: 'Natural Sciences Complex',
        latitude: 6.523800,
        longitude: 3.380100,
        radiusMeters: 60.0
      },
      {
        id: 6,
        name: 'University Main Auditorium',
        building: 'Central Campus Plaza',
        latitude: 6.526000,
        longitude: 3.377500,
        radiusMeters: 75.0
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
    if (!venueName) return null; // No silent fallback — venue must be explicitly specified
    const normalized = venueName.trim().toLowerCase();

    // 1. Direct or bidirectional match against official venue names (Highest Priority)
    const nameMatch = this.venues.find(v => {
      const vName = v.name.toLowerCase();
      return vName === normalized || normalized.includes(vName) || vName.includes(normalized);
    });
    if (nameMatch) return nameMatch;

    // 2. Building description match
    const buildingMatch = this.venues.find(v => {
      const bName = (v.building || '').toLowerCase();
      return bName.includes(normalized) || normalized.includes(bName);
    });
    if (buildingMatch) return buildingMatch;

    // 3. Common campus aliases & abbreviations
    if (normalized.includes('ict a') || normalized.includes('hall a') || normalized === 'hall 1') {
      return this.venues.find(v => v.name === 'ICT Hall A') || this.venues[0];
    }
    if (normalized.includes('ict b') || normalized.includes('hall b') || normalized === 'hall 2') {
      return this.venues.find(v => v.name === 'ICT Hall B') || this.venues[1];
    }
    if (normalized.includes('lab') || normalized.includes('lab 1') || normalized.includes('computer lab')) {
      return this.venues.find(v => v.name === 'Computer Lab 1') || this.venues[2];
    }
    if (normalized.includes('eng') || normalized.includes('engineering') || normalized === 'hall 3') {
      return this.venues.find(v => v.name === 'Engineering Hall B') || this.venues[3];
    }
    if (normalized.includes('sci') || normalized.includes('science') || normalized.includes('auditorium')) {
      return this.venues.find(v => v.name === 'Science Auditorium') || this.venues[4];
    }
    if (normalized.includes('main') || normalized.includes('plaza')) {
      return this.venues.find(v => v.name === 'University Main Auditorium') || this.venues[5];
    }

    // 4. Generic campus terms (e.g. "the class", "classroom", "class", "hall", "lecture hall", "hall ...")
    if (['the class', 'class', 'classroom', 'lecture hall', 'main hall', 'hall'].includes(normalized) || normalized.startsWith('hall')) {
      return this.venues[0]; // ICT Hall A
    }

    return null; // Unrecognized custom venues rejected
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
  async verifyProximity(venueName = null, modeOverride = null) {
    const venue = this.getVenueByName(venueName);

    // STRICT VENUE ENFORCEMENT: If the venue is not in the authoritative registry, REJECT.
    // This prevents silent fallback to a wrong geofence when a lecturer sets a custom venue name.
    if (!venue) {
      return {
        success: false,
        status: 'VENUE_NOT_RECOGNIZED',
        error: `Venue "${venueName || '(none)'}" is not in the authoritative campus venue registry. Geofence check cannot proceed.`,
        distanceMeters: null,
        allowedRadiusMeters: null,
        venueName: venueName || '(none)'
      };
    }

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
