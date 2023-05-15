import { useSession } from "@/lib/client/useSession";
import { colors } from "@/lib/colors";
import { Icon, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";

export function UpdateButton() {
  const [button, setButton] = useState<boolean>(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      const wb: any = (window as any).workbox;
      wb.addEventListener("installed", (event) => {});

      wb.addEventListener("controlling", (event) => {});

      wb.addEventListener("activated", (event) => {});

      const promptNewVersionAvailable = () => {
        setButton(true);
        wb.addEventListener("controlling", () => {
          window.location.reload();
        });
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);
      wb.addEventListener("message", (event) => {});

      wb.register();
    }
  }, []);
  const session = useSession();

  return button ? (
    <Tooltip title="A newer version of this app is available. Click to download">
      <IconButton
        color="inherit"
        onClick={(e) => {
          e.stopPropagation();
          window.location.reload();
        }}
        sx={{
          mr: -1,
          color: session.user.darkMode
            ? "hsl(240, 11%, 90%)"
            : colors.green[700],
          transition: "none !important",
          WebkitAppRegion: "no-drag",
        }}
      >
        <Icon>download</Icon>
      </IconButton>
    </Tooltip>
  ) : null;
}
