import LoadingButton from "@mui/lab/LoadingButton";
import { experimental_sx as sx } from "@mui/material/styles";
import hex2rgba from "hex-to-rgba";
import Head from "next/head";
import { NextRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import useSWR from "swr";
import Layout from "../components/Layout";
import { Error } from "../components/Layout/Error";
import { Loading } from "../components/Layout/Loading";
import { colors } from "../lib/colors";

// CSS files
import "../styles/globals.scss";
import "../styles/search.scss";

// Types
import { Property, Session } from "../types/session";

// Day.JS
import {
  Box,
  CircularProgress,
  createTheme,
  NoSsr,
  ThemeProvider,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

/**
 * Main function, including layout and theme.
 * @param data User session data
 * @param Component Top-level page component
 * @param pageProps Page props
 * @param router Next.JS router
 * @returns JSX.Element
 */
function RenderWithLayout({
  data,
  Component,
  pageProps,
  router,
}: {
  data: Session;
  Component: typeof React.Component;
  pageProps: JSX.Element;
  router: NextRouter;
}) {
  const [theme, setTheme] = useState<"dark" | "light">(
    data.user.darkMode ? "dark" : "light"
  );

  const [themeColor, setThemeColor] = useState(data.user.color);

  const [loadingButton, setLoadingButton] = useState(false);

  const [itemLimitReached, setItemLimitReached] = useState(true);
  global.itemLimitReached = itemLimitReached;
  global.setItemLimitReached = setItemLimitReached;

  if (data.user.darkMode) {
    document
      .querySelector(`meta[name="theme-color"]`)
      ?.setAttribute("content", "hsl(240, 11%, 10%)");
    document
      .querySelector(`link[rel="shortcut icon"]`)
      ?.setAttribute("href", "https://i.ibb.co/gtLtGLR/image-1.png");
  }

  global.user = data.user;
  global.theme = theme;
  global.themeColor = themeColor;
  global.setTheme = setTheme;
  global.setThemeColor = setThemeColor;

  useEffect(() => {
    if (data.user.darkMode) {
      document
        .querySelector(`meta[name="theme-color"]`)
        ?.setAttribute("content", "hsl(240, 11%, 10%)");
    }
  }, [data]);

  const userTheme = createTheme({
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
      },
      MuiIcon: {
        defaultProps: {
          // Replace the `material-icons` default value.
          baseClassName: "material-symbols-rounded",
        },
        variants: [
          {
            props: {
              className: "outlined",
            },
            style: {
              fontVariationSettings:
                '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 40!important',
            },
          },
        ],
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          contained: {
            boxShadow: "none!important",
            background:
              colors[themeColor][global.theme !== "dark" ? "800" : "50"] +
              "!important",
            color: colors[themeColor][global.theme !== "dark" ? "50" : "800"],
            ":disabled": {
              background: colors["grey"]["200"] + "!important",
            },
          },
          disabled: {
            background: colors["grey"]["200"] + "!important",
          },
          root: {
            transition: "none",
            textTransform: "none",
          },
        },
      },
      MuiMenu: {
        defaultProps: {
          BackdropProps: {
            sx: {
              opacity: "0!important",
            },
          },
        },
        styleOverrides: {
          root: sx({
            transition: "all .2s",
            "& .MuiPaper-root": {
              mt: 1,
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              ml: -1,
              borderRadius: "15px",
              minWidth: 180,
              background: global.user.darkMode
                ? colors[global.themeColor][900]
                : colors[global.themeColor][50],

              color: global.user.darkMode
                ? colors[global.themeColor][200]
                : colors[global.themeColor][800],
              "& .MuiMenu-list": {
                padding: "4px",
              },
              "& .MuiMenuItem-root": {
                gap: 2,
                "&:hover": {
                  background: global.user.darkMode
                    ? colors[global.themeColor][800]
                    : colors[global.themeColor][100],
                  color: global.user.darkMode
                    ? colors[global.themeColor][100]
                    : colors[global.themeColor][900],
                  "& .MuiSvgIcon-root": {
                    color: global.user.darkMode
                      ? colors[global.themeColor][200]
                      : colors[global.themeColor][800],
                  },
                },
                padding: "10px 15px",
                minHeight: 0,
                borderRadius: "15px",
                marginBottom: "1px",

                "& .MuiSvgIcon-root": {
                  fontSize: 25,
                  color: colors[global.themeColor][700],
                  marginRight: 1.9,
                },
                "&:focus": {
                  background:
                    (global.user.darkMode
                      ? colors[global.themeColor][900]
                      : colors[global.themeColor][100]) + "!important",
                },
                "&:active": {
                  background: global.user.darkMode
                    ? colors[global.themeColor][700]
                    : colors[global.themeColor][200],
                },
              },
            },
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: "none!important",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...(global.user.darkMode && {
              background: "hsl(240, 11%, 30%)",
            }),
          },
        },
      },
      MuiDrawer: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          paperAnchorBottom: {
            bottom: "0vh!important",
            margin: "auto",
          },
          root: {
            height: "100vh!important",
            overflow: "hidden!important",
          },
          paper: {
            boxShadow: "none !important",
            background: global.user.darkMode
              ? "hsl(240, 11%, 15%)"
              : colors[global.themeColor][50],
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: "5px",
            fontSize: "14px",
            color: global.user.darkMode
              ? "hsl(240, 11%, 30%)"
              : colors[themeColor]["50"],
            background: global.user.darkMode
              ? "hsl(240, 11%, 90%)"
              : colors[themeColor]["900"],
            paddingLeft: "13px",
            paddingRight: "13px",
            paddingTop: "5px",
            paddingBottom: "5px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    palette: {
      primary: {
        main: colors[themeColor][global.user.darkMode ? "A200" : "A700"],
      },
      mode: theme,
      ...(theme === "dark" && {
        background: {
          default: "hsl(240, 11%, 10%)",
          paper: "hsl(240, 11%, 10%)",
        },
        text: {
          primary: "hsl(240, 11%, 90%)",
        },
      }),
    },
  });

  // If theme is dark, add `.dark` class to body
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  // Return an error if user doesn't have any properties attached to their account
  if (data.user.properties.length === 0) {
    return (
      <Box>
        Hmmm.... You find yourself in a strange place. You don&apos;t have
        access to any groups, or there are none in your account. Please contact
        support if this problem persists.
      </Box>
    );
  }

  // find active property in the array of properties
  const selectedProperty =
    data.user.properties.find((property: Property) => property.selected) ||
    data.user.properties[0];

  global.property = selectedProperty;
  global.permission = selectedProperty.permission;

  // Used in `globals.scss`
  document.documentElement.style.setProperty(
    "--backdropTheme",
    theme === "dark"
      ? "rgba(23, 23, 28, .4)"
      : hex2rgba(colors[themeColor ?? "brown"]["600"], 0.3)
  );
  document.documentElement.style.setProperty(
    "--themeDark",
    colors[themeColor ?? "brown"][900]
  );

  const children = <Component {...pageProps} />;

  return (
    <>
      <Head>
        <title>Carbon</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
      </Head>
      <ThemeProvider theme={userTheme}>
        <Box>
          <Toaster />
          {
            // If the path is onboarding, show the onboarding page.
            window.location.pathname == "/onboarding" ? (
              children
            ) : data.user.onboardingComplete ? (
              // If the onboarding process is complete, show the app.
              <Layout>{children}</Layout>
            ) : (
              // If the onboarding process is not complete, redirect to the onboarding page.
              <LoadingButton
                ref={(i) => i && i.click()}
                loading={loadingButton}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => {
                  setLoadingButton(true);
                  router.push("/onboarding");
                }}
              >
                Click here if you&apos;re not being redirected
              </LoadingButton>
            )
          }
        </Box>
      </ThemeProvider>
    </>
  );
}

