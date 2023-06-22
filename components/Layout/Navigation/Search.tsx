import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { fetchRawApi, useApi } from "@/lib/client/useApi";
import { useColor } from "@/lib/client/useColor";
import { useSession } from "@/lib/client/useSession";
import { toastStyles } from "@/lib/client/useTheme";
import {
  Box,
  Chip,
  Icon,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  TextField,
} from "@mui/material";
import * as colors from "@radix-ui/colors";
import Router from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { Virtuoso } from "react-virtuoso";
import { mutate } from "swr";
import { updateSettings } from "../../../lib/client/updateSettings";
import { debounce } from "../../EmojiPicker";
import { Puller } from "../../Puller";

export let openSpotlight = () => {};

export let getSpotlightActions = async (roomData, boardData, session) => {
  const router = Router;

  return [
    {
      title: "Start",
      onTrigger: () => router.push("/"),
      icon: "change_history",
    },
    {
      title: "Coach",
      onTrigger: () => router.push("/coach"),
      icon: "rocket_launch",
    },
    {
      title: "Daily routine",
      badge: "Coach",
      onTrigger: () => router.push("/coach/routine"),
      icon: "routine",
    },
    {
      title: "Items",
      onTrigger: () => router.push("/items"),
      icon: "category",
    },
    {
      title: "Days",
      onTrigger: () => router.push("/tasks/agenda/day"),
      icon: "calendar_today",
      badge: "Agenda",
    },
    {
      title: "Weeks",
      onTrigger: () => router.push("/tasks/agenda/week"),
      icon: "view_week",
      badge: "Agenda",
    },
    {
      title: "Months",
      onTrigger: () => router.push("/tasks#/agenda/month"),
      icon: "calendar_view_month",
      badge: "Agenda",
    },
    {
      title: "Years",
      onTrigger: () => router.push("/tasks#/agenda/year"),
      icon: "calendar_month",
      badge: "Agenda",
    },
    {
      title: "Backlog",
      onTrigger: () => router.push("/tasks#/agenda/backlog"),
      icon: "auto_mode",
      badge: "Agenda",
    },
    {
      title: "Light mode",
      badge: "Appearance",
      onTrigger: async () => {
        await updateSettings("darkMode", "false");
        mutate("/api/session");
      },
      icon: "light_mode",
    },
    {
      title: "Dark mode",
      badge: "Appearance",
      onTrigger: async () => {
        await updateSettings("darkMode", "true");
        mutate("/api/session");
      },
      icon: "dark_mode",
    },

    ...Object.keys(colors)
      .filter((color) => !color.includes("Dark"))
      .filter((color) => !color.endsWith("A"))
      .map((color) => ({
        title: `Change color to ${capitalizeFirstLetter(color)}`,
        badge: "Appearance",
        onTrigger: () => {
          updateSettings("color", color.toLowerCase());
        },
        icon: (
          <Box
            sx={{
              background: colors[color] && colors[color][color + 9],
              width: "20px",
              height: "20px",
              borderRadius: 999,
            }}
          />
        ),
      })),

    ...["week", "month", "year"].map((e) => {
      return {
        title: capitalizeFirstLetter(e),
        onTrigger: () => router.push(`/tasks/#/agenda/${e}`),
        icon: "today",
        badge: "agenda",
      };
    }),
    ...(roomData
      ? roomData.map((room: any) => {
          return {
            title: room.name,
            onTrigger: () => router.push(`/rooms/${room.id}`),
            icon: "category",
            badge: "Room",
          };
        })
      : []),

    ...(boardData
      ? boardData.map((room: any) => {
          return {
            title: room.name,
            onTrigger: () => router.push(`/tasks#${room.id}`),
            icon: (
              <Icon className="outlined">
                {room.type === "board" ? "view_kanban" : "task_alt"}
              </Icon>
            ),
            badge: room.type === "board" ? "Board" : "Checklist",
          };
        })
      : []),

    ...(session?.user && session.properties
      ? session.properties.map((property: any) => {
          return {
            title: property.profile.name,
            onTrigger: () => {
              router.push("/tasks/agenda/week");
              fetchRawApi("property/switch", {
                email: session.user.email,
                accessToken1: property.accessToken,
              }).then((res) => {
                toast.success(
                  <span>
                    Switched to &nbsp;<u>{res.profile.name}</u>
                  </span>,
                  toastStyles
                );
                mutate("/api/session");
              });
            },
            icon: "tag",
            badge: "Group",
          };
        })
      : []),
    {
      title: "Settings",
      onTrigger: () => router.push("/settings"),
      icon: "settings",
      badge: "Settings",
    },
    {
      title: "Restart onboarding",
      onTrigger: () => router.push("/onboarding"),
      icon: "settings",
      badge: "Settings",
    },
    {
      title: "Friends",
      onTrigger: () => router.push("/users"),
      icon: "group",
    },
    ...[
      "Account",
      "Appearance",
      "Login Activity",
      "Notifications",
      "Two-factor authentication",
    ].map((setting) => ({
      title: setting,
      onTrigger: () =>
        router.push(`/settings/${setting.toLowerCase().replaceAll(" ", "-")}`),
      icon: "settings",
      badge: "settings",
    })),
    {
      title: "Sign out",
      onTrigger: () => {
        toast.promise(
          fetchRawApi("auth/logout").then(() => mutate("/api/session")),
          {
            loading: "Signing you out",
            error: "Oh no! An error occured while trying to sign you out.",
            success: "Redirecting you...",
          },
          toastStyles
        );
      },
      icon: "logout",
    },
    {
      title: "Discord",
      onTrigger: () => {
        window.open("https://discord.gg/fvngmDzh77");
      },
      icon: "chat_bubble",
    },
  ];
};

