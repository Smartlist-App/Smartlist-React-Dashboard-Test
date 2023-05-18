import { prisma } from "@/lib/server/prisma";
import cacheData from "memory-cache";

const handler = async (req, res) => {
  try {
    // Find email from `user` table
    const user = await prisma.user.findUnique({
      where: { email: req.query.email },
    });

    if (!user || !req.query.token) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    // Delete invite link
    await prisma.propertyLinkInvite.delete({
      where: {
        token: req.query.token,
      },
    });

    // Get user id
    const userId = user.id;

    await prisma.propertyInvite.updateMany({
      data: {
        selected: false,
      },
      where: { userId },
    });

    cacheData.clear();
    cacheData.clear();
    cacheData.clear();

    const data = await prisma.propertyInvite.create({
      data: {
        profile: {
          connect: { id: req.query.property },
        },
        user: {
          connect: { id: userId },
        },
        accepted: false,
        selected: true,
        permission: "member",
      },
      include: { profile: true },
    });

    res.json(data);
  } catch (e: any) {
    res.json({ error: e.message });
  }
};
export default handler;
