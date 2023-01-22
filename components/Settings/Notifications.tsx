import {
  Alert,
  Box,
  Button,
  ListItem,
  ListItemText,
  Switch,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ErrorHandler } from "../Error";
import { updateSettings } from "./updateSettings";

const base64ToUint8Array = (base64) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
/**
 * Top-level component for the notification settings page.
 */
export default function Notifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              (sub as any).expirationTime &&
              Date.now() > (sub as any).expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick = async (event) => {
    event.preventDefault();
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
      ),
    });
    setSubscription(sub);
    setIsSubscribed(true);
    updateSettings("notificationSubscription", JSON.stringify(sub));
    console.log("web push subscribed!");
  };

  const unsubscribeButtonOnClick = async (event) => {
    event.preventDefault();
    await subscription.unsubscribe();
    updateSettings("notificationSubscription", "");
    setSubscription(null);
    setIsSubscribed(false);
    console.log("web push unsubscribed!");
  };

  const sendNotificationButtonOnClick = async (event) => {
    event.preventDefault();
    if (subscription === null) {
      console.error("web push not subscribed");
      return;
    }

    fetch("/api/notification", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        subscription,
      }),
    });
  };

  const [periodicSyncSupported, setPeriodicSyncSupported] = useState(false);
  useEffect(() => {
    navigator.serviceWorker.ready.then((registration: any) => {
      setPeriodicSyncSupported(registration.periodicSync);
    });
  }, []);

  const [todoListEnabled, setTodoListEnabled] = useState(false);

  async function registerPeriodicSync() {
    await registration.periodicSync.register("get-lists", {
      minInterval: 1000 * 60 * 60 * 24,
    });
  }

  const isInPwa = useMediaQuery("(display-mode: standalone)");

  return isInPwa || process.env.NODE_ENV !== "production" ? (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning">
        Notifications is still in beta, and you might encounter bugs. We
        recommend you to turn this on later, but if you are curious - feel free
        to try it out at your own risk!
      </Alert>
      {!periodicSyncSupported && (
        <ErrorHandler error="Push notifications are not supported. Please use a supported browser, or the Dysperse app" />
      )}
      <ListItem>
        <ListItemText
          primary="Enable notifications"
          secondary="Receive push notifications to your device"
        />
        <Switch
          disabled={!periodicSyncSupported}
          checked={isSubscribed}
          onClick={(event) => {
            if (isSubscribed) {
              unsubscribeButtonOnClick(event);
            } else {
              subscribeButtonOnClick(event);
            }
          }}
        />
      </ListItem>

      <ListItem>
        <ListItemText primary="To-do list updates" />
        <Switch
          checked={todoListEnabled}
          onClick={() => {
            registerPeriodicSync();
            setTodoListEnabled(!todoListEnabled);
          }}
        />
      </ListItem>

      <Button
        onClick={sendNotificationButtonOnClick}
        disabled={!isSubscribed}
        variant="contained"
        fullWidth
        size="large"
        sx={{
          boxShadow: 0,
          mt: 2,
          mb: 1,
          borderRadius: 5,
        }}
      >
        Send test notification
      </Button>
    </Box>
  ) : (
    <Box
      sx={{ p: 3, borderRadius: 5, background: "rgba(200,200,200,.3)", mb: 5 }}
    >
      Use the Dysperse PWA to enable notifications for Android, Desktop, and
      Chrome OS
      <Button
        fullWidth
        variant="contained"
        href="//my.dysperse.com"
        target="_blank"
        sx={{
          mt: 2,
          borderRadius: 9999,
        }}
      >
        Open
      </Button>
      <Button
        fullWidth
        href="//my.dysperse.com"
        target="_blank"
        size="small"
        sx={{
          mt: 1,
          borderRadius: 9999,
        }}
      >
        Don&apos;t have the app? Install now
      </Button>
    </Box>
  );
}
