import LoadingButton from "@mui/lab/LoadingButton";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { fetchApiWithoutHook } from "../../../../../hooks/useApi";
import { useStatusBar } from "../../../../../hooks/useStatusBar";
import { colors } from "../../../../../lib/colors";
import { SelectDateModal } from "./SelectDateModal";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Icon,
  IconButton,
  ListItem,
  ListItemText,
  SwipeableDrawer,
  TextField,
} from "@mui/material";
import { toastStyles } from "../../../../../lib/useCustomTheme";

function ImageModal({ image, setImage, styles }) {
  const [imageUploading, setImageUploading] = useState(false);
  return (
    <>
      <IconButton
        onClick={() => {
          document.getElementById("imageAttachment")?.click();
        }}
        sx={{
          ...styles,
          mx: 0.5,
          background: image
            ? `${
                colors[themeColor][global.user.darkMode ? 900 : 100]
              }!important`
            : "",
        }}
        size="small"
      >
        {imageUploading ? (
          <CircularProgress size={20} sx={{ mx: 0.5 }} />
        ) : (
          <span
            className={
              image ? "material-symbols-rounded" : "material-symbols-outlined"
            }
          >
            image
          </span>
        )}
      </IconButton>
      <input
        type="file"
        id="imageAttachment"
        name="imageAttachment"
        style={{
          display: "none",
        }}
        onChange={async (e: any) => {
          const key = "da1f275ffca5b40715ac3a44aa77cf42";
          const form = new FormData();
          form.append("image", e.target.files[0]);

          setImageUploading(true);
          fetch(`https://api.imgbb.com/1/upload?name=image&key=${key}`, {
            method: "POST",
            body: form,
          })
            .then((res) => res.json())
            .then((res) => {
              setImage(res.data);
              setImageUploading(false);
            })
            .catch((err) => {
              console.log(err);
              setImageUploading(false);
            });
        }}
        accept="image/png, image/jpeg"
      />
    </>
  );
}

