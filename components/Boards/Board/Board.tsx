import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  SwipeableDrawer,
  TextField,
  Typography,
} from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { fetchApiWithoutHook, useApi } from "../../../hooks/useApi";
import { toastStyles } from "../../../lib/useCustomTheme";
import { ConfirmationModal } from "../../ConfirmationModal";
import BoardSettings from "./BoardSettings";
import { Task } from "./Column/Task";
import { CreateTask } from "./Column/Task/Create";

function FilterMenu({
  children,
  originalTasks,
  columnTasks,
  setColumnTasks,
  board,
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const trigger = cloneElement(children, {
    onClick: handleClick,
  });

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: "-3px!important",
            ml: "7px!important",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setColumnTasks(
              originalTasks.sort((a, b) => (a.name > b.name ? 1 : -1))
            );
            handleClose();
          }}
        >
          A-Z
        </MenuItem>
        <MenuItem
          onClick={() => {
            setColumnTasks(
              originalTasks.sort((a, b) => (a.name > b.name ? 1 : -1)).reverse()
            );
            handleClose();
          }}
        >
          Z-A
        </MenuItem>
        <MenuItem
          onClick={() => {
            setColumnTasks(originalTasks);
            handleClose();
          }}
        >
          Newest to oldest
        </MenuItem>
        <MenuItem
          onClick={() => {
            setColumnTasks(originalTasks.reverse());
            handleClose();
          }}
        >
          Oldest to newest
        </MenuItem>
      </Menu>
      {trigger}
    </>
  );
}

function ColumnSettings({
  columnTasks,
  setColumnTasks,
  board,
  mutationUrls,
  column,
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const [title, setTitle] = useState(column.name);
  const [emoji, setEmoji] = useState(column.emoji);
  const ref: any = useRef();
  const buttonRef: any = useRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        sx={{
          zIndex: 9999999,
        }}
        onClose={() => {
          mutate(mutationUrls.boardData);
          setOpen(false);
        }}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            maxWidth: "400px",
            maxHeight: "400px",
            width: "auto",
            p: 1,
            borderRadius: { xs: "20px 20px 0 0", sm: 5 },
            mb: { sm: 5 },
          },
        }}
      >
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 2,
              mb: 1,
              borderBottom: `1px solid ${
                global.user.darkMode ? "hsla(240,11%,25%,50%)" : "#e0e0e0"
              }`,
            }}
          >
            <EmojiPickerModal
              emoji={emoji}
              setEmoji={setEmoji}
              lazyLoadEmojis={true}
            />
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id={"renameInput"}
              inputRef={ref}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  buttonRef.current.click();
                }
              }}
              size="small"
              InputProps={{
                sx: {
                  fontWeight: "700",
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex" }}>
            <Button
              ref={buttonRef}
              size="large"
              onClick={async () => {
                toast.promise(
                  fetchApiWithoutHook("property/boards/column/edit", {
                    id: column.id,
                    name: title,
                    emoji: emoji,
                  }).then(() => mutate(mutationUrls.boardData)),
                  {
                    loading: "Saving...",
                    success: "Edited column!",
                    error: "Yikes! An error occured - Please try again later!",
                  },
                  toastStyles
                );
                setOpen(false);
              }}
            >
              <Icon className="outlined">save</Icon>
              Save
            </Button>
          </Box>
        </>
      </SwipeableDrawer>
      <IconButton onClick={handleClick} size="small">
        <Icon
          className="outlined"
          sx={{
            transition: "all .2s",
            ...(Boolean(anchorEl) && { transform: "rotate(180deg)" }),
          }}
        >
          expand_circle_down
        </Icon>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <FilterMenu
          originalTasks={column.tasks.filter(
            (task) => task.parentTasks.length === 0
          )}
          board={board}
          columnTasks={columnTasks}
          setColumnTasks={setColumnTasks}
        >
          <MenuItem className="sortMenu">
            <Icon className="outlined">filter_list</Icon>
            Sort
            <Icon className="outlined" sx={{ ml: "auto" }}>
              chevron_right
            </Icon>
          </MenuItem>
        </FilterMenu>
        <Divider />
        <Box sx={{ textAlign: "center" }}>
          <Chip label="Coming soon" sx={{ my: 1 }} size="small" />
        </Box>
        <MenuItem disabled>
          <Icon className="outlined">east</Icon>Move right
        </MenuItem>
        <MenuItem disabled>
          <Icon className="outlined">west</Icon>Move left
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setOpen(true)}>
          <Icon className="outlined">edit</Icon>
          Edit
        </MenuItem>
        <ConfirmationModal
          title="Delete column?"
          question="Are you sure you want to delete this column? This action annot be undone."
          callback={async () => {
            await fetchApiWithoutHook("property/boards/column/delete", {
              id: column.id,
            });
            await mutate(mutationUrls.board);
            handleClose();
          }}
        >
          <MenuItem>
            <Icon className="outlined">delete</Icon>
            Delete
          </MenuItem>
        </ConfirmationModal>
      </Menu>
    </>
  );
}

