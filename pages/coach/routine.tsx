import { ShareGoal } from "@/components/Coach/Goal/ShareGoal";
import { fetchRawApi, useApi } from "@/lib/client/useApi";
import { useColor } from "@/lib/client/useColor";
import { useSession } from "@/lib/client/useSession";
import { toastStyles } from "@/lib/client/useTheme";
import useWindowDimensions from "@/lib/client/useWindowDimensions";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Icon,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { mutate } from "swr";

function GoalTask({ goal, setSlide, mutationUrl }) {
  const session = useSession();
  const palette = useColor(session.themeColor, session.user.darkMode);
  const { width, height } = useWindowDimensions();

  const [loading, setLoading] = useState<boolean>(false);
  const [stepTwoOpen, setStepTwoOpen] = useState<boolean>(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  const isCompleted = goal.progress === goal.durationDays;

  useEffect(() => {
    document
      .querySelector(`meta[name="theme-color"]`)
      ?.setAttribute("content", palette[2]);
  });

  const handleNext = () => {
    if (goal.progress === goal.durationDays) {
      setStepTwoOpen(true);
    } else {
      setSlide((s) => s + 1);
      fetchRawApi("user/coach/goals/markAsDone", {
        date: dayjs().format("YYYY-MM-DD"),
        progress:
          goal.progress && parseInt(goal.progress)
            ? goal.progress + 1 > goal.durationDays
              ? goal.durationDays
              : goal.progress + 1
            : 1,
        id: goal.id,
      }).catch(() =>
        toast.error(
          "Yikes! Something went wrong while trying to mark your routine as done",
          toastStyles
        )
      );
    }
  };

  useEffect(() => {
    if (isCompleted && !alreadyPlayed) {
      new Audio("/sfx/confetti.mp3").play();
      setAlreadyPlayed(true);
    }
  }, [isCompleted, alreadyPlayed]);

  const handleTrophyEarn = async (icon) => {
    try {
      setLoading(true);
      await fetchRawApi("user/coach/goals/complete", {
        daysLeft: goal.durationDays - goal.progress,
        feedback: icon,
        id: goal.id,
      });
      await mutate(mutationUrl);
      setStepTwoOpen(false);
      toast.success("You earned a trophy! Thanks for your feedback!", {
        ...toastStyles,
        icon: "🎉",
      });
      setLoading(false);
    } catch (e) {
      toast.error("An error occurred. Please try again later.", toastStyles);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        mx: "auto",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        "& .goal-task": {
          flexGrow: 1,
          px: 3,
          background: palette[2],
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          width: "100%",
          display: "flex",
          maxWidth: "700px",
          flexDirection: "column",
          justifyContent: "center",
        },
      }}
    >
      <Dialog
        open={stepTwoOpen}
        onClose={() => setStepTwoOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 5,
          },
        }}
        maxWidth="xs"
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Are you satisfied with your progress?
          </Typography>
          <Typography>
            We&apos;d love to hear your feedback so we can improve our platform!
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {[
              "sentiment_dissatisfied",
              "sentiment_neutral",
              "sentiment_satisfied",
            ].map((icon) => (
              <IconButton
                key={icon}
                onClick={() => handleTrophyEarn(icon)}
                disabled={loading}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "50px",
                  }}
                >
                  {icon}
                </span>
              </IconButton>
            ))}
          </Box>
        </Box>
      </Dialog>
      <motion.div
        className="goal-task"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        {!isCompleted && (
          <Box sx={{ mt: "auto" }}>
            <Chip label={`${goal.timeOfDay}:00`} sx={{ mb: 2 }} />
            <Typography
              variant="h1"
              sx={{
                lineHeight: "85px",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              className="font-heading"
            >
              {goal.stepName}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              {~~((goal.progress / goal.durationDays) * 100)}% complete
            </Typography>
          </Box>
        )}
        {isCompleted && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: "auto",
            }}
          >
            <Confetti
              friction={1}
              width={width}
              height={height}
              style={{
                zIndex: 1,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              style={{
                width: 100,
                height: 100,
              }}
            >
              <picture>
                <img
                  alt="trophy"
                  src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c6.png"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </picture>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.7 }}
              style={{
                maxWidth: "calc(100% - 20px)",
                textAlign: "center",
              }}
            >
              <Typography className="font-heading" variant="h3">
                {goal.name}
              </Typography>
              <Typography>
                After {goal.durationDays} days of hard work, you earned a
                trophy!
              </Typography>
            </motion.div>
          </Box>
        )}

        <Button
          sx={{
            mt: "auto",
            zIndex: 999999999,
            mb: 2,
            background: palette[3],
          }}
          variant="contained"
          onClick={handleNext}
          disabled={goal.lastCompleted === dayjs().format("YYYY-MM-DD")}
        >
          Claim <Icon>east</Icon>
        </Button>
      </motion.div>
      <Box
        sx={{ mt: "auto", width: "100%", p: 1, display: "flex", zIndex: 999 }}
      >
        <Button sx={{ color: "#fff" }} size="small">
          <Icon>local_fire_department</Icon>
          Activity
        </Button>
        <ShareGoal goal={goal}>
          <IconButton sx={{ ml: "auto" }}>
            <Icon>ios_share</Icon>
          </IconButton>
        </ShareGoal>
      </Box>
    </Box>
  );
}

