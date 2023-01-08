"use client";
import {
  Box,
  Snackbar,
  Tab,
  Tabs,
  useMediaQuery,
  useScrollTrigger,
} from "@mui/material";
import hexToRgba from "hex-to-rgba";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React from "react";
import { colors } from "../../lib/colors";

/**
 * Bottom navigation bar
 * @returns {any}
 */
export function BottomNav() {
  const trigger = useScrollTrigger({
    threshold: 0,
    target: window ? window : undefined,
  });
  const pathname = usePathname();

  const styles = (active) => {
    return {
      borderRadius: 3,
      textTransform: "none",
      color: global.theme === "dark" ? "hsl(240,11%,90%)" : "#303030",
      height: "70px",
      "& .material-symbols-rounded, & .material-symbols-outlined": {
        height: "24px",
      },
      fontWeight: "200",
      ...(active && {
        fontWeight: "700",
        color:
          colors[themeColor][global.user.darkMode ? 100 : 800] + "!important",
      }),
    };
  };

  const router = useRouter();
  const [value, setValue] = React.useState<number>(0);

  React.useEffect(() => {
    const url = pathname;
    switch (url) {
      case "":
      case "/":
      case "/tasks":
        setValue(0);
        break;
      case "/trash":
      case "/items":
        setValue(2);
        break;
      case "/coach":
        setValue(1);
        break;
      case "/spaces":
        setValue(3);
        break;
      default:
        if (pathname.includes("/rooms")) {
          setValue(2);
        } else {
          setValue(0);
        }
    }
  }, [router, pathname]);

  /**
   * Handles button click
   * @param {any} href
   * @returns {any}
   */
  const onLink = (href: string) => {
    router.push(href);
  };
  const matches = useMediaQuery("(max-height: 400px)");

  return (
    <>
      <Snackbar
        open={window && window.navigator.onLine === false}
        autoHideDuration={6000}
        onClose={() => null}
        sx={{ mb: trigger ? 6.5 : 9, transition: "all .3s" }}
        message="You're offline. Please check your network connection."
      />
      <Box
        sx={{
          width: "100%",
          position: "fixed",
          bottom: matches ? -100.1 : trigger ? -71 : 0,
          left: 0,
          transition: "bottom .3s",
          overflowX: "hidden",
          display: {
            xs: "block",
            md: "none",
          },
          [`@media (max-height: 500px)`]: {
            display: "none",
          },
          zIndex: 999,
          height: "70px",
          "&, & *": {
            overflow: "hidden!important",
          },
          background: global.user.darkMode
            ? "hsla(240, 11%, 10%, .9)"
            : hexToRgba("#fff", 0.4),
          borderTop: global.user.darkMode
            ? "1px solid hsla(240, 11%, 20%, .8)"
            : "1px solid rgba(200,200,200,.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Tabs
          TabIndicatorProps={{
            children: <span className="MuiTabs-indicatorSpan" />,
          }}
          variant="fullWidth"
          value={value}
          aria-label="basic tabs example"
          sx={{
            overflowX: "hidden",
            height: "100%",
            "& .MuiTabs-indicator": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              height: "100%",
            },
            "& .MuiTabs-indicatorSpan": {
              minWidth: "65px",
              width: "50%",
              height: 34,
              mt: -2.855,
              backgroundColor: global.user.darkMode
                ? "rgba(153, 153, 158, .1)"
                : hexToRgba(colors[themeColor][500], 0.2),
              borderRadius: 3,
            },
          }}
        >
          <Tab
            disableRipple
            sx={styles(
              pathname == "/tasks" ||
                pathname == "/" ||
                pathname == "" ||
                pathname.includes("/tasks")
            )}
            icon={
              <span
                className={`material-symbols-${
                  pathname == "/tasks" ||
                  pathname == "/" ||
                  pathname == "" ||
                  pathname.includes("/tasks")
                    ? "rounded"
                    : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                verified
              </span>
            }
            label="Lists"
            onClick={() => router.push("/tasks").then(() => setValue(0))}
          />

          <Tab
            disableRipple
            onDoubleClick={() => {
              router.push("/coach").then(() => {
                setTimeout(() => {
                  document.getElementById("routineTrigger")?.click();
                }, 500);
              });
            }}
            sx={styles(pathname == "/coach")}
            icon={
              <span
                className={`material-symbols-${
                  pathname == "/coach" ? "rounded" : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                routine
              </span>
            }
            label="Coach"
            onClick={() => router.push("/coach").then(() => setValue(1))}
          />
          <Tab
            disableRipple
            sx={styles(pathname == "/items" || pathname.includes("rooms"))}
            icon={
              <span
                className={`material-symbols-${
                  pathname == "/items" || pathname.includes("rooms")
                    ? "rounded"
                    : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                category
              </span>
            }
            label="Items"
            onClick={() => router.push("/items").then(() => setValue(2))}
          />
          <Tab
            disableRipple
            sx={styles(pathname == "/spaces")}
            icon={
              <span
                className={`material-symbols-${
                  pathname == "/spaces" ? "rounded" : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                view_agenda
              </span>
            }
            label="Spaces"
            onClick={() => router.push("/spaces").then(() => setValue(3))}
          />
        </Tabs>
      </Box>
    </>
  );
}
