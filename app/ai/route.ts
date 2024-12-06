import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const OPTIONS = async () => {
  return new Response("", {
    status: 200,
    headers: { "Access-Control-Allow-Headers": "*" },
  });
};

export async function POST(req: NextRequest) {
  try {
    const params = await getApiParams(req, [{ name: "token", required: true }]);
    const { userId } = await getIdentifiers();
    const token = await prisma.aiToken.findFirst({
      where: { userId },
      select: { id: true },
    });

    const t = { type: params.type, token: params.token, userId };

    const data = await prisma.aiToken.upsert({
      where: { id: token?.id },
      update: t,
      create: t,
    });

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getIdentifiers();
    const data = await prisma.aiToken.findFirst({ where: { userId } });

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
