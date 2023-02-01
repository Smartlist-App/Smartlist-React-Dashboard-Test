import cacheData from "memory-cache";
import { prisma } from "../../../../lib/prismaClient";

// name         String
//   stepName     String
//   category     String
//   durationDays Int
//   progress     Int    @default(0)
//   time         String
//   emoji        String

//   completed Boolean @default(false)
export default async function handler(req: any, res: any) {
  if (req.query.daysLeft !== "0") {
    res
      .status(400)
      .json({ error: "You can't complete a routine that isn't finished yet!" });
    return;
  }
  console.log(req.query);
  const data = await prisma.routineItem.update({
    data: {
      completed: true,
      feedback: req.query.feedback,
    },
    where: {
      id: req.query.id,
    },
  });
  //   Add 1 more trophy to the users trophy count
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
  cacheData.del(req.query.sessionId);
  res.json(data);
}
