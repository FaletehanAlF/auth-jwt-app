export type TestResponse = {
  status: number;
  headers: Record<string, string>;
  /** body mentah sebagai teks */
  text: string;
  /** body hasil JSON.parse, atau undefined bila body bukan JSON */
  json: unknown;
  isJson: boolean;
};

/**
 * Request HTTP ke server test. Sengaja tidak memakai helper apa pun dari
 * frontend: kontrak yang diuji adalah respons apa yang DIKIRIM backend,
 * bukan cara frontend membacanya.
 */
export async function callApi(
  url: string,
  init?: RequestInit
): Promise<TestResponse> {
  const response = await fetch(url, init);
  const text = await response.text();

  let json: unknown;
  let isJson = false;
  try {
    json = JSON.parse(text);
    isJson = true;
  } catch {
    // body bukan JSON (mis. file PDF pada /applications/:id/cv)
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return { status: response.status, headers, text, json, isJson };
}

/** Init request JSON + header tambahan (mis. Authorization). */
export function jsonInit(
  method: string,
  body: unknown,
  extraHeaders?: Record<string, string>
): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify(body),
  };
}
