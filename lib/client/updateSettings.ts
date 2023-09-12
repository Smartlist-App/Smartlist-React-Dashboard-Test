import toast from "react-hot-toast";
import { mutate } from "swr";
import { fetchRawApi } from "./useApi";

type SettingsUpdateParams = [key: string, value: string | boolean];
interface SettingsUpdateConfig {
  session: any;
  type?: "user" | "property";
}

export async function updateSettings(
  [key, value]: SettingsUpdateParams,
  config: SettingsUpdateConfig
) {
  try {
    const { session } = config;
    let type = config.type || "user";

    const endpoint = type === "user" ? "user/settings/edit" : "property/edit";
    const params = {
      [key]: String(value),
      token: session.current.token,
      timestamp: new Date().toISOString(),

      // Used for editing property settings
      userName: session.user.name,
      changedKey: key,
      changedValue: value,
    };

    const res = await fetchRawApi(session, endpoint, params);
    await mutate("/api/session");
    return res;
  } catch (e) {
    toast.error("Couldn't save changes. Please try again later");
  }
}

/**
 *   session,
  key: string,
  value: string,
  debug = false,
  callback: null | (() => void) = null,
  property = false,
  hideToast = false,
  errorText = "Couldn't save settings."
 */
