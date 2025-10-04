import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import { locationSchema } from "../dtos/location.dto";
import NodeGeocoder from "node-geocoder";
import dotenv from "dotenv";
dotenv.config();

const geocoder = NodeGeocoder({
  provider: "openstreetmap",
});

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius = 6371
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

export const upsertLocation = async (req: Request, res: Response) => {
  try {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten(),
      });
    }

    let { latitude, longitude, address } = parsed.data;
    const userId = (req.user as any).id;

    if (address && (!latitude || !longitude)) {
      const geoResult = await geocoder.geocode(address);
      if (geoResult.length > 0) {
        latitude = geoResult[0].latitude;
        longitude = geoResult[0].longitude;
        address = geoResult[0].formattedAddress || address;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid address: No geocoding result found" });
      }
    }

    if (latitude && longitude && !address) {
      const reverseResult = await geocoder.reverse({
        lat: latitude,
        lon: longitude,
      });
      if (reverseResult.length > 0) {
        address = reverseResult[0].formattedAddress;
      }
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        message:
          "Latitude and longitude are required or must be resolvable from address",
      });
    }

    const location = await prisma.location.upsert({
      where: { userId },
      update: { latitude, longitude, address },
      create: { userId, latitude, longitude, address },
    });

    return res
      .status(200)
      .json({ message: "Location updated successfully", location });
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getNearbyLocations = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      lat: z
        .string()
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val), { message: "Invalid latitude" }),
      lon: z
        .string()
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val), { message: "Invalid longitude" }),
      maxDistance: z
        .string()
        .transform((val) => parseFloat(val))
        .optional()
        .default(10),
    });

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: parsed.error.flatten(),
      });
    }

    const { lat, lon, maxDistance } = parsed.data;

    type LocationWithUser = {
      id: string;
      userId: string;
      latitude: number;
      longitude: number;
      address: string | null;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        phone: string | null;
      };
      createdAt: Date;
      updatedAt: Date;
    };

    type NearbyLocation = {
      id: string;
      userId: string;
      latitude: number;
      longitude: number;
      address: string | null;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        phone: string | null;
      };
      distance: number;
      createdAt: Date;
      updatedAt: Date;
    };

    const locations: LocationWithUser[] = await prisma.location.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
    });

    const nearby: NearbyLocation[] = locations
      .filter((loc: LocationWithUser) => {
        const distance = haversine(lat, lon, loc.latitude, loc.longitude);
        return distance <= maxDistance;
      })
      .map(
        (loc: LocationWithUser): NearbyLocation => ({
          id: loc.id,
          userId: loc.userId,
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
          user: {
            id: loc.user.id,
            name: loc.user.name,
            email: loc.user.email,
            role: loc.user.role,
            phone: loc.user.phone,
          },
          distance: haversine(lat, lon, loc.latitude, loc.longitude),
          createdAt: loc.createdAt,
          updatedAt: loc.updatedAt,
        })
      )
      .sort((a: NearbyLocation, b: NearbyLocation) => a.distance - b.distance); 
    return res.status(200).json(nearby);
  } catch (error) {
    console.error("Error fetching nearby locations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
