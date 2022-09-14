import { prisma } from "../../../../lib/client";
import { validatePermissions } from "../../../../lib/validatePermissions";

const handler = async (req: any, res: any) => {
  // Validate permissions
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions || permissions !== "owner") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Create a new maintenance reminder
  const data: any | null = await prisma.maintenanceReminder.create({
    data: {
      property: {
        connect: {
          id: req.query.property,
        },
      },
      name: req.query.name,
      frequency: req.query.frequency,
      nextDue: new Date(req.query.nextDue) || new Date(),
      note: req.query.note,
    },
  });
  res.json(data);
};
export default handler;
