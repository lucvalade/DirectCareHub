// Developed by VertexAgent.io
// Project: DirectCare Hub - Mapbox Routing Engine

'use server';

import { z } from 'zod';

const CoordinatesSchema = z.tuple([z.number(), z.number()]);

const EtaRequestSchema = z.object({
  attendantCoords: CoordinatesSchema, // [longitude, latitude]
  employerCoords: CoordinatesSchema,  // [longitude, latitude]
});

/**
 * Calculates live driving ETA in minutes using the Mapbox Matrix API.
 */
export async function getDrivingEta(input: z.infer<typeof EtaRequestSchema>): Promise<number> {
  const parsed = EtaRequestSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid coordinate parameters provided to Mapbox.");
    return 30; // Fallback SLA
  }

  const { attendantCoords, employerCoords } = parsed.data;
  const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!MAPBOX_TOKEN) {
    console.warn("Mapbox token missing. Returning default ETA.");
    return 30;
  }

  // Format: {longitude},{latitude};{longitude},{latitude}
  const coordinatesString = `${attendantCoords[0]},${attendantCoords[1]};${employerCoords[0]},${employerCoords[1]}`;
  
  // The Matrix API is highly optimized for returning durations between multiple points.
  // We use the driving profile and request only durations to minimize payload size.
  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinatesString}?annotations=duration&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url, { 
      next: { revalidate: 60 } // Cache identical route requests for 60 seconds
    });
    
    if (!response.ok) throw new Error(`Mapbox API responded with status: ${response.status}`);

    const data = await response.json();

    // Mapbox returns durations in seconds. 
    // durations[0][1] represents the time from Point 0 (Attendant) to Point 1 (Employer).
    const durationSeconds = data.durations?.[0]?.[1];
    
    if (typeof durationSeconds !== 'number') {
      return 30;
    }

    return Math.ceil(durationSeconds / 60);

  } catch (error) {
    console.error("Mapbox Matrix API failed:", error);
    return 30; // Fallback to 30 minutes on network/API failure
  }
}
