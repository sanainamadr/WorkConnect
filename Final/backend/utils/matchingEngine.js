/**
 * matchingEngine.js
 * Rule-based worker-to-job scoring engine.
 *
 * Pure functions — no Mongoose imports, no side effects.
 * All tuneable parameters live in MATCHING_CONFIG below.
 */

// ---------------------------------------------------------------------------
// Configuration — change weights here, not inside the scoring logic
// ---------------------------------------------------------------------------
export const MATCHING_CONFIG = {
  /**
   * Component weights (must sum to 1.0).
   * skillOverlap : fraction of job skills the worker possesses
   * proximity    : how close the worker is to the job location
   * experience   : years of experience (saturates at EXPERIENCE_CAP_YEARS)
   * availability : current worker availability status
   */
  WEIGHTS: {
    skillOverlap:   0.45,
    proximity:      0.25,
    experience:     0.20,
    availability:   0.10,
  },

  /**
   * Distance (km) at which the proximity score linearly decays to 0.
   * Workers within this radius score between 0 and 1 on proximity.
   */
  GEO_RADIUS_KM: 50,

  /**
   * Years of experience at which the experience score saturates at 1.0.
   * Workers with more years than this cap still score 1.0.
   */
  EXPERIENCE_CAP_YEARS: 10,

  /**
   * Availability score multipliers.
   * "available" is full credit; "busy" is partial; "offline" is zero.
   */
  AVAILABILITY_SCORES: {
    available: 1.0,
    busy:      0.3,
    offline:   0.0,
  },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Haversine great-circle distance between two [lng, lat] GeoJSON coordinate pairs.
 * @param {number[]} coordA  [longitude, latitude]
 * @param {number[]} coordB  [longitude, latitude]
 * @returns {number} Distance in kilometres
 */
function haversineKm(coordA, coordB) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const [lngA, latA] = coordA;
  const [lngB, latB] = coordB;

  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns true when a GeoJSON coordinates array represents a real location
 * (i.e. is not the default [0, 0] placeholder).
 * @param {number[]} coords
 */
function hasRealCoordinates(coords) {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    !(coords[0] === 0 && coords[1] === 0)
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score a single worker against a job using weighted rule-based matching.
 *
 * @param {Object} worker  Plain JS object with shape:
 *   { skills: string[], experienceYears: number, availability: string,
 *     city: string, location: { coordinates: number[] } }
 * @param {Object} job     Plain JS object with shape:
 *   { skills: string[], locationLabel: string,
 *     location: { coordinates: number[] } }
 *
 * @returns {{ totalScore: number, breakdown: Object }}
 *   totalScore  – 0.0 – 1.0 composite score (higher = better match)
 *   breakdown   – per-component weighted scores + metadata
 */
export function scoreWorkerForJob(worker, job) {
  const { WEIGHTS, GEO_RADIUS_KM, EXPERIENCE_CAP_YEARS, AVAILABILITY_SCORES } =
    MATCHING_CONFIG;

  // ── 1. Skill overlap ────────────────────────────────────────────────────
  const jobSkills    = (job.skills   || []).map((s) => s.toLowerCase().trim());
  const workerSkills = (worker.skills || []).map((s) => s.toLowerCase().trim());

  const matchedSkills = jobSkills.length > 0
    ? jobSkills.filter((s) => workerSkills.includes(s))
    : [];

  const rawSkillScore   = jobSkills.length > 0
    ? matchedSkills.length / jobSkills.length
    : 0;
  const skillScore      = rawSkillScore * WEIGHTS.skillOverlap;

  // ── 2. Proximity ────────────────────────────────────────────────────────
  let rawProximityScore = 0;
  let distanceKm        = null;
  let proximityMethod   = "none";

  const workerCoords = worker.location?.coordinates;
  const jobCoords    = job.location?.coordinates;

  if (hasRealCoordinates(workerCoords) && hasRealCoordinates(jobCoords)) {
    // Both have real GPS coordinates — use Haversine
    distanceKm        = haversineKm(workerCoords, jobCoords);
    rawProximityScore = Math.max(0, 1 - distanceKm / GEO_RADIUS_KM);
    proximityMethod   = "geo";
  } else {
    // Fallback: city-string comparison (case-insensitive)
    const workerCity = (worker.city || "").toLowerCase().trim();
    const jobCity    = (job.locationLabel || "").toLowerCase().trim();

    if (workerCity && jobCity && workerCity === jobCity) {
      rawProximityScore = 1.0;
    } else if (workerCity && jobCity && (workerCity.includes(jobCity) || jobCity.includes(workerCity))) {
      rawProximityScore = 0.5; // partial match (e.g. "Mumbai" vs "Mumbai Suburban")
    } else {
      rawProximityScore = 0;
    }
    proximityMethod = "city";
  }

  const proximityScore = rawProximityScore * WEIGHTS.proximity;

  // ── 3. Experience ────────────────────────────────────────────────────────
  const years            = Math.max(0, Number(worker.experienceYears) || 0);
  const rawExpScore      = Math.min(years, EXPERIENCE_CAP_YEARS) / EXPERIENCE_CAP_YEARS;
  const experienceScore  = rawExpScore * WEIGHTS.experience;

  // ── 4. Availability ──────────────────────────────────────────────────────
  const rawAvailScore   = AVAILABILITY_SCORES[worker.availability] ?? 0;
  const availabilityScore = rawAvailScore * WEIGHTS.availability;

  // ── 5. Total ─────────────────────────────────────────────────────────────
  const totalScore =
    Math.round((skillScore + proximityScore + experienceScore + availabilityScore) * 1000) / 1000;

  return {
    totalScore,
    breakdown: {
      skillOverlap:    Math.round(skillScore      * 1000) / 1000,
      proximity:       Math.round(proximityScore  * 1000) / 1000,
      experience:      Math.round(experienceScore * 1000) / 1000,
      availability:    Math.round(availabilityScore * 1000) / 1000,
      // Metadata (not part of the score sum)
      matchedSkills,
      totalJobSkills:  jobSkills.length,
      distanceKm:      distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      proximityMethod,
      workerExperienceYears: years,
      workerAvailability:    worker.availability || "unknown",
    },
  };
}
