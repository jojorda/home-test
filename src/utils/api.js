import axios from "axios";

const api = axios.create({
  baseURL: "https://test-fe.myselferpintar.com/api",
});

export default api;