function EmojiPickerModal({ emoji, setEmoji }: any) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "400px",
            mb: { sm: 2 },
            borderRadius: { xs: "20px 20px 0 0", sm: 4 },
          },
        }}
        sx={{
          zIndex: 9999999,
        }}
      >
        {open && (
          <EmojiPicker
            skinTonePickerLocation={"PREVIEW" as any}
            theme={(global.user.darkMode ? "dark" : "light") as any}
            lazyLoadEmojis={true}
            width="100%"
            onEmojiClick={(event) => {
              const url = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${event.unified}.png`;
              setEmoji(url);
              setOpen(false);
            }}
          />
        )}
      </SwipeableDrawer>
      <Button onClick={() => setOpen(true)}>
        <picture>
          <img src={emoji} alt="emoji" width="30" height="30" />
        </picture>
      </Button>
    </>
  );
}

function Column({ board, mutationUrls, column }) {
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [columnTasks, setColumnTasks] = useState(column.tasks);

  useEffect(() => setColumnTasks(column.tasks), [column.tasks]);

  const toggleShowCompleted = useCallback(
    () => setShowCompleted((e) => !e),
    [setShowCompleted]
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [title, setTitle] = useState(column.name);
  const [emoji, setEmoji] = useState(column.emoji);
  const ref: any = useRef();
  const buttonRef: any = useRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        sx={{
          zIndex: 9999999,
        }}
        onClose={() => {
          mutate(mutationUrls.boardData);
          setOpen(false);
        }}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            maxWidth: "400px",
            maxHeight: "400px",
            width: "auto",
            p: 1,
            borderRadius: { xs: "20px 20px 0 0", sm: 5 },
            mb: { sm: 5 },
          },
        }}
      >
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 2,
              mb: 1,
              borderBottom: `1px solid ${
                global.user.darkMode ? "hsla(240,11%,25%,50%)" : "#e0e0e0"
              }`,
            }}
          >
            <EmojiPickerModal
              emoji={emoji}
              setEmoji={setEmoji}
              lazyLoadEmojis={true}
            />
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id={"renameInput"}
              inputRef={ref}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  buttonRef.current.click();
                }
              }}
              size="small"
              InputProps={{
                sx: {
                  fontWeight: "700",
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex" }}>
            <Button
              ref={buttonRef}
              size="large"
              onClick={async () => {
                toast.promise(
                  fetchApiWithoutHook("property/boards/column/edit", {
                    id: column.id,
                    name: title,
                    emoji: emoji,
                  }).then(() => mutate(mutationUrls.boardData)),
                  {
                    loading: "Saving...",
                    success: "Edited column!",
                    error: "Yikes! An error occured - Please try again later!",
                  },
                  toastStyles
                );
                setOpen(false);
              }}
            >
              <Icon className="outlined">save</Icon>
              Save
            </Button>
          </Box>
        </>
      </SwipeableDrawer>
      <Box
        className="snap-center"
        sx={{
          borderLeft: "1px solid",
          borderColor: global.user.darkMode
            ? "hsl(240,11%,16%)"
            : "rgba(200,200,200,.2)",
          zIndex: 1,
          flexGrow: 1,
          flexBasis: 0,
          ml: "-1px",
          minHeight: { sm: "100vh" },
          overflowY: "scroll",
          minWidth: { xs: "100vw", sm: "340px" },
          transition: "filter .2s",
        }}
      >
        <Box
          sx={{
            color: global.user.darkMode ? "#fff" : "#000",
            p: 3,
            px: 4,
            background: global.user.darkMode
              ? "hsla(240,11%,16%, 0.2)"
              : "rgba(200,200,200,.05)",
            borderBottom: "1px solid",
            borderColor: global.user.darkMode
              ? "hsla(240,11%,18%, 0.2)"
              : "rgba(200,200,200,.3)",
            userSelect: "none",
            zIndex: 9,
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
          }}
        >
          <Box sx={{ display: "flex", my: 1, gap: 3, alignItems: "center" }}>
            <picture>
              <img src={column.emoji} width={50} height={50} />
            </picture>
            <Box>
              <Typography
                variant="h4"
                className="font-heading"
                sx={{
                  fontSize: "30px",
                  borderRadius: 1,
                  width: "auto",
                  mb: 0.5,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {column.name}
              </Typography>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                }}
              >
                {columnTasks.length} tasks
              </Typography>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <ColumnSettings
                columnTasks={columnTasks}
                setColumnTasks={setColumnTasks}
                column={column}
                mutationUrls={mutationUrls}
                board={board}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: 2 }}>
          <CreateTask
            tasks={columnTasks}
            mutationUrl={mutationUrls.tasks}
            boardId={board.id}
            column={column}
          />
          {columnTasks
            .filter((task) => !task.completed)
            .map((task) => (
              <Task
                key={task.id}
                board={board}
                columnId={column.id}
                mutationUrl={mutationUrls.tasks}
                task={task}
              />
            ))}

          <Button
            className="task"
            fullWidth
            size="large"
            sx={{
              px: "10px!important",
              py: "5px!important",
              mb: 1,
              ...(showCompleted && {
                background: global.user.darkMode
                  ? "hsl(240,11%,20%)!important"
                  : "rgba(200,200,200,.3)!important",
              }),
            }}
            onClick={toggleShowCompleted}
          >
            Completed{" "}
            <Chip
              size="small"
              sx={{ borderRadius: 2, ml: 1 }}
              label={columnTasks.filter((task) => task.completed).length}
            />
            <Icon
              sx={{
                ml: "auto",
                transition: "all .2s",
                ...(showCompleted && { transform: "rotate(180deg)" }),
              }}
            >
              expand_more
            </Icon>
          </Button>
          {showCompleted &&
            columnTasks
              .filter((task) => task.completed)
              .map((task) => (
                <Task
                  key={task.id}
                  board={board}
                  columnId={column.id}
                  mutationUrl={mutationUrls.tasks}
                  task={task}
                />
              ))}
        </Box>
      </Box>
    </>
  );
}

function RenderBoard({ mutationUrls, board, data, setDrawerOpen }) {
  const [showInfo, setShowInfo] = useState(true);

  const titleRef: any = useRef();
  const descriptionRef: any = useRef();

  useEffect(() => {
    titleRef.current.value = board.name;
    descriptionRef.current.value = board.description;
  }, [board, titleRef, descriptionRef]);

  const handleSave = useCallback(() => {
    if (
      !(
        (titleRef.current.value == board.name &&
          descriptionRef.current.value === board.description) ||
        titleRef.current.value.trim() == ""
      )
    ) {
      toast.promise(
        fetchApiWithoutHook("property/boards/edit", {
          id: board.id,
          name: titleRef.current.value,
          description: descriptionRef.current.value,
        }).then(() => mutate(mutationUrls.boardData)),
        {
          loading: "Renaming...",
          success: "Renamed board!",
          error: "An error occurred while renaming the board",
        },
        toastStyles
      );
    }
  }, [titleRef, descriptionRef]);

  return (
    <Box
      className="snap-x snap-mandatory sm:snap-none"
      sx={{
        display: "flex",
        maxWidth: "100vw",
        overflowX: "scroll",
        mt: { xs: -2, sm: 0 },
        height: { sm: "100vh" },
      }}
    >
      <Box
        className="snap-center"
        sx={{
          borderRadius: 5,
          mt: { xs: "35px", sm: "10px" },
          ml: { xs: "30px", sm: "10px" },
          height: { xs: "calc(100vh - 170px)", sm: "calc(100vh - 20px)" },
          background: showInfo
            ? global.user.darkMode
              ? "hsl(240,11%,15%)"
              : "rgba(200,200,200,.2)"
            : global.user.darkMode
            ? "hsl(240,11%,13%)"
            : "rgba(200,200,200,.1)",
          mr: { xs: 3, sm: 2 },
          zIndex: 1,
          flexGrow: 1,
          flexBasis: 0,
          flex: { xs: "0 0 calc(100% - 70px)", sm: "unset" },
          p: 4,
          py: showInfo ? 3 : 2,
          overflowY: "scroll",
          flexDirection: "column",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: !showInfo ? "auto" : "320px",
          maxWidth: { sm: "300px" },
          transition: "filter .2s",
        }}
      >
        {showInfo ? (
          <>
            <Box sx={{ mt: "auto" }}>
              <TextField
                defaultValue={board.name}
                onChange={(e: any) => {
                  e.target.value = e.target.value.replace(/\n|\r/g, "");
                }}
                inputRef={titleRef}
                placeholder="Board name"
                multiline
                onBlur={handleSave}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  className: "font-heading",
                  sx: {
                    borderRadius: 2,
                    p: 1,
                    ml: -1,
                    mb: 0.5,
                    fontSize: "40px",
                    py: 0.5,
                    "&:focus-within": {
                      background: global.user.darkMode
                        ? "hsl(240,11%,18%)"
                        : "rgba(200,200,200,.2)",
                    },
                  },
                }}
              />
              <TextField
                multiline
                defaultValue={board.description}
                inputRef={descriptionRef}
                onBlur={handleSave}
                placeholder="Click to add description"
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    p: 1,
                    mb: 0.5,
                    ml: -1,
                    py: 1,
                    "&:focus-within": {
                      background: global.user.darkMode
                        ? "hsl(240,11%,18%)"
                        : "rgba(200,200,200,.2)",
                    },
                  },
                }}
                maxRows={3}
              />
              <Box sx={{ my: 1 }}>
                <Chip
                  sx={{ mr: 1, mb: 1 }}
                  label={board.public ? "Public" : "Private"}
                  icon={<Icon>{board.public ? "public " : "lock"}</Icon>}
                />
                {board.pinned && (
                  <Chip
                    label="Pinned"
                    sx={{ mr: 1, mb: 1 }}
                    icon={<Icon>push_pin</Icon>}
                  />
                )}
                {board.archived && (
                  <Chip
                    label="Archived"
                    sx={{ mr: 1, mb: 1 }}
                    icon={<Icon>inventory_2</Icon>}
                  />
                )}
                {board.integrations.find(
                  (integration) => integration.name == "Canvas LMS"
                ) && (
                  <Chip
                    onClick={async () => {
                      toast(
                        "Resyncing to Canvas LMS (this may take a while)",
                        toastStyles
                      );
                      await fetchApiWithoutHook("property/integrations/run", {
                        boardId: board.id,
                      });
                      mutate(mutationUrls.tasks);
                    }}
                    label="Resync to Canvas"
                    sx={{
                      mr: 1,
                      mb: 1,
                      background:
                        "linear-gradient(45deg, #FF0080 0%, #FF8C00 100%)",
                      color: "#000",
                    }}
                    icon={
                      <Icon
                        sx={{
                          color: "#000!important",
                        }}
                      >
                        refresh
                      </Icon>
                    }
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ mt: "auto", display: "flex", width: "100%" }}>
              <IconButton
                sx={{ mr: "auto", display: { sm: "none" } }}
                onClick={() => setDrawerOpen(true)}
              >
                <Icon className="outlined">unfold_more</Icon>
              </IconButton>
              <BoardSettings
                mutationUrl={mutationUrls.boardData}
                board={board}
              />
              <IconButton
                sx={{
                  ml: "auto",
                  display: { xs: "none", sm: "flex" },
                }}
                onClick={() => setShowInfo(false)}
              >
                <Icon className="outlined">menu_open</Icon>
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ mt: "auto" }}>
            <IconButton onClick={() => setShowInfo(true)}>
              <Icon className="outlined">menu</Icon>
            </IconButton>
          </Box>
        )}
      </Box>
      {data.map((column) => (
        <Column
          mutationUrls={mutationUrls}
          column={column}
          key={column.id}
          board={board}
        />
      ))}
    </Box>
  );
}

export function Board({ mutationUrl, board, setDrawerOpen }) {
  const { data, url, error } = useApi("property/boards/tasks", {
    id: board.id,
  });

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Yikes! An error occured while trying to load the items in this board.
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress disableShrink sx={{ animationDuration: ".5s" }} />
      </Box>
    );
  }

  return (
    <RenderBoard
      data={data}
      mutationUrls={{
        boardData: mutationUrl,
        tasks: url,
      }}
      board={board}
      setDrawerOpen={setDrawerOpen}
    />
  );
}
