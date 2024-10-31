import { getFromStorage } from "./StorageUtil";

interface RequestConfig {
  isAuthenticated: boolean;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: { [key: string]: [value: string | number | object | boolean] };
  body: any;
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
      Authorization: (authToken && `Bearer ${authToken}`) || undefined,
      ...(requestConfig?.headers || []),
    },
    body: requestConfig?.body,
  });
};

export const apiGet = async (url: string, authenticated?: boolean) => {
  url = process.env.SERVER_URL + url;
  return authenticatedRequest(url, {
    method: "GET",
    isAuthenticated: authenticated,
  });
};

export const apiPost = async (
  url: string,
  authenticated?: boolean,
  headers: { [key: string]: [value: string | number | object | boolean] } = {}
) => {
  url = process.env.SERVER_URL + url;
  return authenticatedRequest(url, {
    method: "POST",
    isAuthenticated: authenticated,
    headers: headers,
  });
};
