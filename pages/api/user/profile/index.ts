import { prisma } from "@/lib/server/prisma";
import { validateParams } from "@/lib/server/validateParams";

export default async function handler(req, res) {
  try {
    validateParams(req.query, ["email"]);
    let data: any = await prisma.user.findFirstOrThrow({
      where: {
        email: req.query.email,
      },
      select: {
        CoachData: true,
        timeZone: true,
        trophies: true,
        color: true,
        name: true,
        email: true,
        followers: true,
        following: true,
        Profile: true,
      },
    });
    res.json(data);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
}