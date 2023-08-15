import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Box,
  Button,
  Divider,
  Icon,
  LinearProgress,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { green } from "@mui/material/colors";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { mutate } from "swr";
import { AgendaContext } from ".";
import { Task } from "../Task";
import { CreateTask } from "../Task/Create";
import SelectDateModal from "../Task/DatePicker";
import { ColumnMenu } from "./ColumnMenu";

const Column = React.memo(function Column({
  column,
  data,
  view,
}: any): JSX.Element {
  const scrollParentRef = useRef();
  const session = useSession();
  const router = useRouter();
  const isDark = useDarkMode(session.darkMode);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const palette = useColor(session.themeColor, isDark);

  const { url, type } = useContext(AgendaContext);

  const columnStart = dayjs(column).startOf(type).toDate();
  const columnEnd = dayjs(columnStart).endOf(type).toDate();

  const [isScrolling, setIsScrolling] = useState(false);

  const heading = {
    days: "dddd",
    weeks: "[Week #]W",
    months: "MMMM",
  }[type];

  const columnMap = {
    days: "day",
    weeks: "week",
    months: "month",
  }[type];

  const subheading = {
    days: "MMMM D",
    weeks: "MMMM D",
    months: "YYYY",
  }[type];

  const isToday = dayjs(column).isSame(dayjs().startOf(columnMap), type);
  const isPast = dayjs(column).isBefore(dayjs().startOf(columnMap), type);

  /**
   * Sort the tasks in a "[pinned, incompleted, completed]" order
   */
  const sortedTasks = useMemo(
    () =>
      data
        .filter((task) => {
          const dueDate = new Date(task.due);
          return dueDate >= columnStart && dueDate <= columnEnd;
        })
        .sort((e, d) =>
          e.completed && !d.completed
            ? 1
            : (!e.completed && d.completed) || (e.pinned && !d.pinned)
            ? -1
            : !e.pinned && d.pinned
            ? 1
            : 0
        ),
    [data, columnEnd, columnStart]
  );

  const completedTasks = useMemo(
    () => sortedTasks.filter((task) => task.completed),
    [sortedTasks]
  );
  const tasksLeft = sortedTasks.length - completedTasks.length;
  const [loading, setLoading] = useState(false);

  // stupid virtuoso bug where it only renders 1st set of items and scroll doesn't work on desktop!?
  const [shouldRenderVirtuo, setShouldRenderVirtuoso] = useState(false);

  // Use the useEffect hook to set the state variable after the initial render
  useEffect(() => {
    setShouldRenderVirtuoso(true);
  }, []);

  const header = (
    <Box
      sx={{
        pt: isMobile ? "65px" : 0,
        backdropFilter: { sm: "blur(20px)" },
        position: { sm: "sticky" },
        top: 0,
        left: 0,
        background: { sm: addHslAlpha(palette[1], 0.7) },
        zIndex: 99,
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: { sm: "1.5px solid" },
          borderColor: { sm: addHslAlpha(palette[3], 0.9) },
          height: { xs: "140px", sm: "120px" },
        }}
        id="taskMutationTrigger"
        onClick={async () => {
          setLoading(true);
          await mutate(url);
          setLoading(false);
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h4"
            className="font-heading"
            sx={{
              fontSize: {
                xs: "55px",
                sm: "35px",
              },
              ...(isToday && {
                color: "#000!important",
                background: `linear-gradient(${palette[7]}, ${palette[9]})`,
                px: 0.5,
                ml: -0.5,
              }),

              borderRadius: 1,
              width: "auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              ...(isPast && { opacity: 0.5 }),
              mb: 0.7,
            }}
          >
            {dayjs(column).format(heading)}
          </Typography>
          <ColumnMenu tasksLeft={tasksLeft} data={sortedTasks} day={column} />
        </Box>

        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: "17px",
          }}
        >
          <SelectDateModal
            date={dayjs(column).toDate()}
            setDate={(date) => {
              setTimeout(() => {
                router.push(
                  "/tasks/agenda/days/" + dayjs(date).format("YYYY-MM-DD")
                );
              }, 500);
            }}
            dateOnly
          >
            <Tooltip
              placement="bottom-start"
              title={
                <Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {isToday
                      ? "Today"
                      : capitalizeFirstLetter(dayjs(column).fromNow())}
                  </Typography>
                  <Typography variant="body2">
                    {dayjs(column).format("dddd, MMMM D, YYYY")}
                  </Typography>
                </Typography>
              }
            >
              <span
                style={{
                  ...(isPast && {
                    textDecoration: "line-through",
                    ...(isPast && { opacity: 0.5 }),
                  }),
                }}
              >
                {dayjs(column).format(subheading)}
                {type === "weeks" && " - " + dayjs(columnEnd).format("DD")}
              </span>
            </Tooltip>
          </SelectDateModal>
          <Typography
            variant="body2"
            sx={{
              ml: "auto",
              opacity: data.length === 0 ? 0 : tasksLeft === 0 ? 1 : 0.6,
            }}
          >
            {tasksLeft !== 0 ? (
              <>
                {tasksLeft} {isPast ? "unfinished" : "left"}
              </>
            ) : (
              <Icon
                sx={{
                  color: green[isDark ? "A700" : "800"],
                }}
                className="outlined"
              >
                check_circle
              </Icon>
            )}
          </Typography>
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      ref={scrollParentRef}
      {...(isToday && { id: "active" })}
      sx={{
        height: { sm: "100%" },
        flex: { xs: "0 0 100%", sm: "0 0 300px" },
        width: { xs: "100%", sm: "300px" },
        borderRight: "1.5px solid",
        ...(!isMobile && {
          overflowY: "scroll",
        }),
        ...(view === "priority" &&
          !isToday && {
            opacity: 0.2,
            filter: "blur(5px)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              opacity: 1,
              filter: "none",
            },
          }),
        ...(view === "priority" && {
          borderLeft: "1.5px solid",
        }),
        borderColor: palette[3],
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 999999999,
          }}
        />
      )}
      {header}
      <Box sx={{ p: 2, py: 1 }}>
        {session.permission !== "read-only" && (
          <CreateTask
            onSuccess={() => mutate(url)}
            defaultDate={dayjs(column).startOf(type).toDate()}
          >
            <Button variant="contained" fullWidth>
              <Icon>add_circle</Icon>
              New task
            </Button>
          </CreateTask>
        )}
        {type === "days" && isToday && (
          <Button
            onClick={() => router.push("/coach/routine")}
            variant="outlined"
            sx={{ mt: 1, borderWidth: "2px!important" }}
            fullWidth
            size="small"
          >
            <Icon>data_usage</Icon>
            Today&apos;s routine
          </Button>
        )}
      </Box>
      <Box sx={{ px: { sm: 1 }, height: { sm: "100%" } }}>
        {sortedTasks.filter((task) => !task.completed).length === 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mx: "auto",
              py: { sm: 2 },
              alignItems: { xs: "center", sm: "start" },
              textAlign: { xs: "center", sm: "left" },
              flexDirection: "column",
              "& img": {
                display: { sm: "none" },
              },
            }}
          >
            <Image
              src="/images/noTasks.png"
              width={256}
              height={256}
              style={{
                ...(isDark && {
                  filter: "invert(100%)",
                }),
              }}
              alt="No items found"
            />

            <Box sx={{ px: 1.5, maxWidth: "calc(100% - 50px)" }}>
              <Typography variant="h6" gutterBottom>
                {sortedTasks.length === 0
                  ? "Nothing planned for this time"
                  : "You finished everything!"}
              </Typography>
            </Box>
            <Box sx={{ width: "100%", mt: 1 }}>
              {sortedTasks.length !== 0 && <Divider sx={{ mt: 2, mb: -1 }} />}
            </Box>
          </Box>
        )}
        <Virtuoso
          useWindowScroll
          isScrolling={setIsScrolling}
          customScrollParent={scrollParentRef.current}
          data={sortedTasks}
          itemContent={(_, task) => (
            <Task
              isAgenda
              isDateDependent={true}
              key={task.id}
              isScrolling={isScrolling}
              board={task.board || false}
              columnId={task.column ? task.column.id : -1}
              mutationUrl={url}
              task={task}
            />
          )}
        />
        <Box sx={{ height: { xs: "calc(130px + var(--sab))", sm: "10px" } }} />
      </Box>
    </Box>
  );
});
export default Column;
