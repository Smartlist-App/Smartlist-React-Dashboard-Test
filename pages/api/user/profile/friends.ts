import { prisma } from "@/lib/server/prisma";
import { validateParams } from "@/lib/server/validateParams";
import dayjs from "dayjs";

function removeDuplicateFriends(data) {
  const uniqueFriends = new Set();
  const filteredData: any = [];

  for (const friend of data) {
    const friendPair = `${friend.followerId}-${friend.followingId}`;
    const friendPair2 = `${friend.followingId}-${friend.followerId}`;

    if (!uniqueFriends.has(friendPair) && !uniqueFriends.has(friendPair2)) {
      uniqueFriends.add(friendPair);
      filteredData.push(friend);
    }
  }

  return filteredData;
}

export function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
function sortFriendsByStatusAndActivity(friendsData, userTimeZone) {
  return friendsData.sort((friendA, friendB) => {
    // Sort by status duration within user's timezone
    if (friendA.following.Status && friendB.following.Status) {
      const currentTimeInUserTZ = dayjs().tz(userTimeZone);
      const statusStartA = dayjs(friendA.following.Status.started).tz(
        userTimeZone
      );
      const statusEndA = dayjs(friendA.following.Status.until).tz(userTimeZone);
      const statusStartB = dayjs(friendB.following.Status.started).tz(
        userTimeZone
      );
      const statusEndB = dayjs(friendB.following.Status.until).tz(userTimeZone);

      // Check if the status is active
      const isStatusActiveA =
        statusStartA.isBefore(currentTimeInUserTZ) &&
        statusEndA.isAfter(currentTimeInUserTZ);
      const isStatusActiveB =
        statusStartB.isBefore(currentTimeInUserTZ) &&
        statusEndB.isAfter(currentTimeInUserTZ);

      if (isStatusActiveA && !isStatusActiveB) return -1;
      if (!isStatusActiveA && isStatusActiveB) return 1;
    }

    // Sort by last activity if statuses are not available or have expired
    const lastActiveA = dayjs(friendA.following.lastActive).tz(userTimeZone);
    const lastActiveB = dayjs(friendB.following.lastActive).tz(userTimeZone);

    // Sort in descending order of last activity
    return lastActiveB.toDate().getTime() - lastActiveA.toDate().getTime();
  });
}

export default async function handler(req, res) {
  try {
    validateParams(req.query, ["email"]);
    const user: any = await prisma.user.findFirstOrThrow({
      where: {
        email: req.query.email,
      },
      select: {
        name: true,
        email: true,
        username: true,
        Profile: true,
        lastActive: true,
        timeZone: true,
      },
    });

    const friends: any = await prisma.follows.findMany({
      where: {
        OR: [
          {
            AND: [
              { following: { email: req.query.email } },
              { accepted: true },
            ],
          },
          {
            AND: [{ follower: { email: req.query.email } }, { accepted: true }],
          },
        ],
      },
      include: {
        follower: {
          select: {
            Status: true,
            name: true,
            email: true,
            color: true,
            timeZone: true,
            username: true,
            lastActive: true,
            Profile: {
              select: {
                birthday: true,
                spotify: true,
                picture: true,
                workingHours: true,
              },
            },
          },
        },
        following: {
          select: {
            Status: true,
            name: true,
            email: true,
            color: true,
            timeZone: true,
            username: true,
            lastActive: true,
            Profile: {
              select: {
                birthday: true,
                spotify: true,
                picture: true,
                workingHours: true,
              },
            },
          },
        },
      },
    });

    console.log(removeDuplicateFriends(friends));

    res.json({
      user,
      friends: sortFriendsByStatusAndActivity(
        removeDuplicateFriends(friends),
        "America/Los_Angeles"
      ),
    });
  } catch (e: any) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
}
