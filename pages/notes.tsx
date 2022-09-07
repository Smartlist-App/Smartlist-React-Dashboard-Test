import Masonry from "@mui/lab/Masonry";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import useSWR from "swr";
import { ErrorHandler } from "../components/ErrorHandler";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useState } from "react";
import * as colors from "@mui/material/colors";
import { Puller } from "../components/Puller";

function CreateNoteModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      ></SwipeableDrawer>
      <Card
        sx={{ borderRadius: 5, background: "rgba(200,200,200,.3)" }}
        onClick={() => setOpen(true)}
      >
        <CardActionArea>
          <CardContent>
            <Typography
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontWeight: "600",
              }}
            >
              <span className="material-symbols-outlined">add_circle</span>
              New note
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
}

function Note({ note }) {
  return (
    <Card>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {note.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {note.content}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Notes() {
  const url =
    "/api/property/notes?" +
    new URLSearchParams({
      property: global.property.propertyId,
      accessToken: global.property.accessToken,
    });
  const { data, error } = useSWR(url, () =>
    fetch(url).then((res) => res.json())
  );

  return (
    <Container>
      <Typography
        variant="h3"
        sx={{
          my: 12,
          fontWeight: "400",
          textAlign: "center",
        }}
      >
        Notes
      </Typography>
      {error && (
        <ErrorHandler
          error={"An error occured while trying to fetch your notes"}
        />
      )}
      {data ? (
        <Masonry sx={{ mt: 2 }} columns={{ xs: 1, sm: 2, xl: 3 }}>
          <CreateNoteModal />
          {data.map((note, key) => (
            <Note key={key} note={note} />
          ))}
          {data.length === 0 && (
            <>
              {[...Array(10)].map((_, key) => (
                <Skeleton
                  key={key}
                  animation={false}
                  variant="rectangular"
                  sx={{
                    borderRadius: 5,
                    background: "rgba(200,200,200,.15)",
                    height: 200,
                  }}
                />
              ))}
            </>
          )}
        </Masonry>
      ) : (
        <Masonry sx={{ mt: 2 }} columns={{ xs: 1, sm: 2, xl: 3 }}>
          {[...Array(10)].map((_, key) => (
            <Skeleton
              key={key}
              animation={false}
              variant="rectangular"
              sx={{
                borderRadius: 5,
                background: "rgba(200,200,200,.3)",
                height: 200,
              }}
            />
          ))}
        </Masonry>
      )}
    </Container>
  );
}