export function CreateTask({
  tasks,
  parent = false,
  mutationUrl,
  boardId,
  column,
  checkList = false,
}: any) {
  const allCompleted = !(
    column &&
    column.tasks &&
    column.tasks.filter((task) => task.completed).length ==
      column.tasks.length &&
    column.tasks.length >= 1
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<any>(null);
  const [pinned, setPinned] = useState(false);
  const [image, setImage] = useState<any>(null);

  const [showDescription, setShowDescription] = useState(false);
  useStatusBar(open);

  const styles = {
    color: colors[themeColor][global.user.darkMode ? 50 : 800],
    borderRadius: 3,
    transition: "none",
  };

  useEffect(() => {
    // If the title contains "today", set the date to today
    if (title.toLowerCase().includes("today")) {
      setDate(new Date());
    } else if (
      title.toLowerCase().includes("tomorrow") ||
      title.toLowerCase().includes("tmrw") ||
      title.toLowerCase().includes("tmr") ||
      title.toLowerCase().includes("tmw")
    ) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow);
    } else if (title.toLowerCase().includes("next week")) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDate(nextWeek);
    } else if (title.toLowerCase().includes("next month")) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      setDate(nextMonth);
    }
  }, [title]);
  const titleRef = useRef<HTMLInputElement>(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title === "") {
      toast.error("Please enter a title", toastStyles);
      return;
    }

    setLoading(true);
    fetchApiWithoutHook("property/boards/createTask", {
      title,
      description,
      ...(image && { image: image.url }),
      date,
      pinned: pinned ? "true" : "false",
      due: date ? date.toISOString() : "false",
      ...(parent && { parent }),

      boardId,
      columnId: (column || { id: -1 }).id,
    });
    toast.success("Created task!", toastStyles);

    setLoading(false);
    setTitle("");
    setDescription("");
    setDate(null);
    setImage(null);
    setPinned(false);
    titleRef.current?.focus();
    // setOpen(false);
  };

  const chipStyles = {
    background: global.user.darkMode
      ? "hsl(240,11%,20%)!important"
      : colors[themeColor]["50"] + "!important",
    transition: "all .2s",
    "&:active": {
      transition: "none",
      transform: "scale(.95)",
    },
    boxShadow: "none!important",
    px: 1,
    mr: 1,
  };

  useEffect(() => {
    setTimeout(() => {
      titleRef.current?.focus();
    });
  }, [open, titleRef]);

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => {
          setOpen(false);
          mutate(mutationUrl);
        }}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            maxWidth: "600px",
            mb: { sm: 5 },
            background: "transparent!important",
            mx: "auto",
          },
        }}
      >
        <Box
          sx={{
            mb: 2,
            overflowX: "scroll",
            whiteSpace: "nowrap",
          }}
          onClick={() => titleRef.current?.focus()}
        >
          <Chip
            label="Important"
            sx={{
              ...chipStyles,
              ml: 1,
              ...(pinned && {
                background: colors[themeColor]["900"] + "!important",
                color: "#fff!important",
              }),
            }}
            icon={
              <Icon
                sx={{
                  ...(pinned && {
                    color: "#fff!important",
                  }),
                }}
              >
                priority
              </Icon>
            }
            onClick={() => setPinned(!pinned)}
          />
          <Chip
            label="Today"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => setDate(new Date())}
          />
          <Chip
            label="Tomorrow"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDate(tomorrow);
            }}
          />
          <Chip
            label="In one month"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 30);
              setDate(tomorrow);
            }}
          />
          <Chip
            label="In one year"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 365);
              setDate(tomorrow);
            }}
          />
        </Box>
        <Box
          sx={{
            p: 3,
            borderRadius: { xs: "20px 20px 0 0", sm: 5 },
            background: global.user.darkMode
              ? "hsl(240,11%,15%)"
              : colors[themeColor]["50"],
          }}
        >
          <form onSubmit={handleSubmit}>
            {image && (
              <Box
                sx={{
                  width: 300,
                  position: "relative",
                  borderRadius: 5,
                  overflow: "hidden",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  mb: 2,
                  height: 200,
                }}
              >
                <picture>
                  <img
                    alt="Uploaded"
                    draggable={false}
                    src={image.url}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </picture>
                <Button
                  sx={{
                    position: "absolute",
                    top: 0,
                    m: 1,
                    right: 0,
                    background: "rgba(0,0,0,0.7)!important",
                    color: "#fff!important",
                    minWidth: "unset",
                    width: 25,
                    height: 25,
                    borderRadius: 999,
                    zIndex: 999,
                  }}
                  onClick={() => {
                    setImage(null);
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    close
                  </span>
                </Button>
              </Box>
            )}
            <TextField
              multiline
              inputRef={titleRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.replace(/\n/g, ""))}
              autoFocus
              variant="standard"
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  handleSubmit(e);
                }
              }}
              placeholder={
                'Add an item to "' +
                (column || { name: "this task" }).name +
                '"'
              }
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: 19 },
              }}
            />
            <Collapse in={showDescription}>
              <TextField
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="standard"
                placeholder="Add a description"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 15, mt: 0.5, mb: 1 },
                }}
              />
            </Collapse>
            {!parent &&
              title !== "" &&
              tasks.filter((task) =>
                new RegExp("\\b" + task.name.toLowerCase() + "\\b").test(
                  title.toLowerCase()
                )
              ).length !== 0 && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 1,
                    mb: 2,
                    borderRadius: 5,
                    background:
                      colors[themeColor][global.user.darkMode ? 900 : 100],
                    color:
                      colors[themeColor][!global.user.darkMode ? 900 : 100],
                  }}
                  icon={
                    <span
                      className="material-symbols-rounded"
                      style={{
                        color:
                          colors[themeColor][global.user.darkMode ? 100 : 800],
                      }}
                    >
                      info
                    </span>
                  }
                >
                  This item might be already added in your list.
                </Alert>
              )}
            <Box sx={{ display: "flex", mt: 1, mb: -1, alignItems: "center" }}>
              <IconButton
                disableRipple
                onClick={() => setPinned(!pinned)}
                sx={{
                  ...styles,
                  background: pinned
                    ? colors[themeColor][global.user.darkMode ? 900 : 100] +
                      "!important"
                    : "",
                }}
                size="small"
              >
                <span
                  style={{ transform: "rotate(-45deg)" }}
                  className={
                    pinned
                      ? "material-symbols-rounded"
                      : "material-symbols-outlined"
                  }
                >
                  push_pin
                </span>
              </IconButton>
              <ImageModal styles={styles} image={image} setImage={setImage} />
              <IconButton
                disableRipple
                onClick={() => {
                  setShowDescription(!showDescription);
                  setTimeout(() => {
                    {
                      if (!showDescription)
                        document.getElementById("description")?.focus();
                      else document.getElementById("title")?.focus();
                    }
                  }, 100);
                }}
                sx={{
                  ...styles,
                  mx: 0.5,
                  background: showDescription
                    ? colors[themeColor][global.user.darkMode ? 900 : 100] +
                      "!important"
                    : "",
                }}
                size="small"
              >
                <Icon>notes</Icon>
              </IconButton>

              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  gap: 2,
                  mt: 0,
                  alignItems: "center",
                }}
              >
                <SelectDateModal
                  styles={styles}
                  date={date}
                  setDate={setDate}
                />
                <div>
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    disableRipple
                    sx={{
                      "&:active": {
                        transform: "scale(.95)",
                        transition: "none",
                        opacity: ".6",
                      },
                      transition: "all .2s",
                      borderRadius: 5,
                      px: 2,
                      minWidth: "auto",
                      background:
                        colors[themeColor][
                          global.user.darkMode ? "A100" : 900
                        ] + "!important",
                      color:
                        colors[themeColor][global.theme !== "dark" ? 50 : 900] +
                        "!important",
                    }}
                    variant="contained"
                  >
                    <Icon>add</Icon>
                  </LoadingButton>
                </div>
              </Box>
            </Box>
          </form>
        </Box>
      </SwipeableDrawer>
      <ListItem
        // disabled={global.permission === "read-only"}
        id="createTask"
        className="p-1 sm:p-0 shadow-sm border border-gray-100 dark:border-[hsl(240,11%,18%)] hover:border-gray-300 active:border-gray-300 rounded-xl gap-0.5 dark:bg-transparent hover:bg-gray-100 sm:hover:bg-gray-100 active:bg-gray-200 sm:active:bg-gray-200 cursor-auto select-none"
        sx={{
          color: colors["grey"][global.user.darkMode ? "A100" : "A700"],
          p: {
            xs: 1,
            sm: "0!important",
          },
          cursor: "unset!important",
          ...(global.user.darkMode && {
            "&:hover": {
              backgroundColor: "hsl(240,11%,19%)!important",
            },
            "&:active": {
              backgroundColor: "hsl(240,11%,16%)!important",
            },
          }),
          ...(!checkList && {
            boxShadow: {
              sm: "none!important",
            },
            border: {
              sm: "none!important",
            },
          }),
          gap: "5px!important",
          mb: {
            xs: 1.5,
            sm: checkList ? 1.5 : 0,
          },
          ...(tasks &&
            tasks.filter((task) => task.completed && task.columnId == column.id)
              .length ==
              tasks.filter((task) => task.columnId == column.id).length &&
            tasks.length >= 1 && {
              width: "auto",
              p: "0!important",
              pr: "5px!important",
              mb: "0!important",
              border: "0!important",
              borderColor: "transparent!important",
            }),
        }}
        onClick={() => setOpen(true)}
      >
        <span
          className="material-symbols-outlined"
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            border:
              "2px solid " +
              (global.user.darkMode ? "rgba(255,255,255,.3)" : "#808080"),
            borderRadius: "10px",
            color: global.user.darkMode
              ? "fff"
              : checkList
              ? "#303030"
              : "#808080",
            marginLeft: !allCompleted ? "10px" : "9px",
            marginRight: "5px",
            fontSize: "20px",
          }}
        >
          add
        </span>

        {allCompleted && (
          <ListItemText
            className="textbox"
            primary={
              <span
                style={{
                  fontWeight: 700,
                  color: global.user.darkMode ? "#fff" : "#606060",
                }}
              >
                {parent ? "New subtask" : "New list item"}
              </span>
            }
          />
        )}
      </ListItem>
      {/* <Divider sx={{ my: 0.5 }} /> */}
    </>
  );
}
