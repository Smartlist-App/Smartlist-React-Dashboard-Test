import { prisma } from "@/lib/server/prisma";
import { validateParams } from "@/lib/server/validateParams";

export default async function handler(req, res) {
  try {
    validateParams(req.query, ["followerEmail", "followingEmail"]);
    const { followerEmail, followingEmail }: any = req.query;

    try {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: followerEmail,
            followingId: followingEmail,
          },
        },
      });
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: followingEmail,
            followingId: followerEmail,
          },
        },
      });
    } catch (e) {}
    res.json({ success: true });
  } catch ({ message: error }: any) {
    res.status(401).json({ error });
  }
}
