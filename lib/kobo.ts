const KOBO_BASE_URL = process.env.KOBO_BASE_URL;
const KOBO_ASSET_UID = process.env.KOBO_ASSET_UID;
const KOBO_API_TOKEN = process.env.KOBO_API_TOKEN;

// Mock data for showcase purposes
const mockSubmissions = [
  {
    _id: 1001,
    phone_number: "+1234567890",
    full_name: "Alice Smith",
    participant_id: "SF-001",
    camp: "North Camp",
    _submission_time: "2026-06-12T10:00:00.000Z",
    age: 25,
    registration_status: "Approved",
    emergency_contact: "+1098765432",
    dietary_requirements: "Vegetarian",
    _uuid: "uuid-1",
    _notes: [],
  },
  {
    _id: 1002,
    phone_number: "+0987654321",
    full_name: "Bob Jones",
    participant_id: "SF-002",
    camp: "East Camp",
    _submission_time: "2026-06-13T11:30:00.000Z",
    age: 32,
    registration_status: "Pending",
    emergency_contact: "+1122334455",
    dietary_requirements: "None",
    _uuid: "uuid-2",
    _notes: [],
  },
  {
    _id: 1003,
    phone_number: "+1122334455",
    full_name: "Charlie Brown",
    participant_id: "SF-003",
    camp: "South Camp",
    _submission_time: "2026-06-14T09:15:00.000Z",
    age: 28,
    registration_status: "Approved",
    emergency_contact: "+1555666777",
    dietary_requirements: "Gluten-Free",
    _uuid: "uuid-3",
    _notes: [],
  }
];

// Helper to determine if we should mock
const useMock = process.env.MOCK_KOBO_DATA === "true" || process.env.MOCK_KOBO_DATA === undefined;

export async function searchKoboSubmissions(queryStr: string) {
  if (useMock) {
    console.log("Using Mock Kobo API for search:", queryStr);
    const lowerQuery = queryStr.toLowerCase();
    return mockSubmissions.filter(sub => 
      (sub.phone_number?.toLowerCase().includes(lowerQuery)) ||
      (sub.full_name?.toLowerCase().includes(lowerQuery)) ||
      (sub.participant_id?.toLowerCase().includes(lowerQuery))
    );
  }

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
  if (useMock) {
    console.log("Using Mock Kobo API for getById:", id);
    return mockSubmissions.find(sub => sub._id === Number(id)) || null;
  }

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
