import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Icon,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";

function TimeSelector({ time, setTime }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClick}>
        {time + 1}:00 <Icon>expand_more</Icon>
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {[...new Array(24)].map((_, hour) => (
          <MenuItem
            onClick={() => {
              setTime(hour);
              handleClose();
            }}
            key={hour}
            selected={time === hour + 1}
          >
            {hour + 1 - (hour >= 12 ? 12 : 0)}
            {hour + 1 > 12 ? "PM" : "AM"}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
export default function CreateGoal() {
  const session = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));
  const isMobile = useMediaQuery("(min-width: 600px)");
  const numberRef: any = useRef();

  const steps = [
    {
      type: "text",
      name: "What's your goal",
      placeholder: "Throw the trash today",
      helperText: "You'll be reminded to do this",
      id: "stepName",
    },
    {
      type: "number",
      placeholder: "5 days",
      name: "How long do you want to work on this goal?",
      id: "durationDays",
    },
    {
      type: "daySelector",
      name: "What days do you want to work on this goal?",
      id: "daysOfWeek",
    },
    {
      type: "time",
      name: "What time do you want to work on this goal?",
      id: "timeOfDay",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    durationDays: 7,
    timeOfDay: 7,
    stepName: "",
    daysOfWeek: [true, true, true, true, true, true, true],
  });

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleInputChange = (event) => {
    let { id, type, value } = event.target;
    if (type === "number" && value < 5) value = 5;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      await fetchRawApi(session, "user/coach/goals/create", {
        ...formData,
        name: formData.stepName,
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error("Something went wrong. Please try again later.");
    }
  }, [formData, session, setLoading]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <AppBar sx={{ position: "fixed", left: 0, top: 0 }}>
        <Toolbar>
          <IconButton onClick={() => setCurrentStep(currentStep - 1)}>
            <Icon>arrow_back_ios_new</Icon>
          </IconButton>
        </Toolbar>
        <LinearProgress
          variant="determinate"
          value={((currentStep + 1) / (steps.length + 1)) * 100}
        />
      </AppBar>
      <Box
        sx={{
          width: "500px",
          mx: "auto",
          px: 5,
          maxWidth: "100vw",
        }}
      >
        <Typography variant="h2" className="font-heading" sx={{ mb: 1 }}>
          {steps[currentStep].name}
        </Typography>
        {steps[currentStep].helperText && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            {steps[currentStep].helperText}
          </Typography>
        )}

        {steps[currentStep].type === "text" && (
          <TextField
            placeholder={steps[currentStep].placeholder}
            variant="outlined"
            id={steps[currentStep].id}
            value={formData[steps[currentStep].id] || ""}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: currentStep == 1 && (
                <InputAdornment position="start">
                  <Icon>check_circle</Icon>
                </InputAdornment>
              ),
            }}
          />
        )}

        {steps[currentStep].type === "daySelector" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[...new Array(7)].map((_, index) => (
              <IconButton
                key={index}
                sx={{
                  width: 45,
                  color: palette[12] + "!important",
                  height: 45,
                  ...(formData.daysOfWeek[index] && {
                    background: palette[3] + "!important",
                    color: palette[11] + "!important",
                  }),
                }}
                onClick={() => {
                  let temp = formData.daysOfWeek;
                  temp[index] = !formData.daysOfWeek[index];
                  setFormData((data) => ({
                    ...data,
                    daysOfWeek: temp,
                  }));
                }}
              >
                {["S", "M", "T", "W", "T", "F", "S"][index]}
              </IconButton>
            ))}
          </Box>
        )}

        {steps[currentStep].type === "time" && (
          <TimeSelector
            time={formData.timeOfDay}
            setTime={(s) => setFormData((d) => ({ ...d, timeOfDay: s }))}
          />
        )}

        {steps[currentStep].type === "number" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton
              disabled={formData[steps[currentStep].id] <= 5}
              onClick={() =>
                setFormData((s) => ({
                  ...s,
                  [steps[currentStep].id]:
                    parseInt(formData[steps[currentStep].id]) - 1,
                }))
              }
            >
              <Icon className="outlined">remove_circle</Icon>
            </IconButton>
            <TextField
              inputRef={numberRef}
              variant="outlined"
              placeholder={steps[currentStep].placeholder}
              type="number"
              size="small"
              fullWidth
              id={steps[currentStep].id}
              value={formData[steps[currentStep].id] || ""}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">days</InputAdornment>
                ),
              }}
            />
            <IconButton
              onClick={() =>
                setFormData((s) => ({
                  ...s,
                  [steps[currentStep].id]:
                    parseInt(formData[steps[currentStep].id]) + 1,
                }))
              }
            >
              <Icon className="outlined">add_circle</Icon>
            </IconButton>
          </Box>
        )}

        {/* Handle other input types (e.g., checkboxes) as needed */}

        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          fullWidth
          onClick={
            currentStep === steps.length - 1 ? handleSubmit : handleNextStep
          }
          disabled={
            formData[steps[currentStep].id]?.length === 0 ||
            formData[steps[currentStep].id] === 0
          }
          style={{ marginTop: "16px" }}
        >
          {currentStep === steps.length - 1 ? "Create Goal" : "Next"}
        </LoadingButton>
      </Box>
    </Box>
  );
}
