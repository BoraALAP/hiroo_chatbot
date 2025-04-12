
import { getAgentExecutor } from "@/agents/executor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message, history = "" } = body;

    const agent = await getAgentExecutor();

    const result = await agent.invoke({
      input: message,
      chat_history: history.map((m: string) => ({ role: "user", content: m })),
    });

    
    console.log("response",result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in chat handler:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
  