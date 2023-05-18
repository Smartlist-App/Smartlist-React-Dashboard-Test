import { prisma } from "@/lib/server/prisma";
import cacheData from "memory-cache";

export default async function handler(req: any, res: any) {
  if (req.query.daysLeft !== "0") {
    res
      .status(400)
      .json({ error: "You can't complete a routine that isn't finished yet!" });
    return;
  }

  const data = await prisma.routineItem.update({
    data: {
      completed: true,
      feedback: req.query.feedback,
    },
    where: {
      id: req.query.id,
    },
  });

  await prisma.user.update({
    data: {
      trophies: {
        increment: 1,
      },
    },
    where: {
      identifier: req.query.userIdentifier,
    },
  });
  cacheData.clear();
  res.json(data);
}
