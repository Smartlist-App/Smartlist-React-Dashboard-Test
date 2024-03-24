import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { nonReadOnlyPermissionArgs } from "../route";

export async function POST(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers();

    const params = await getApiParams(req, [{ name: "id", required: true }], {
      type: "BODY",
    });

    await prisma.entity.findFirstOrThrow({
      where: nonReadOnlyPermissionArgs(userId, params, spaceId),
      select: { id: true },
    });

    const instance = await prisma.completionInstance.create({
      data: {
        task: { connect: { id: params.id } },
      },
    });

    return Response.json({ instance });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, spaceId } = await getIdentifiers();

    const params = await getApiParams(
      req,
      [
        { name: "id", required: true },
        { name: "recurring", required: true },
      ],
      {
        type: "BODY",
      }
    );

    if (params.recurring) {
      throw new Error("Coming soon!");
    }
    await prisma.entity.findFirstOrThrow({
      where: nonReadOnlyPermissionArgs(userId, params, spaceId),
      select: { id: true },
    });

    const instance = await prisma.completionInstance.deleteMany({
      where: {
        task: { id: params.id },
      },
    });

    return Response.json({ instance });
  } catch (e) {
    return handleApiError(e);
  }
}
