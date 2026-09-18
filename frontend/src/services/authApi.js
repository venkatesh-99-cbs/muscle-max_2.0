import api from "./api";

export const registerUser = (data) => api.post("/accounts/register/", data);

export const loginUser = (data) => api.post("/accounts/login/", data);

export const refreshToken = (refresh) =>
  api.post("/accounts/token/refresh/", { refresh });

export const getMe = () => api.get("/accounts/me/");
