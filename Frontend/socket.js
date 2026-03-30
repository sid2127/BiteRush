import { io } from "socket.io-client";
import { serverUrl } from "./src/App";

export const socket = io(serverUrl, {
  withCredentials: true,
  autoConnect: false   // optional (recommended)
});
