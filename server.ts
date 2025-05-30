import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("message", (payload) => {
      console.log("The first message is", payload);
    });

    socket.on("add", (payload) => {
      io.emit("add", payload);
    });
    socket.on("minus", (payload) => {
      io.emit("minus", payload);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Socket io Ready `);
    });
});