/**
 * CrowdPulse AI Pipeline - Simulation Layer
 * 
 * Logic to parse raw emergency messages and classify them.
 */

export interface ParsedMessage {
  id: string;
  text: string;
  location: string;
  coordinates: [number, number];
  entities: {
    injuredCount: number;
    severityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
    keywords: string[];
  };
  timestamp: number;
}

const SEVERITY_KEYWORDS = {
  CRITICAL: ['unconscious', 'no breathing', 'heart attack', 'stopped breathing', 'unresponsive', 'major fire', 'explosion', 'active shooter'],
  HIGH: ['bleeding', 'fracture', 'broken bone', 'trapped', 'fire', 'accident', 'chest pain', 'severe pain'],
  MEDIUM: ['minor injury', 'theft', 'suspicious', 'leak', 'assist', 'non-emergency', 'medical wait'],
};

// Mock Geo-location database for Bangalore/India Demo
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'mg road': [12.9733, 77.6117],
  'indiranagar': [12.9719, 77.6412],
  'koramangala': [12.9352, 77.6245],
  'whitefield': [12.9698, 77.7500],
  'electronic city': [12.8452, 77.6636],
  'hebbal': [13.0358, 77.5970],
  'jayanagar': [12.9250, 77.5938],
  'bangalore': [12.9716, 77.5946],
};

export function parseEmergencyMessage(text: string): ParsedMessage {
  const lowerText = text.toLowerCase();
  
  // 1. Extract Location (Simple keyword matching for demo)
  let location = "Undeclared Location";
  let coords: [number, number] = [12.9716, 77.5946]; // Default to Bangalore Center
  
  Object.keys(LOCATION_COORDINATES).forEach(loc => {
    if (lowerText.includes(loc)) {
      location = loc.charAt(0).toUpperCase() + loc.slice(1);
      coords = LOCATION_COORDINATES[loc];
    }
  });

  // 2. Extract Injured Count
  const countMatch = lowerText.match(/(\d+)\s*(injured|people|casualty|persons)/);
  const injuredCount = countMatch ? parseInt(countMatch[1]) : 0;

  // 3. Severity Classification
  let severityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE' = 'MEDIUM';
  
  const isCritical = SEVERITY_KEYWORDS.CRITICAL.some(k => lowerText.includes(k));
  const isHigh = SEVERITY_KEYWORDS.HIGH.some(k => lowerText.includes(k)) || injuredCount > 2;
  
  if (isCritical) severityLevel = 'CRITICAL';
  else if (isHigh) severityLevel = 'HIGH';

  // 4. Extract Keywords
  const foundKeywords = [
    ...SEVERITY_KEYWORDS.CRITICAL, 
    ...SEVERITY_KEYWORDS.HIGH, 
    ...SEVERITY_KEYWORDS.MEDIUM
  ].filter(k => lowerText.includes(k));

  return {
    id: Math.random().toString(36).substring(7),
    text,
    location,
    coordinates: coords,
    entities: {
      injuredCount,
      severityLevel,
      keywords: foundKeywords
    },
    timestamp: Date.now()
  };
}

export function generateAutoResponse(parsed: ParsedMessage): string {
  const { severityLevel } = parsed.entities;
  
  if (severityLevel === 'CRITICAL') {
    return "EMERGENCY RECEIVED. Critical units dispatched. Do not move the patient. Check for pulse and maintain airway. Help is 4 mins away.";
  }
  if (severityLevel === 'HIGH') {
    return "Received. Responders are on the way. Apply pressure to any bleeding. Keep them calm. Estimated arrival: 7 mins.";
  }
  return "Message logged. An emergency operator will check this shortly. If life-threatening, stay on the line.";
}
