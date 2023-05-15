import { useApi } from "@/lib/client/useApi";
import { Box, CircularProgress, Typography } from "@mui/material";
import dayjs from "dayjs";
import { mutate } from "swr";
import { ErrorHandler } from "../../Error";

export function RoutineEnd({ routineId = "-1" }) {
  const { data, url, error } = useApi("user/routines/custom-routines/items", {
    ...(routineId !== "-1" && { id: routineId }),
  });

  const tasksRemaining = !data
    ? []
    : data[0].items.filter(
        (task) => task.lastCompleted !== dayjs().format("YYYY-MM-DD")
      );

  // If the data is available, the data returns an array of objects. Sort the array of objects by the `time` key, which can be a string containing the values: "morning", "afternoon", "evening", "night", "any". Sort them in the order: morning, any, afternoon, evening, night. This will ensure that the tasks are displayed in the correct order.
  const sortedTasks = !data
    ? []
    : data[0].items.filter((task) => task.durationDays - task.progress > 0);

  return data ? (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <picture>
          <img
            src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${
              tasksRemaining.length === 0 ? "1f389" : "1f449"
            }.png`}
            alt="Tada"
          />
        </picture>
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {tasksRemaining.length === 0 ? (
          <>
            You worked towards
            <br /> {sortedTasks.length} goal{sortedTasks.length !== 1 && "s"}!
          </>
        ) : (
          <>
            You have {tasksRemaining.length} goal
            {tasksRemaining.length !== 1 && "s"} left to finish
          </>
        )}
      </Typography>
      {error && (
        <ErrorHandler
          error="Yikes! An error occured while trying to check your progress. Please try again later."
          callback={() => mutate(url)}
        />
      )}
    </div>
  ) : (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        width: "100%",
      }}
    >
      <CircularProgress
        color="inherit"
        sx={{
          "&, & *": {
            stroke: "#fff",
          },
        }}
      />
    </Box>
  );
}
