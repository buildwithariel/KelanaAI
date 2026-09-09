import { redirect } from "next/navigation";

// The assistant and the chat were merged into one grounded, memory-backed
// experience. This route stays only so old links keep working.
export default function AssistantPage() {
  redirect("/chat");
}