export default function Spotlight() {
  // Primarily state management and callback functions for opening/closing the modal
  const ref: any = useRef();
  const session: any = useSession();

  const [open, setOpen] = useState<boolean>(false);
  const [results, setResults] = useState<Array<any>>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleOpen = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setInputValue("");
  }, []);

  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    setOpen(true);
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => ref?.current?.focus(), 200);
    }
  }, [open]);

  openSpotlight = handleOpen;

  const { data: roomData } = useApi("property/inventory/rooms");
  const { data: boardData } = useApi("property/boards");

  const palette = useColor(session.themeColor, session.user.darkMode);
  const [badge, setBadge] = useState<null | string>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Input event handling
  const handleSearch = async (value) => {
    let results = await getSpotlightActions(roomData, boardData, session);

    results = results.filter((result) =>
      result.title.toLowerCase().includes(value.toLowerCase())
    );

    if (badge) {
      results = results.filter(
        (result) => result?.badge?.toLowerCase() === badge
      );
    }

    setResults(results);
  };

  const debouncedHandleSearch = debounce(handleSearch, 500);

  useEffect(
    () => debouncedHandleSearch(inputValue),
    [inputValue, debouncedHandleSearch]
  );

  useHotkeys(
    "enter",
    (e) => {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          const tag: any = document.querySelector(`#activeSearchHighlight`);
          if (tag) tag.click();
        }, 500);
      }
    },
    {
      enableOnFormTags: true,
    }
  );

  useHotkeys(
    "ArrowDown",
    (e) => setSelectedIndex((prev) => (prev + 1) % results.length),
    { enableOnFormTags: true }
  );

  useHotkeys(
    "ArrowUp",
    (e) =>
      setSelectedIndex((prev) =>
        prev === 0 ? 0 : (prev - 1) % results.length
      ),
    { enableOnFormTags: true }
  );

  useHotkeys(
    ["ArrowDown", "ArrowUp"],
    () => {
      document
        .querySelector(`#activeSearchHighlight`)
        ?.scrollIntoView({ block: "nearest" });
    },
    {
      enableOnFormTags: true,
    }
  );

  return (
    <SwipeableDrawer
      open={open}
      onClose={handleClose}
      anchor="bottom"
      PaperProps={{
        sx: {
          minHeight: "calc(100vh - 50px)",
          height: "calc(100vh - 50px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Puller showOnDesktop />
      <Box sx={{ px: 2 }}>
        <TextField
          type="text"
          size="small"
          variant="standard"
          sx={{ mb: 2 }}
          InputProps={{
            disableUnderline: true,
            sx: {
              px: 2,
              py: 1,
              borderRadius: 3,
              background: palette[2],
              "&:focus-within": {
                background: palette[3],
              },
            },
          }}
          autoFocus
          placeholder="Search..."
          inputRef={ref}
          onChange={(e: any) => {
            setInputValue(e.target.value);
            debouncedHandleSearch(e.target.value);
            setSelectedIndex(0);
          }}
          value={inputValue}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: -1,
          mb: 1,
          overflow: "auto",
        }}
      >
        <Box sx={{ mr: 1 }} />
        {/* Get unique badges */}
        {[...new Set(results.map((result) => result?.badge?.toLowerCase()))]
          .filter((badge) => badge)
          .map((_badge) => (
            <Chip
              label={capitalizeFirstLetter(_badge)}
              key={_badge}
              onClick={() => setBadge(_badge.toLowerCase())}
              {...(badge === _badge.toLowerCase() && {
                onDelete: () => setBadge(null),
              })}
            />
          ))}
        <Box sx={{ mr: 1 }} />
      </Box>
      <Box sx={{ mt: 1, px: 2, flexGrow: 1 }}>
        <Virtuoso
          style={{ height: "100%", maxHeight: "calc(100vh - 100px)" }}
          totalCount={results.length + 1}
          itemContent={(index) => {
            const result = results[index];
            if (!results[index]) {
              return (
                <ListItemButton
                  key={index}
                  {...(index == selectedIndex && {
                    id: "activeSearchHighlight",
                  })}
                  sx={{
                    gap: 2,
                    mb: 0.2,
                    transition: "none",
                    ...((!inputValue || (badge && badge !== "agenda")) && {
                      display: "none",
                    }),
                    ...(index == selectedIndex && {
                      background: palette[2],
                      "& *": {
                        fontWeight: 700,
                      },
                    }),
                  }}
                  onClick={() => {
                    Router.push(`/tasks/search/${inputValue}`);
                    setTimeout(handleClose, 500);
                  }}
                >
                  <Icon
                    {...(index !== selectedIndex && { className: "outlined" })}
                  >
                    check_circle
                  </Icon>
                  <ListItemText primary={`Search for "${inputValue}"`} />
                  <Chip size="small" label={index == 0 ? "↵ enter" : "Tasks"} />
                </ListItemButton>
              );
            }
            const handleClick = () => {
              handleClose();
              setTimeout(result.onTrigger, 500);
            };

            return (
              <ListItemButton
                key={index}
                {...(index == selectedIndex && { id: "activeSearchHighlight" })}
                sx={{
                  gap: 2,
                  mb: 0.2,
                  transition: "none",
                  ...(index == selectedIndex && {
                    background: palette[2],
                    "& *": {
                      fontWeight: 700,
                    },
                  }),
                }}
                onClick={handleClick}
              >
                {typeof result.icon == "string" ? (
                  <Icon
                    {...(index !== selectedIndex && { className: "outlined" })}
                  >
                    {result.icon}
                  </Icon>
                ) : (
                  result.icon
                )}
                <ListItemText primary={result.title} />
                {(result.badge || index == selectedIndex) && (
                  <Chip
                    size="small"
                    label={
                      index == selectedIndex
                        ? "↵ enter"
                        : capitalizeFirstLetter(result.badge)
                    }
                  />
                )}
              </ListItemButton>
            );
          }}
        />
      </Box>
    </SwipeableDrawer>
  );
}
