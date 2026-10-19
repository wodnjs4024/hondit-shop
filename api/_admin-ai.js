// Admin AI tools: status, enquiry reply draft, product text translation. Nothing is sent to customers from here;
// the owner reviews every draft and sends it through their usual channel.
import { AiError, aiConfigured, draftInquiryReply, translateProductText } from "./_ai.js";
import { json, readBody, supabase, verifyAdmin } from "./_utils.js";

export async function adminAi(req, res, parts) {
  await verifyAdmin(req);
  const action = parts[1];
  if (action === "status" && req.method === "GET") return json(res, 200, { configured: aiConfigured() });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    const body = await readBody(req);
    if (action === "reply") {
      let inquiry = body.inquiry || null;
      if (body.inquiryId) {
        const rows = await supabase(`/inquiries?id=eq.${encodeURIComponent(String(body.inquiryId))}&select=*`);
        inquiry = rows[0] || null;
      }
      if (!inquiry?.message) return json(res, 422, { error: "답변할 문의 내용이 없습니다." });
      return json(res, 200, { draft: await draftInquiryReply(inquiry) });
    }
    if (action === "translate") return json(res, 200, { translations: await translateProductText(body.source) });
    return json(res, 404, { error: "Admin AI endpoint not found" });
  } catch (error) {
    if (error instanceof AiError) return json(res, error.status, { error: error.message });
    throw error;
  }
}