/**
 * Fetches user session data
 * @returns {any}
 */
function useUser(): {
  data: any;
  isLoading: boolean;
  isError: boolean;
  error: any;
} {
  const url = "/api/user";
  const { data, error } = useSWR(url, () =>
    fetch(url).then((res) => res.json())
  );

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    error: error,
  };
}

/**
 * Function to check whether to add a layout or not
 * @param router Next.JS router
 * @param Component Top-level page component
 * @param pageProps Page props
 * @returns JSX.Element
 */
function RenderRoot({
  router,
  Component,
  pageProps,
}: {
  router: NextRouter;
  Component: typeof React.Component;
  pageProps: JSX.Element;
}) {
  const urlsToDisplayWithoutLayout = [
    "/share/[index]",
    "/invite/[id]",
    "/auth/reset-password/[id]",
    "/auth/reset-id",
    "/_offline",
    "/404",
    "/scan",
    "/signup",
    "/auth",
    "/auth/signup",
    "/canny-auth",
  ];
  const disableLayout =
    urlsToDisplayWithoutLayout.includes(router.pathname) ||
    router.pathname === "/canny-auth";

  const { data, isLoading, error, isError } = useUser();
  global.user = data;

  return disableLayout ? (
    <NoSsr>
      <Component {...pageProps} />
      <Toaster />
    </NoSsr>
  ) : (
    <>
      {!isLoading && <Loading />}
      {isError && <Error message={error} />}
      {false && !isLoading && !isError && !data.error && (
        <RenderWithLayout
          router={router}
          Component={Component}
          pageProps={pageProps}
          data={data}
        />
      )}
      {!isLoading && !isError && data.error && (
        <Box
          sx={{
            background: "#6b4b4b",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              color: "#c4b5b5",
              alignItems: "center",
              gap: "10px",
              userSelect: "none",
              px: 2,
              pt: 2,
            }}
          >
            <picture>
              <img
                src="https://i.ibb.co/F7vSQPP/Carbon-Home-inventory-and-finance-tracking-2.png"
                width="80"
                height="80"
                alt="logo"
                style={{
                  borderRadius: "28px",
                }}
                draggable={false}
              />
            </picture>
            <Typography variant="h6" sx={{ mt: -0.5 }}>
              Carbon
            </Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress
              disableShrink
              ref={(i: any) => i && i.click()}
              size={20}
              sx={{
                color: "#c4b5b5",
              }}
              onClick={() => {
                router.push("/auth");
              }}
            />
          </Box>
        </Box>
      )}
    </>
  );
}

export default RenderRoot;
