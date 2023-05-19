import { useApi } from "@/lib/client/useApi";
import { useSession } from "@/lib/client/useSession";
import { vibrate } from "@/lib/client/vibration";
import { colors } from "@/lib/colors";
import {
  Box,
  CardActionArea,
  CircularProgress,
  Icon,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { mutate } from "swr";
import { ErrorHandler } from "../Error";
import { Task } from "./Board/Column/Task";
import { taskStyles } from "./Layout";

export function ColoredTasks({ setDrawerOpen }) {
  const { data, url, error } = useApi("property/tasks/color-coded", {
    date: dayjs().startOf("day").subtract(1, "day").toISOString(),
  });
  const [color, setColor] = useState("all");

  const session = useSession();

  if (!data) {
    return (
      <Box
        sx={{
          width: "100%",
          height: {
            xs: "calc(100vh - var(--navbar-height) - 55px)",
            sm: "100vh",
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Head>
        <title>Color coded</title>
      </Head>
      <IconButton
        size="large"
        onContextMenu={() => {
          vibrate(50);
          setDrawerOpen(true);
        }}
        onClick={() => setDrawerOpen(true)}
        sx={taskStyles(session).menu}
      >
        <Icon>menu</Icon>
      </IconButton>

      {data && data.length > 0 && (
        <Box sx={{ p: 3, pb: 1, pt: 5 }}>
          <Typography className="font-heading" variant="h4" gutterBottom>
            Color coded
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {data.length} task{data.length !== 1 && "s"}
          </Typography>
          {error && (
            <ErrorHandler
              callback={() => mutate(url)}
              error="Yikes! An error occured while trying to fetch your color coded tasks. Please try again later."
            />
          )}
          {[
            "all",
            "orange",
            "red",
            "pink",
            "purple",
            "indigo",
            "teal",
            "green",
            "grey",
          ].map((c) => (
            <CardActionArea
              key={c}
              onClick={() => setColor(c)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "inline-flex",
                mr: 1,
                mb: 1,
                backgroundColor: `${
                  colors[c === "all" ? "blueGrey" : c][
                    c === "all" ? "100" : "400"
                  ]
                }!important`,
                "&:hover": {
                  backgroundColor: `${
                    colors[c === "all" ? "blueGrey" : c][
                      c === "all" ? "200" : "500"
                    ]
                  }!important`,
                },
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  margin: "auto",
                  opacity:
                    color === c || (color === "all" && c === "all") ? 1 : 0,
                  color: "#000",
                }}
              >
                {c === "all" ? "close" : "check"}
              </span>
            </CardActionArea>
          ))}
        </Box>
      )}
      <Box
        sx={{ px: { sm: 2 }, pb: data.length == 0 ? 0 : 15, maxWidth: "100vw" }}
      >
        {data.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              userSelect: "none",
              height: {
                xs: "calc(100vh - var(--navbar-height) - 55px)",
                sm: "100vh",
              },
            }}
          >
            <Image
              src="/images/colorCoded.png"
              width={256}
              height={256}
              alt="Backlog"
              style={{
                ...(session.user.darkMode && {
                  filter: "invert(100%)",
                }),
              }}
            />
            <Box sx={{ width: "300px", maxWidth: "calc(100vw - 40px)", mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: -2 }}>
                Add some color!
              </Typography>
              <Typography variant="body1">
                Try adding a color to an incomplete task, and it&apos;ll appear
                here.
              </Typography>
            </Box>
          </Box>
        )}
        {[
          ...data
            .filter((task) => color === "all" || task.color === color)
            .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1)),
        ].map((task) => (
          <Task
            key={task.id}
            board={task.board || false}
            columnId={task.column ? task.column.id : -1}
            mutationUrl={url}
            task={task}
          />
        ))}
        {!data.find((task) => color === "all" || task.color === color) &&
          data.length >= 1 && (
            <Box sx={{ textAlign: "center", mt: 5 }}>
              <Box
                sx={{
                  textAlign: "center",
                  display: "inline-flex",
                  mx: "auto",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  background: `hsl(240,11%,${
                    session.user.darkMode ? 30 : 95
                  }%)`,
                  borderRadius: 5,
                  userSelect: "none",
                }}
              >
                <Image
                  src="/images/colorCoded.png"
                  width={256}
                  height={256}
                  alt="Backlog"
                  style={{
                    ...(session.user.darkMode && {
                      filter: "invert(100%)",
                    }),
                  }}
                />
                <Box
                  sx={{
                    width: "300px",
                    maxWidth: "calc(100vw - 40px)",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ mt: -2 }}>
                    Add some color!
                  </Typography>
                  <Typography variant="body1">
                    Try adding a color to an incomplete task, and it&apos;ll
                    appear here.
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
      </Box>
    </Box>
  );
}
