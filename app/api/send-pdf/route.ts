import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getKoboSubmissionById } from "@/lib/kobo";
import { generatePDF } from "@/lib/pdf";
import { sendPdfViaWaha } from "@/lib/waha";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { submissionId, phone } = body;

    if (!submissionId || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch full submission from Kobo
    const submission = await getKoboSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 2. Generate PDF
    const base64Pdf = await generatePDF(submission);

    // 3. Send via WAHA
    const filename = `Satoru_Foundation_Submission_${submissionId}.pdf`;
    await sendPdfViaWaha(phone, base64Pdf, filename);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Send PDF error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
