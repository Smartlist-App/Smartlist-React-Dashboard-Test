import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import toast from "react-hot-toast";
import { useApi } from "../../hooks/useApi";
import { colors } from "../../lib/colors";
import type { ApiResponse } from "../../types/client";

/**
 * Upgrade banner
 */
export function UpgradeBanner() {
  const { data }: ApiResponse = useApi("property/inventory/count");

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 5 },
      }}
    >
      {data && (
        <Box
          ref={() => {
            global.setItemLimitReached(data >= 250);
          }}
          sx={{
            background: colors.orange["100"].toString(),
            color: colors.orange["800"].toString(),
            borderRadius: 5,
            px: 3,
            py: 2,
            mb: 2,
          }}
        >
          <LinearProgress
            color="inherit"
            sx={{
              height: 8,
              borderRadius: 5,
              mb: 1,
              backgroundColor: colors.orange["100"].toString(),
            }}
            variant="determinate"
            value={(data / 250) * 100}
          />
          <Typography>{data} out of 250 items</Typography>
        </Box>
      )}
      <Box
        sx={{
          border: `2px solid ${colors.orange["500"].toString()}`,
          color: colors.orange["800"].toString(),
          borderRadius: 5,
          px: 3,
          py: 2,
        }}
      >
        <Typography
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          Upgrade to{" "}
          <Box
            sx={{
              px: 1,
              py: 0.2,
              color: colors.orange["50"].toString(),
              borderRadius: 1,
              background: colors.orange["700"],
              display: "inline",
            }}
          >
            SUPER
          </Box>
        </Typography>
        <Typography
          sx={{
            color: colors.orange[900].toString(),
            fontSize: "0.8rem",
            fontWeight: "500",
            mt: 1,
          }}
        >
          With Carbon Super, you can invite more members, store more items, and
          support us! You can always downgrade later and access all features.
        </Typography>
        <Typography
          sx={{
            color: colors.orange[900].toString(),
            fontSize: "0.8rem",
            fontWeight: "500",
            mt: 1,
          }}
        >
          As an early supporter, you can get Carbon Super for free for the first
          month!
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            toast("Coming soon!");
          }}
          sx={{
            width: "100%",
            borderRadius: 5,
            mt: 2,
            background: `${colors.orange["700"]}!important`,
            color: "#fff",
          }}
        >
          $0.30 / month
        </Button>
      </Box>
    </Box>
  );
}
