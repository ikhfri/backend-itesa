import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import { workerProfileSchema } from "../dtos/worker.dto";

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}
function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius = 6371
) {
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

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const worker = await prisma.worker.findUnique({
    where: { userId },
    include: {
      user: true,
      skills: { include: { skill: true } },
      services: true,
    },
  });
  if (!worker) return res.status(404).json({ message: "Worker not found" });
  res.json(worker);
};

export const updateProfile = async (req: Request, res: Response) => {
  const parsed = workerProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { bio, price, phone, skills } = parsed.data;
  const userId = (req.user as any).id;

  await prisma.user.update({ where: { id: userId }, data: { phone } });
  const worker = await prisma.worker.update({
    where: { userId },
    data: { bio, price },
  });

  if (skills) {
    await prisma.workerSkill.deleteMany({ where: { workerId: worker.id } });
    for (const skillName of skills) {
      let skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill)
        skill = await prisma.skill.create({ data: { name: skillName } });
      await prisma.workerSkill.create({
        data: { workerId: worker.id, skillId: skill.id },
      });
    }
  }

  res.json(worker);
};

export const getWorkerById = async (req: Request, res: Response) => {
  const worker = await prisma.worker.findUnique({
    where: { id: req.params.id },
    include: {
      user: true,
      skills: { include: { skill: true } },
      services: true,
    },
  });
  if (!worker) return res.status(404).json({ message: "Worker not found" });
  res.json(worker);
};

export const getNearbyWorkers = async (req: Request, res: Response) => {
  const { lat, lon, maxDistance = 10 } = req.query;
  if (!lat || !lon)
    return res.status(400).json({ message: "Latitude and longitude required" });

  const userLat = parseFloat(lat as string);
  const userLon = parseFloat(lon as string);
  const maxDistNum = parseFloat(maxDistance as string);

  const workers = await prisma.worker.findMany({
    include: {
      user: {
        include: {
          location: true,
        },
      },
    },
  });

  type WorkerWithLocation = (typeof workers)[number] & {
    user: {
      location: {
        latitude: number;
        longitude: number;
      } | null;
    };
  };

  const nearby = workers.filter((w: WorkerWithLocation) => {
    const loc = w.user.location;
    if (!loc) return false;
    const distance = haversine(userLat, userLon, loc.latitude, loc.longitude);
    return distance <= maxDistNum;
  });

  return res.json(nearby);
};
