import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useApi } from "../../hooks/useApi";
import { colors } from "../../lib/colors";
import type { ApiResponse } from "../../types/client";

/**
 * Item limit
 */
export function UpgradeBanner({ color }: { color: string }) {
  const { data }: ApiResponse = useApi("property/inventory/count");
  return !data ? null : (
    <Box>
      <Box
        sx={{
          background: `${colors[color]["100"].toString()}`,
          color: colors[color]["900"].toString(),
          borderRadius: 5,
          px: 3,
          py: 2,
          mb: 5,
        }}
        ref={() => {
          global.setItemLimitReached(data >= 250);
        }}
      >
        <LinearProgress
          color="inherit"
          sx={{
            height: 8,
            borderRadius: 5,
            mb: 1,
            backgroundColor: colors[color]["100"].toString(),
          }}
          variant="determinate"
          value={(data.count / 250) * 100}
        />
        <Typography>{data.count} out of 250 items. </Typography>
      </Box>
    </Box>
  );
}
