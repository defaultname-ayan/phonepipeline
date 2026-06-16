const WAHA_URL = process.env.WAHA_URL;

export async function sendPdfViaWaha(phone: string, base64Pdf: string, filename: string = "submission.pdf") {
  if (!WAHA_URL) {
    throw new Error("Missing WAHA configuration");
  }

  // WAHA requires chatId in format "number@c.us"
  const cleanPhone = phone.replace(/[\+\-\s()]/g, "");
  const chatId = `${cleanPhone}@c.us`;

  const payload = {
    chatId: chatId,
    file: {
      mimetype: "application/pdf",
      filename: filename,
      data: base64Pdf,
    },
    session: "default",
  };

  const res = await fetch(`${WAHA_URL}/api/sendFile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type");
  
  if (!res.ok) {
    const text = await res.text();
    console.error("WAHA API Error:", text);
    throw new Error(`WAHA API error: ${res.status}`);
  }

  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON from WAHA but got HTML/Text. Check WAHA_URL in .env. Response: ${text.substring(0, 100)}...`);
  }
}
