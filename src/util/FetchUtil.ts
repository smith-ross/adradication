import { getFromStorage } from "./StorageUtil";

interface RequestConfig {
  isAuthenticated: boolean;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: { [key: string]: string | number | object | boolean };
  body: { [key: string]: string | number | object | boolean };
}

type PartialRequestConfig = Partial<RequestConfig>;

const authenticatedRequest = async (
  url: string,
  requestConfig?: PartialRequestConfig
) => {
  let authToken;
  if (requestConfig?.isAuthenticated)
    authToken = await getFromStorage("authToken");

  return fetch(url, {
    method: requestConfig?.method || "GET",
    headers: {
      ["Access-Control-Allow-Origin"]: "*",
      Accept: "application/json",
      ["Content-Type"]: "application/json",
      Authorization: (authToken && `Bearer ${authToken}`) || undefined,
      ...(requestConfig?.headers || []),
    },
    body:
      (requestConfig?.body && JSON.stringify(requestConfig?.body)) || undefined,
  });
};

export const apiGet = async (url: string, authenticated?: boolean) => {
  url = process.env.REACT_APP_SERVER_URL + url;
  return authenticatedRequest(url, {
    method: "GET",
    isAuthenticated: authenticated,
  });
};

export const apiPost = async (
  url: string,
  authenticated: boolean = false,
  config: PartialRequestConfig = {}
) => {
  url = process.env.REACT_APP_SERVER_URL + url;
  return authenticatedRequest(url, {
    method: "POST",
    isAuthenticated: authenticated,
    ...config,
  });
};
