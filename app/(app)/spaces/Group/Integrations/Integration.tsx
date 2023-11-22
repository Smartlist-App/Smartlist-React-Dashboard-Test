import { useSession } from "@/lib/client/session";
import { Avatar, ListItemButton, ListItemText } from "@mui/material";
import { useRouter } from "next/navigation";

export function Integration({ board, closeParent, integration }) {
  const router = useRouter();
  const { session } = useSession();

  return (
    <>
      <ListItemButton
        sx={{ mb: 1, px: 1, gap: 2, background: "transparent!important" }}
        onClick={() => {
          closeParent();
          setTimeout(() => {
            router.push(
              `/spaces/${session.space.info.id}/integrations/${integration.name
                .toLowerCase()
                .replaceAll(" ", "-")}?board=` + board
            );
          }, 400);
        }}
      >
        <Avatar src={integration.image} sx={{ borderRadius: 3 }} />
        <ListItemText
          primary={integration.name}
          secondary={integration.description}
        />
      </ListItemButton>
    </>
  );
}
