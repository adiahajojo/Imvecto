const BRICKKEN_BASE_URL = "https://api.sandbox.brickken.com";

export async function brickkenPrepare(method: string, body: Record<string, any>) {
  const res = await fetch(`${BRICKKEN_BASE_URL}/prepare-transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.BRICKKEN_API_KEY as string,
    },
    body: JSON.stringify({ method, ...body }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `Brickken prepare failed, status ${res.status}`);
  }

  return data;
}

export async function brickkenConfirm({ txId, txHash }: { txId: string; txHash: string }) {
  const res = await fetch(`${BRICKKEN_BASE_URL}/send-transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.BRICKKEN_API_KEY as string,
    },
    body: JSON.stringify({ txId, txHash }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `Brickken confirm failed, status ${res.status}`);
  }

  return data;
}
