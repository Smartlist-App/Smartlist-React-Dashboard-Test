"use client";

import { ErrorHandler } from "@/components/Error";
import { CreateItem } from "@/components/Inventory/CreateItem";
import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Icon,
  IconButton,
  InputAdornment,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { ItemPopup } from "./item-popup";

export function JumpBackIn() {
  const { session } = useSession();
  const router = useRouter();
  const palette = useColor(session.user.color, useDarkMode(session.darkMode));

  const { data, mutate, error } = useSWR(["property/inventory/recent"]);

  return (
    <>
      <Box
        sx={{
          p: 3,
          pb: 0,
          mt: 5,
          display: { sm: "none" },
        }}
      >
        <Typography
          variant="h2"
          className="font-heading"
          sx={{
            background: `linear-gradient(180deg, ${palette[11]}, ${palette[10]})`,
            WebkitBackgroundClip: "text",
            fontSize: "min(70px, 20vw)",
          }}
        >
          Inventory
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            mt: 0.5,
            alignItems: "center",
          }}
        >
          <TextField
            variant="standard"
            placeholder="Search..."
            onClick={() => toast("Coming soon!")}
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              sx: {
                background: palette[2],
                "&:focus-within": {
                  background: palette[3],
                },
                "& *::placeholder": {
                  color: palette[10] + "!important",
                },
                transition: "all .2s",
                px: 2,
                py: 0.3,
                borderRadius: 3,
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Icon sx={{ color: palette[9] }}>search</Icon>
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={() => router.push("/rooms/audit")}
            sx={{
              color: palette[11],
              background: palette[2],
              "&:active": {
                background: palette[3],
              },
            }}
          >
            <Icon className="outlined">photo_camera</Icon>
          </IconButton>
          <CreateItem mutate={() => {}}>
            <IconButton
              sx={{
                color: palette[11],
                background: palette[2],
                "&:active": {
                  background: palette[3],
                },
              }}
            >
              <Icon>add</Icon>
            </IconButton>
          </CreateItem>
        </Box>
      </Box>
      <Typography
        sx={{
          my: { xs: 1, sm: 1.5 },
          mt: { xs: 1, sm: 1 },
          textTransform: "uppercase",
          fontWeight: 700,
          opacity: 0.5,
          fontSize: "13px",
          px: 4,
          pt: 2,
          color: palette[12],
          userSelect: "none",
          ...(data?.length === 0 && {
            display: "none",
          }),
        }}
      >
        Jump back in
      </Typography>
      {error && <ErrorHandler callback={mutate} />}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          px: { xs: 3, sm: 5 },
          mb: 3,
          overflowX: { xs: "scroll", sm: "unset" },
          flexWrap: { sm: "wrap" },
          justifyContent: { sm: "center" },
        }}
      >
        {data
          ? data.map((item) => (
              <ItemPopup key={item.id} item={item} mutateList={mutate}>
                <Box
                  sx={{
                    color: palette[11] + "!important",
                    borderWidth: "2px !important",
                    p: 1,
                    px: 2,
                    borderRadius: 3,
                    display: "flex",
                    background: addHslAlpha(palette[3], 0.5),
                    "&:hover": {
                      background: { sm: addHslAlpha(palette[3], 0.7) },
                    },
                    "&:active": {
                      background: palette[4],
                    },
                    alignItems: "center",
                    flexShrink: 0,
                    gap: 0.5,
                    opacity: 0.7,
                    width: 200,
                    height: 70,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        overflowX: "scroll",
                        maxWidth: "100%",
                      }}
                    >
                      {item.quantity && (
                        <Chip
                          size="small"
                          label={item.quantity + " pcs."}
                          icon={<Icon>interests</Icon>}
                        />
                      )}
                      {item.condition && (
                        <Chip
                          size="small"
                          label={item.condition}
                          icon={<Icon>question_mark</Icon>}
                        />
                      )}
                      {item.estimatedValue && (
                        <Chip
                          size="small"
                          label={item.estimatedValue}
                          icon={<Icon>attach_money</Icon>}
                        />
                      )}
                    </Box>
                  </Box>
                  <Icon sx={{ ml: "auto", flexShrink: 0 }}>
                    arrow_forward_ios
                  </Icon>
                </Box>
              </ItemPopup>
            ))
          : [...new Array(10)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={70}
                width={200}
                sx={{ flexShrink: 0 }}
              />
            ))}
      </Box>
    </>
  );
}

