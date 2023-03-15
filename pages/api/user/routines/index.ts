import { prisma } from "../../../../lib/prismaClient";

export default async function handler(req, res) {
  const data = await prisma.routineItem.findMany({
    where: {
      userId: req.query.userIdentifier,
    },
    orderBy: {
      progress: "asc",
    },
  });
  res.json(data);
}
