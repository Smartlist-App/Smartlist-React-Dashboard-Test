const webPush = require("web-push");

const Notification = (req, res) => {
  if (req.method == "POST") {
    webPush.setVapidDetails(
      `mailto:${process.env.WEB_PUSH_EMAIL}`,
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY
    );

    const { subscription } = req.body;
    webPush
      .sendNotification(
        subscription,
        JSON.stringify({
          title: "You have an upcoming maintenance task",
          body: "Replace the AC filter",
        })
      )
      .then((res) => console.log("Sent"))
      .catch((err) => {
        console.log("Error");
      });

    res.status(200).json({ message: "Notification sent" });
  }
};

export default Notification;