export function Panel() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { session } = useSession();
  const palette = useColor(session.user.color, useDarkMode(session.darkMode));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [view, setView] = useState("room");

  const isMobile = useMediaQuery("(max-width: 600px)");

  const open = Boolean(anchorEl);

  const handleClick = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (option: string) => {
    setView(option);
    setAnchorEl(null);
  };

  const buttonText = view === "room" ? "Rooms" : "Categories";

  const { data, mutate, error } = useSWR(["property/inventory/rooms"]);

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: "250px" },
        flex: { xs: "0 0 100%", sm: "0 0 250px" },
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        pb: 5,
      }}
    >
      {/* View menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleSelect("room")}>Rooms</MenuItem>
        <MenuItem onClick={() => handleSelect("category")} disabled>
          Category
        </MenuItem>
        <MenuItem onClick={() => handleSelect("estimatedValue")} disabled>
          Estimated value
        </MenuItem>
        <MenuItem onClick={() => handleSelect("condition")} disabled>
          Condition
        </MenuItem>
      </Menu>
      {/* Rest of the content */}
      <Box sx={{ height: "100%", p: { xs: 3, sm: 2 }, py: { xs: 0, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, sm: 1 },
            my: 2,
            flexDirection: { sm: "column" },
          }}
        >
          <Box sx={{ order: { sm: 2 } }}>
            <Button
              onClick={handleClick}
              variant="outlined"
              sx={{
                color: palette[11] + "!important",
                borderWidth: "2px !important",
                px: 1,
                borderRadius: 3,
                fontWeight: 900,
                gap: 0.5,
                opacity: 0.7,
              }}
            >
              {buttonText.toUpperCase()}
              <Icon>{!open ? "expand_more" : "expand_less"}</Icon>
            </Button>
          </Box>
        </Box>

        {/* Data */}
        {error && <ErrorHandler callback={mutate} />}
        {!data && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {data &&
          data.map((room) => (
            <ListItemButton
              key={room.id}
              selected={params?.room === room.id}
              onClick={() => router.push(`/rooms/${room.id}`)}
              onMouseDown={() => router.push(`/rooms/${room.id}`)}
              sx={{
                px: 1,
                mb: 0.3,
              }}
            >
              <img
                src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${room.emoji}.png`}
                alt="Emoji"
                width={30}
                height={30}
              />
              <ListItemText
                sx={{
                  "&, & *": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                  },
                }}
                primary={room.name}
              />
              {room._count.items !== 0 && (
                <Typography
                  sx={{
                    ml: "auto",
                    opacity: 0.6,
                    mr: 1,
                  }}
                >
                  {room._count.items}
                </Typography>
              )}
              {isMobile && <Icon>arrow_forward_ios</Icon>}
            </ListItemButton>
          ))}
        {data?.length == 0 && (
          <Box
            sx={{
              display: "flex",
              background: { xs: palette[2], sm: palette[3] },
              borderRadius: 5,
              px: 3,
              py: 1,
            }}
          >
            <Typography
              sx={{
                color: palette[11],
                opacity: 0.7,
                fontWeight: 800,
              }}
            >
              No rooms yet
            </Typography>
          </Box>
        )}
        {view === "room" && (
          <ListItemButton
            selected={pathname === "/rooms/create"}
            onClick={() => router.push(`/rooms/create`)}
            onMouseDown={() => router.push(`/rooms/create`)}
            sx={{ py: 1, px: 1 }}
          >
            <Icon className="outlined" sx={{ fontSize: "30px!important" }}>
              add_circle
            </Icon>
            <ListItemText primary="New room" />
            {isMobile && <Icon>arrow_forward_ios</Icon>}
          </ListItemButton>
        )}
      </Box>
      {/* Scan */}
      <Box
        sx={{
          width: "100%",
          p: 2,
          display: { xs: "none", sm: "flex" },
          gap: 2,
        }}
      >
        <CreateItem mutate={() => {}}>
          <Button variant="contained" fullWidth>
            <Icon className="outlined">add_circle</Icon>New
          </Button>
        </CreateItem>
        <Button variant="contained" onClick={() => router.push("/rooms/audit")}>
          <Icon className="outlined">photo_camera</Icon>
        </Button>
      </Box>
    </Box>
  );
}

export default function Page() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <JumpBackIn />
    </Box>
  );
}