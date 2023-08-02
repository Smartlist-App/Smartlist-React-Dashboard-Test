import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { useSession } from "@/lib/client/session";
import { useApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Box,
  Button,
  CircularProgress,
  Icon,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useEffect } from "react";
import Column from "./Column";

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);

export const AgendaContext = createContext<any>(null);

/**
 * Agenda container
 * "days": Opens days in week
 * "week": Opens weeks in month
 * "months": Opens months in year
 *
 * @param {string} type
 * @param {string} date
 */
export function Agenda({ type, date }) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");

  const columnMap = {
    days: isMobile ? "day" : "week",
    weeks: isMobile ? "week" : "month",
    months: isMobile ? "month" : "year",
  };

  const viewHeadingFormats = {
    days: "MMMM YYYY",
    weeks: "MMMM",
    months: "YYYY",
  };

  const viewSubHeadingFormats = {
    days: "[Week] W",
    weeks: "YYYY",
    months: "-",
  };

  const handleNext = () =>
    router.push(
      `/tasks/agenda/${type}/${dayjs(date)
        .add(1, columnMap[type])
        .format("YYYY-MM-DD")}`
    );

  const handlePrev = () =>
    router.push(
      `/tasks/agenda/${type}/${dayjs(date)
        .subtract(1, columnMap[type])
        .format("YYYY-MM-DD")}`
    );

  const start = dayjs(date).startOf(columnMap[type]);
  const end = dayjs(date).endOf(columnMap[type]);

  // Create an array of columns for each [type] in [columnMap]
  const columns = Array.from(
    { length: Math.ceil(end.diff(start, type, true)) },
    (_, index) => start.clone().add(index, type)
  );

  const { data, url, error } = useApi("property/tasks/agenda", {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  });

  const session = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  useEffect(() => {
    const column = document.getElementById("active");
    if (data && column) {
      column.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [data]);

  return (
    <AgendaContext.Provider value={{ start, end, url, type }}>
      <Head>
        <title>
          {dayjs(start).format(viewHeadingFormats[type])} &bull;{" "}
          {dayjs(start).format(viewSubHeadingFormats[type])}
        </title>
      </Head>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
          minHeight: "100dvh",
        }}
      >
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          style={{ width: "100%" }}
        >
          <Box
            sx={{
              px: 4,
              py: 1.5,
              textAlign: "left",
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              background: `linear-gradient(${palette[1]}, ${palette[2]})`,
              width: "100%",
            }}
          >
            <Box>
              <AnimatePresence mode="wait">
                <motion.div
                  key={dayjs(start).format(viewHeadingFormats[type])}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Typography sx={{ fontWeight: 900 }}>
                    {dayjs(start).format(viewHeadingFormats[type])}
                  </Typography>
                  {viewSubHeadingFormats[type] !== "-" && (
                    <Typography variant="body2" sx={{ mt: -0.5 }}>
                      {dayjs(start).format(viewSubHeadingFormats[type])}
                    </Typography>
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <IconButton onClick={handlePrev} id="agendaPrev">
                <Icon className="outlined">arrow_back_ios_new</Icon>
              </IconButton>
              <Button
                id="agendaToday"
                onClick={() =>
                  router.push(
                    `/tasks/agenda/${type}/${dayjs().format("YYYY-MM-DD")}`
                  )
                }
                disabled={dayjs(start) <= dayjs() && dayjs() <= dayjs(end)}
                size="large"
                sx={{
                  px: 0,
                  color: "inherit",
                  ...(dayjs(start) <= dayjs() &&
                    dayjs() <= dayjs(end) && { display: "none" }),
                }}
              >
                Today
              </Button>
              <IconButton onClick={handleNext} id="agendaNext">
                <Icon className="outlined">arrow_forward_ios</Icon>
              </IconButton>
            </Box>
          </Box>
        </motion.div>
        <Box
          sx={{
            ...(!data && {
              alignItems: "center",
              justifyContent: "center",
            }),
            display: "flex",
            flexDirection: "row",
            flexGrow: 1,
            maxWidth: "100%",
            overflowX: "scroll",
            width: "100%",
            height: "100%",
          }}
        >
          {data ? (
            columns.map((column: any) => (
              <Column key={column} column={column} data={data} />
            ))
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Box>
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: {
              xs: "70px",
              md: "30px",
            },
            ".hideBottomNav &": {
              bottom: {
                xs: "30px",
                md: "30px",
              },
            },
            opacity: 1,
            mr: {
              xs: 1.5,
              md: 3,
            },
            zIndex: 9,
            background: addHslAlpha(palette[3], 0.5),
            border: "1px solid",
            transition: "transform .2s, opacity .2s, bottom .3s",
            backdropFilter: "blur(10px)",
            borderRadius: 999,
            borderColor: addHslAlpha(palette[3], 0.5),
            right: "0",
            color: isDark ? "#fff" : "#000",
            display: "flex",
            alignItems: "center",
            p: 0.5,
          }}
        >
          <IconButton
            sx={{ color: palette[8] }}
            onClick={() => document.getElementById("agendaPrev")?.click()}
          >
            <Icon className="outlined">arrow_back_ios_new</Icon>
          </IconButton>
          <Button
            id="agendaToday"
            onClick={() => document.getElementById("agendaToday")?.click()}
            disabled={
              dayjs(start) <= dayjs() && dayjs() <= dayjs(end) ? true : false
            }
            size="large"
            sx={{ px: 0 }}
          >
            Today
          </Button>
          <IconButton
            sx={{ color: palette[8] }}
            onClick={() => document.getElementById("agendaNext")?.click()}
          >
            <Icon className="outlined">arrow_forward_ios</Icon>
          </IconButton>
        </Box>
      )}
    </AgendaContext.Provider>
  );
}
