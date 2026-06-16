const KOBO_BASE_URL = process.env.KOBO_BASE_URL;
const KOBO_ASSET_UID = process.env.KOBO_ASSET_UID;
const KOBO_API_TOKEN = process.env.KOBO_API_TOKEN;

export async function searchKoboSubmissions(queryStr: string) {
  if (!KOBO_BASE_URL || !KOBO_ASSET_UID || !KOBO_API_TOKEN) {
    throw new Error("Missing Kobo configuration");
  }

  // To safely construct the query
  const queryObj = {
    $or: [
      { phone_number: { $regex: queryStr, $options: "i" } },
      { full_name: { $regex: queryStr, $options: "i" } },
      { participant_id: { $regex: queryStr, $options: "i" } },
    ],
  };

  const url = `${KOBO_BASE_URL}/api/v2/assets/${KOBO_ASSET_UID}/data/?query=${encodeURIComponent(
    JSON.stringify(queryObj)
  )}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${KOBO_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Kobo API Error:", text);
    throw new Error(`Kobo API error: ${res.status}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getKoboSubmissionById(id: number) {
  if (!KOBO_BASE_URL || !KOBO_ASSET_UID || !KOBO_API_TOKEN) {
    throw new Error("Missing Kobo configuration");
  }

  const queryObj = { _id: id };
  const url = `${KOBO_BASE_URL}/api/v2/assets/${KOBO_ASSET_UID}/data/?query=${encodeURIComponent(
    JSON.stringify(queryObj)
  )}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${KOBO_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Kobo API Error:", text);
    throw new Error(`Kobo API error: ${res.status}`);
  }

  const data = await res.json();
  return data.results?.[0] || null;
}
