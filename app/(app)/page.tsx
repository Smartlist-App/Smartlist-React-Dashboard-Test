"use client";

import { containerRef } from "@/app/(app)/container";
import { ErrorHandler } from "@/components/Error";
import { Navbar } from "@/components/Layout/Navigation/Navbar";
import { AvailabilityTrigger } from "@/components/Start/AvailabilityTrigger";
import { Friend } from "@/components/Start/Friend";
import { FriendsTrigger } from "@/components/Start/FriendsTrigger";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Alert,
  Box,
  Icon,
  IconButton,
  NoSsr,
  Skeleton,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import dayjs from "dayjs";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";
import { Virtuoso } from "react-virtuoso";
import useSWR from "swr";
import { HeadingComponent } from "../../components/Start/HeadingComponent";
import { fetcher } from "./fetcher";
import { swipeablePageStyles } from "./swipeablePageStyles";
import weatherCodes from "./tasks/Layout/widgets/weatherCodes.json";
const ContactSync = dynamic(() => import("@/components/Start/ContactSync"));
function Weather() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  const [locationData, setLocationData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  const isNight = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour <= 6; // Assuming night is between 6 PM and 6 AM
  };

  const getWeather = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
      fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`)
        .then((res) => res.json())
        .then((res) => setLocationData(res));
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1&daily=temperature_2m_max,temperature_2m_min`;
      const res = await fetch(url).then((res) => res.json());
      setWeatherData(res);
    });
  };

  useEffect(() => {
    getWeather();
    const interval = setInterval(getWeather, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const [open, setOpen] = useState(false);

  return weatherData ? (
    <>
      <SwipeableDrawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="bottom"
        PaperProps={{
          sx: {
            color:
              weatherCodes[weatherData.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].textColor,
            background: `linear-gradient(${
              weatherCodes[weatherData.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].backgroundGradient[0]
            },${
              weatherCodes[weatherData.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].backgroundGradient[1]
            })`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h2" className="font-heading" sx={{ mb: -0.5 }}>
            {-~weatherData.current_weather.temperature}&deg;
          </Typography>
          <Typography variant="h6">
            {isNight()
              ? weatherCodes[weatherData.current_weather.weathercode].night
                  .description
              : weatherCodes[weatherData.current_weather.weathercode].day
                  .description}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mt: 1,
              "& .MuiTypography-root": {
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                background: "rgba(255,255,255,.1)",
                borderRadius: 5,
              },
            }}
          >
            <Typography>
              <Icon>north</Icon>
              {-~weatherData.daily.temperature_2m_max[0]}&deg;
            </Typography>
            <Typography>
              <Icon>south</Icon>
              {-~weatherData.daily.temperature_2m_min[0]}&deg;
            </Typography>
            <Typography>
              <Icon className="outlined">water_drop</Icon>
              {-~weatherData.hourly.precipitation_probability[dayjs().hour()]}%
            </Typography>
          </Box>
          <motion.div
            initial={{ opacity: 0 }}
            transition={{ delay: 1 }}
            animate={{ opacity: 1 }}
          >
            <Sparklines
              data={weatherData.hourly.temperature_2m}
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                zIndex: 0,
                opacity: 0.2,
                width: "100%",
              }}
            >
              <SparklinesSpots style={{ display: "none" }} />
              <SparklinesLine
                style={{
                  fill: weatherCodes[weatherData.current_weather.weathercode][
                    isNight() ? "night" : "day"
                  ].textColor,
                  strokeWidth: 2,
                }}
                color={
                  weatherCodes[weatherData.current_weather.weathercode][
                    isNight() ? "night" : "day"
                  ].textColor
                }
              />
            </Sparklines>
          </motion.div>
        </Box>
      </SwipeableDrawer>
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, sm: 3 },
          borderRadius: 5,
          background: palette[3],
          color: palette[11],
          height: "130px",
        }}
        onClick={() => setOpen(true)}
      >
        <Icon sx={{ fontSize: "40px!important" }} className="outlined">
          light_mode
        </Icon>
        <Typography sx={{ ml: 0.2 }} variant="h5">
          {-~weatherData.current_weather.temperature}&deg;
        </Typography>
        <Typography sx={{ ml: 0.2 }} variant="body2">
          {isNight()
            ? weatherCodes[weatherData.current_weather.weathercode].night
                .description
            : weatherCodes[weatherData.current_weather.weathercode].day
                .description}
        </Typography>
      </Box>
    </>
  ) : (
    <Skeleton variant="rectangular" width="100%" height={130} />
  );
}

