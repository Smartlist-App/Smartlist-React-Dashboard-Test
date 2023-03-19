// Update user settings
import cacheData from "memory-cache";
import * as twofactor from "node-2fa";
import { prisma } from "../../../../lib/server/prisma";

/**
 * API handler for the /api/user/update endpoint
 * @param {any} req
 * @param {any} res
 * @returns {any}
 */
const handler = async (req, res) => {
  // Get user info from sessions table using accessToken
  const session = await prisma.session.findUnique({
    where: {
      id: req.query.token,
    },
    select: {
      user: {
        select: {
          twoFactorSecret: true,
        },
      },
    },
  });
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const twoFactorSecret = session.user.twoFactorSecret;
  twofactor.generateToken(twoFactorSecret);
  const login: null | { delta: number } = twofactor.verifyToken(
    twoFactorSecret,
    req.query.code
  );

  cacheData.del(req.query.sessionId);
  res.json({
    success: login && login.delta === 0,
  });
};
export default handler;
