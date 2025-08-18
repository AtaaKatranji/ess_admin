export async function fetcher<T = unknown>(
  input: string | URL | Request,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let errorMessage = `Request failed with ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      const message = (data as { message?: string }).message;
      if (message) errorMessage = message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}


export async function authedJSON<T = unknown>(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}