export default function Routine() {
  const router = useRouter();
  const session = useSession();
  const palette = useColor(session.themeColor, session.user.darkMode);

  const { data, url, error } = useApi("user/coach");

  const [slide, setSlide] = useState(-1);

  const filteredGoals = useMemo(
    () =>
      (data || [])
        .sort((a, b) => a.timeOfDay - b.timeOfDay)
        .sort(function (x, y) {
          // true values first
          return x.completed === y.completed ? 0 : x.completed ? -1 : 1;
          // false values first
          // return (x === y)? 0 : x? 1 : -1;
        })
        .filter((goal) => !goal.completed),
    [data]
  );

  const [alreadySwitched, setAlreadySwitched] = useState(false);

  useEffect(() => {
    if (data && filteredGoals[0] && !alreadySwitched) {
      setSlide(0);
      setAlreadySwitched(true);
    }
  }, [filteredGoals, data, alreadySwitched]);

  const handleNext = () =>
    setSlide((s) => (filteredGoals.length === s ? s : s + 1));
  const handlePrev = () => setSlide((s) => (s === 0 ? 0 : s - 1));

  useHotkeys("ArrowRight", handleNext);
  useHotkeys("ArrowLeft", handlePrev);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        mx: "auto",
        left: 0,
        width: "100vw",
        height: "100vh",
        background: palette[1],
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          top: 0,
          zIndex: 999999,
          gap: 0.5,
          p: 1,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "700px",
          width: "100%",
        }}
      >
        {[...new Array(filteredGoals?.length || 0)].map((_, index) => (
          <Box
            key={index}
            sx={{
              height: "2px",
              width: "100%",
              background: palette[slide === index ? 10 : index < slide ? 9 : 4],
            }}
          />
        ))}
      </Box>
      <IconButton
        onClick={() => router.push("/coach")}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          m: 2,
          mt: 3,
          zIndex: 9999,
        }}
      >
        <Icon>west</Icon>
      </IconButton>
      {slide === -1 && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        sx={{
          height: "100vh",
          width: "50vw",
          position: "absolute",
          right: 0,
          zIndex: 99,
          top: 0,
        }}
        onClick={handleNext}
      />
      <Box
        sx={{
          height: "100vh",
          width: "50vw",
          position: "absolute",
          left: 0,
          zIndex: 99,
          top: 0,
        }}
        onClick={handlePrev}
      />
      {filteredGoals.map(
        (goal, index) =>
          slide === index && (
            <GoalTask
              mutationUrl={url}
              setSlide={setSlide}
              goal={goal}
              key={goal.id}
            />
          )
      )}
      {slide >= filteredGoals?.length && (
        <motion.div
          initial={{ opacity: 0, scale: 3 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <Typography variant="h1" sx={{ mb: 1 }} className="font-heading">
              All done.
            </Typography>
            <Typography sx={{ mb: 2 }}>Come back tomorrow for more.</Typography>
            <Button
              onClick={() => router.push("/coach")}
              sx={{ zIndex: 999 }}
              variant="contained"
              size="large"
            >
              <Icon>home</Icon>Done
            </Button>
          </Box>
        </motion.div>
      )}
    </Box>
  );
}
