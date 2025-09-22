import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { csrfService } from "@/services/csrfService";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isFormData = data instanceof FormData;
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  
  // Get CSRF token for state-changing requests
  const csrfHeaders = isStateChanging ? await csrfService.getHeaders() : {};
  
  const headers = isFormData 
    ? csrfHeaders 
    : { 
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...csrfHeaders 
      };
  
  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: "include",
  });

  // If CSRF token is invalid, clear it and retry once
  if (res.status === 403 && isStateChanging) {
    const errorText = await res.text();
    if (errorText.includes('CSRF')) {
      csrfService.clearToken();
      
      // Retry with fresh token
      const newCsrfHeaders = await csrfService.getHeaders();
      const retryHeaders = isFormData 
        ? newCsrfHeaders 
        : { 
            ...(data ? { "Content-Type": "application/json" } : {}),
            ...newCsrfHeaders 
          };
      
      const retryRes = await fetch(url, {
        method,
        headers: retryHeaders,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
        credentials: "include",
      });
      
      await throwIfResNotOk(retryRes);
      return retryRes;
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
