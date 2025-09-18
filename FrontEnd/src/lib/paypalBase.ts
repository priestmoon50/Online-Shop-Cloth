export const paypalBase = () =>
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export async function getAccessToken() {
  const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const SECRET = process.env.PAYPAL_SECRET;
  if (!CLIENT_ID || !SECRET) throw new Error("Missing PayPal credentials");

  const base = paypalBase();
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data?.access_token)
    throw new Error(`PayPal token error: ${JSON.stringify(data)}`);

  return data.access_token as string;
}
