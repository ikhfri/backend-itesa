import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import { serviceSchema } from "../dtos/service.dto";

// Haversine formula untuk menghitung jarak (dalam kilometer)
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

// Create a new service
export const createService = async (req: Request, res: Response) => {
  try {
    const parsed = serviceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message: "Invalid request body",
          errors: parsed.error.flatten(),
        });
    }

    const userId = (req.user as any).id;
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const service = await prisma.service.create({
      data: { ...parsed.data, workerId: worker.id },
    });
    return res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing service
export const updateService = async (req: Request, res: Response) => {
  try {
    const parsed = serviceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message: "Invalid request body",
          errors: parsed.error.flatten(),
        });
    }

    const userId = (req.user as any).id;
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.workerId !== worker.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this service" });
    }

    const updatedService = await prisma.service.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    return res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.workerId !== worker.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this service" });
    }

    await prisma.service.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get services by worker ID
export const getServicesByWorker = async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.params.workerId },
    });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const services = await prisma.service.findMany({
      where: { workerId: req.params.workerId },
      include: { worker: { include: { user: true } } },
    });
    return res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services by worker:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get nearby services based on user location
export const getNearbyServices = async (req: Request, res: Response) => {
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
      return res
        .status(400)
        .json({
          message: "Invalid query parameters",
          errors: parsed.error.flatten(),
        });
    }

    const { lat, lon, maxDistance } = parsed.data;

    const workers = await prisma.worker.findMany({
      include: {
        user: { include: { location: true } },
        services: {
          include: { worker: { include: { user: true } } },
        },
      },
    });

    const servicesWithDistance = [];
    for (const worker of workers) {
      if (!worker.user.location) continue;
      const distance = haversine(
        lat,
        lon,
        worker.user.location.latitude,
        worker.user.location.longitude
      );
      if (distance <= maxDistance) {
        for (const service of worker.services) {
          servicesWithDistance.push({
            ...service,
            worker: {
              id: worker.id,
              userId: worker.userId,
              name: worker.user.name,
              email: worker.user.email,
              phone: worker.user.phone,
              location: worker.user.location,
            },
            distance,
          });
        }
      }
    }

    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    return res.status(200).json(servicesWithDistance);
  } catch (error) {
    console.error("Error fetching nearby services:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
