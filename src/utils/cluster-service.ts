import { ParsedMessage } from './ai-pipeline';

export interface IncidentCluster {
  id: string;
  locationName: string;
  coordinates: [number, number];
  messages: ParsedMessage[];
  priorityScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'UNASSIGNED' | 'ASSIGNED' | 'RESPONDING' | 'RESOLVED';
  lastUpdated: number;
  prediction?: string;
}

let activeClusters: IncidentCluster[] = [];

export function getClusters() {
  return activeClusters;
}

export function assignResponder(clusterId: string) {
  const cluster = activeClusters.find(c => c.id === clusterId);
  if (cluster) {
    cluster.status = 'RESPONDING';
    cluster.lastUpdated = Date.now();
  }
  return cluster;
}

export function processNewMessage(message: ParsedMessage): IncidentCluster {
  // Simple clustering: Merge if within ~1km (simplified as same location name for demo)
  const existingCluster = activeClusters.find(c => 
    c.locationName.toLowerCase() === message.location.toLowerCase()
  );

  if (existingCluster) {
    existingCluster.messages.push(message);
    existingCluster.lastUpdated = Date.now();
    
    // Recalculate Severity
    const hasCritical = existingCluster.messages.some(m => m.entities.severityLevel === 'CRITICAL');
    const totalInjured = existingCluster.messages.reduce((sum, m) => sum + m.entities.injuredCount, 0);
    
    if (hasCritical) existingCluster.severity = 'CRITICAL';
    else if (totalInjured > 5) existingCluster.severity = 'CRITICAL';
    else if (totalInjured > 2) existingCluster.severity = 'HIGH';
    
    // Predictive Insight
    if (existingCluster.messages.length > 3) {
      existingCluster.prediction = "⚠️ Likely escalation: High message density indicates expanding incident.";
    }

    return existingCluster;
  } else {
    // Create new cluster
    const newCluster: IncidentCluster = {
      id: `cluster_${Math.random().toString(36).substring(7)}`,
      locationName: message.location,
      coordinates: message.coordinates,
      messages: [message],
      priorityScore: 0, // Placeholder
      severity: message.entities.severityLevel === 'SAFE' ? 'MEDIUM' : message.entities.severityLevel as any,
      status: 'UNASSIGNED',
      lastUpdated: Date.now()
    };
    activeClusters.push(newCluster);
    return newCluster;
  }
}

export function clearAllIncidents() {
  activeClusters = [];
}
