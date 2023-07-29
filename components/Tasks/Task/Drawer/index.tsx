import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useBackButton } from "@/lib/client/useBackButton";
import { Alert, Box, CircularProgress, SwipeableDrawer } from "@mui/material";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { toArray } from "react-emoji-render";
import { useHotkeys } from "react-hotkeys-hook";
import { mutate } from "swr";
import { ErrorHandler } from "../../../Error";
import DrawerContent from "./Content";

export const parseEmojis = (value) => {
  const emojisArray = toArray(value);

  // toArray outputs React elements for emojis and strings for other
  const newValue = emojisArray.reduce((previous: any, current: any) => {
    if (typeof current === "string") {
      return previous + current;
    }
    return previous + current.props.children;
  }, "");

  return newValue;
};

export const TaskDrawer = React.memo(function TaskDrawer({
  isDateDependent = false,
  children,
  id,
  mutationUrl,
  onClick,
}: {
  isDateDependent?: boolean;
  children: JSX.Element;
  id: number;
  mutationUrl: string;
  onClick?: any;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);

  useBackButton(() => setOpen(false));
  const ref: any = useRef();
  const session = useSession();

  // Fetch data when the trigger is clicked on
  const handleOpen = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    try {
      const data = await fetchRawApi(session, "property/boards/column/task", {
        id,
      });
      setData(data);
      setLoading(false);
      setError(null);
      ref.current.scrollTop = 0;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }, [id, session]);

  // Fetch data when the trigger is clicked on
  const handleMutate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchRawApi(session, "property/boards/column/task", {
        id: id,
      });
      setData(res);
      document.getElementById("detailsTrigger")?.click();
      setLoading(false);
      setError(null);
      ref.current.scrollTop = 0;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }, [id, session]);

  const handleDelete = useCallback(
    async function handleDelete(taskId) {
      setData("deleted");
      await fetchRawApi(session, "property/boards/column/task/delete", {
        id: taskId,
      });
      handleMutate();
      mutate(mutationUrl);
    },
    [mutationUrl, setData, handleMutate, session]
  );

  useHotkeys(
    "delete",
    () => {
      handleDelete(id);
      setOpen(false);
    },
    [id]
  );

  // Callback function when drawer is closed
  const handleClose = useCallback(() => {
    setOpen(false);
    handleMutate();
    mutate(mutationUrl);
    if (data && data.parentTasks.length !== 0) {
      setTimeout(() => {
        const trigger: any = document.getElementById("subtaskTrigger");
        if (trigger) trigger.click();
        if (trigger) trigger.click();
      }, 200);
    } else {
      const trigger: any = document.getElementById("detailsTrigger");
      if (trigger) trigger.click();
    }
  }, [data, handleMutate, mutationUrl]);

  // Attach the `onClick` handler to the trigger
  const trigger = cloneElement(children, {
    onClick: onClick || handleOpen,
  });

  // Some basic drawer styles
  const drawerStyles = {
    maxWidth: "500px",
    width: "100%",
    height: "100vh",
  };

  return (
    <>
      {trigger}
      <SwipeableDrawer
        open={open}
        onClose={handleClose}
        anchor="right"
        PaperProps={{ sx: drawerStyles, ref }}
      >
        {open && !loading && error && (
          <Box sx={{ p: 3, pt: { xs: 0, sm: 3 } }}>
            <ErrorHandler
              callback={() => mutate(mutationUrl)}
              error="Oh no! An error occured while trying to get this task's information. Please try again later or contact support"
            />
          </Box>
        )}
        {loading && !data && open && (
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              disableShrink
              sx={{ animationDuration: "0.5s" }}
            />
          </Box>
        )}
        <Box
          sx={{
            opacity: loading ? 0.5 : 1,
            transition: "all .2s",
            transform: `scale(${loading && data ? 0.99 : 1})`,
          }}
        >
          {data && data !== "deleted" && (
            <DrawerContent
              handleDelete={handleDelete}
              handleMutate={handleMutate}
              isDateDependent={isDateDependent}
              handleParentClose={handleClose}
              data={data}
              mutationUrl={mutationUrl}
              setTaskData={setData}
            />
          )}
        </Box>
        {data === "deleted" && (
          <Box sx={{ p: 3, pt: { xs: 0, sm: 3 } }}>
            <Alert severity="info" icon="💥">
              This task has &quot;mysteriously&quot; vanished into thin air
            </Alert>
          </Box>
        )}
      </SwipeableDrawer>
    </>
  );
});