function TodaysDate() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 5,
        background: palette[3],
        color: palette[11],
      }}
    >
      <Icon sx={{ fontSize: "40px!important" }} className="outlined">
        calendar_today
      </Icon>
      <Typography sx={{ ml: 0.2 }} variant="h5">
        Sunday
      </Typography>
      <Typography sx={{ ml: 0.2 }} variant="body2">
        Nov 12th
      </Typography>
    </Box>
  );
}

function TodaysTasks() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 5,
        background: palette[3],
        color: palette[11],
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Icon sx={{ fontSize: "40px!important" }} className="outlined">
        check_circle
      </Icon>
      <Box>
        <Typography variant="h5">5 tasks</Typography>
        <Typography variant="body2">3 complete</Typography>
      </Box>
    </Box>
  );
}

function Home() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);
  const isMobile = useMediaQuery("(max-width: 600px)");

  const params: any = ["user/friends", { email: session.user.email }];

  const { data, error, mutate } = useSWR(
    params,
    fetcher(params, session) as any,
    {
      refreshInterval: 5000,
    }
  );

  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: 1,
    active: isMobile,
  });

  const [loadingIndex, setLoadingIndex] = useState(1);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("scroll", (e) => {
        if (e.selectedScrollSnap() == 0) {
          setLoadingIndex(0);
          document.getElementById("link1")?.click();
          // router.push("/tasks/home");
        } else if (e.selectedScrollSnap() == 2) {
          setLoadingIndex(2);
          document.getElementById("link3")?.click();
          // router.push("/rooms");
        } else {
          setLoadingIndex(1);
        }
      });
    }
  }, [emblaApi, router]);

  const sectionHeaderStyles = {
    textTransform: "uppercase",
    fontWeight: 900,
    fontSize: "14px",
    opacity: 0.6,
    mb: 1.5,
    mt: 3,
    color: palette[11],
  };

  return (
    <Box
      sx={{
        background: `radial-gradient(${palette[2]} 4px, ${palette[1]} 5px, transparent 0)`,
        backgroundSize: "50px 50px",
        // backgroundAttachment: "fixed",
        backgroundPosition: "-25px -25px",
      }}
    >
      {isMobile ? (
        <Navbar
          showLogo={isMobile}
          showRightContent={isMobile}
          right={
            <IconButton sx={{ background: palette[3] }}>
              <Icon className="outlined">workspaces</Icon>
            </IconButton>
          }
        />
      ) : (
        <Toolbar />
      )}
      <Box
        sx={{
          maxWidth: "100dvw",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          mt: "env(titlebar-area-height)",
          ...(loadingIndex !== 1 && {
            pointerEvents: "none",
          }),
        }}
        ref={emblaRef}
      >
        <Box sx={{ display: "flex" }}>
          {isMobile && (
            <Box
              sx={{
                flex: "0 0 100dvw",
              }}
            >
              <Box
                sx={{
                  transform: `scale(${loadingIndex === 0 ? 1.5 : 1})`,
                  transition: "all .4s cubic-bezier(.17,.67,.57,1.39)",
                }}
              >
                <Box sx={swipeablePageStyles(palette, "left")}>
                  <Icon>check_circle</Icon>
                  <Typography variant="h4" className="font-heading">
                    Tasks
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          <Box sx={{ flex: "0 0 100dvw" }}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }}>
              <Box
                sx={{
                  pt: { xs: 7, sm: 15 },
                }}
              >
                <Box
                  sx={{
                    mb: { xs: 2, sm: 2 },
                    px: { xs: 4, sm: 6 },
                  }}
                >
                  <Typography
                    sx={{
                      ...sectionHeaderStyles,
                      mb: 0,
                      ml: 0.1,
                      textShadow: `0 0 40px ${palette[8]}`,
                    }}
                  >
                    Hey{" "}
                    {capitalizeFirstLetter(session.user.name.split(" ")?.[0])},
                  </Typography>
                  <HeadingComponent palette={palette} isMobile={isMobile} />
                  <Typography
                    sx={{
                      mt: -1,
                      ml: 0.2,
                      fontWeight: 700,
                      color: palette[11],
                      opacity: 0.8,
                      textShadow: `0 0 40px ${palette[8]}`,
                    }}
                    variant="h6"
                  >
                    Are you ready to seize the day?
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  px: 3,
                  maxWidth: "100dvw",
                  display: "flex",
                  gap: 2,
                  "& .button": {
                    background: palette[3],
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    gap: 2,
                    fontWeight: 700,
                    color: palette[11],
                    "& .MuiIcon-root": {
                      fontSize: "30px!important",
                    },
                  },
                }}
              >
                <AvailabilityTrigger />
                <FriendsTrigger />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  mx: "auto",
                  width: "100%",
                  maxWidth: { sm: "500px" },
                  px: 3,
                  flexDirection: "column",
                }}
              >
                <Typography sx={sectionHeaderStyles}>
                  Today&apos;s rundown
                </Typography>
                <Box>
                  <Grid container sx={{ mb: 2 }} spacing={2}>
                    <Grid xs={6}>
                      <Weather />
                    </Grid>
                    <Grid xs={6}>
                      <TodaysDate />
                    </Grid>
                    <Grid xs={12}>
                      <TodaysTasks />
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mb: 5 }}>
                  <Typography sx={sectionHeaderStyles}>
                    Recent activity
                  </Typography>
                  {data?.length === 0 && (
                    <Alert
                      sx={{
                        mb: -2,
                        mt: 2,
                        background: palette[3],
                        color: palette[12],
                      }}
                      severity="info"
                      icon={
                        <Icon sx={{ color: palette[12] }} className="outlined">
                          info
                        </Icon>
                      }
                    >
                      Friends will appear here!
                    </Alert>
                  )}

                  {data ? (
                    data?.friends?.length > 0 && (
                      <Virtuoso
                        initialItemCount={
                          data.friends.length < 5 ? data.friends.length : 5
                        }
                        customScrollParent={
                          isMobile ? undefined : containerRef.current
                        }
                        useWindowScroll
                        totalCount={data.friends.length}
                        itemContent={(i) => (
                          <Friend
                            mutate={mutate}
                            friend={
                              data.friends[i].follower ||
                              data.friends[i].following
                            }
                            key={i}
                          />
                        )}
                      />
                    )
                  ) : error ? (
                    <ErrorHandler
                      callback={mutate}
                      error="Couldn't load your friends. Try again later."
                    />
                  ) : (
                    <>
                      {[...new Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            mb: 2,
                            px: 2,
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                            border: "2px solid",
                            borderColor: palette[3],
                            borderRadius: 5,
                            height: 95,
                          }}
                        >
                          <Skeleton
                            variant="circular"
                            width={50}
                            height={50}
                            sx={{ mt: -1 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton
                              width={"90%"}
                              height={35}
                              sx={{ mt: -1 }}
                            />
                            <Skeleton width={"50%"} sx={{ mt: -0.1 }} />
                          </Box>
                        </Box>
                      ))}
                    </>
                  )}
                </Box>
                <ContactSync showFriends={data?.friends?.length === 0} />
              </Box>
              <Toolbar />
            </motion.div>
          </Box>
          {isMobile && session.space.info.type !== "study group" && (
            <Box sx={{ flex: "0 0 100dvw" }}>
              <Box
                sx={{
                  transform: `scale(${loadingIndex === 2 ? 1.5 : 1})`,
                  transition: "all .4s cubic-bezier(.17,.67,.57,1.39)",
                }}
              >
                <Box sx={swipeablePageStyles(palette, "right")}>
                  <Icon>package_2</Icon>
                  <Typography variant="h4" className="font-heading">
                    Inventory
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function Page() {
  return (
    <NoSsr>
      <Home />
    </NoSsr>
  );
}
