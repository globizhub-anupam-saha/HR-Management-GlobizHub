import { NextRequest, NextResponse } from "next/server";
import { matchHRMSKnowledge, CopilotResponse } from "@/lib/copilot/knowledge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, currentRoute = "/workspace/dashboard", role = "EMPLOYEE" } = body;

    // Check if an AI API key is configured (Gemini or OpenAI)
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        const aiResponse = await callGeminiLLM(message, currentRoute, role, geminiKey);
        if (aiResponse) {
          return NextResponse.json(aiResponse);
        }
      } catch (geminiErr) {
        console.warn("[Copilot] Gemini API error, falling back to knowledge base:", geminiErr);
      }
    } else if (openaiKey) {
      try {
        const aiResponse = await callOpenAILLM(message, currentRoute, role, openaiKey);
        if (aiResponse) {
          return NextResponse.json(aiResponse);
        }
      } catch (openaiErr) {
        console.warn("[Copilot] OpenAI API error, falling back to knowledge base:", openaiErr);
      }
    }

    // Default: Fast, reliable, zero-latency Mock / Knowledge Base Engine
    const localResult = matchHRMSKnowledge(message, currentRoute, role);
    return NextResponse.json(localResult);
  } catch (error: any) {
    console.error("[Copilot Route Error]", error);
    return NextResponse.json(
      {
        reply: "Sorry, I ran into an issue retrieving that information. Please try again or visit the Support module.",
        suggestedActions: [{ label: "Help & Support", url: "/workspace/support" }],
        source: "knowledge_base",
      } as CopilotResponse,
      { status: 500 }
    );
  }
}

async function callGeminiLLM(
  prompt: string,
  currentRoute: string,
  role: string,
  apiKey: string
): Promise<CopilotResponse | null> {
  const systemInstruction = `You are Gpilot, the AI assistant for GlobizHR. 
You guide users step-by-step through using this HRMS platform.
The user is currently on route: "${currentRoute}".
Their role is: "${role}".
Workspace routes available in the system:
- /workspace/dashboard: Company overview and quick stats
- /workspace/employees: Staff directory, add employee, bulk CSV/Excel import, employee profile, document verification
- /workspace/documents: Company policies and employee uploaded KYC/contracts
- /workspace/leave: Apply for leaves (Casual, Sick, Earned, Maternity) and manager approvals
- /workspace/attendance: Clock in/out, view daily logs, shift times, regularization
- /workspace/payroll: Salary breakdown, simulation, payroll runs, allowances, deductions, bank export
- /workspace/my-payslips: Employee payslip view and PDF downloads
- /workspace/recruitment: Job postings, candidate pipeline Kanban board, interview scheduling
- /workspace/onboarding: New hire checklist, document submissions, IT provisioning
- /workspace/training: Universal workforce training, cohorts, competency scoring, certifications
- /workspace/resignation: Resignation requests, notice periods, Last Working Day, IT/Finance/HR exit clearances
- /workspace/shifts: Shift timings, grace periods, lunch breaks, late marks
- /workspace/schedules: Weekly shift rosters, team assignments, weekly offs
- /workspace/settings/payroll: CTC salary templates (Basic %, HRA %, PF %, allowances)
- /workspace/settings/audit-logs: Audit trail of CREATE, UPDATE, DELETE, APPROVE actions
- /workspace/settings/holidays: Annual company holiday calendar (Mandatory and Restricted)
- /workspace/settings: Company profile, organization branding, roles & permissions (RBAC)
- /workspace/tasks: Assigning internal action items, due dates, priorities
- /workspace/profile: Employee self-service, encrypted bank details, security/password
- /workspace/support: IT and HR ticket desk

Keep your answers direct, friendly, and structured in clean Markdown with numbered steps.
Return your answer as a JSON object with:
{
  "reply": "markdown text answer with numbered steps",
  "suggestedActions": [ { "label": "Go to Page", "url": "/workspace/..." } ],
  "suggestedQuestions": [ "Follow-up question 1?", "Follow-up question 2?" ]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const parsed = JSON.parse(rawText);
  return {
    reply: parsed.reply,
    suggestedActions: parsed.suggestedActions || [],
    suggestedQuestions: parsed.suggestedQuestions || [],
    source: "llm",
  };
}

async function callOpenAILLM(
  prompt: string,
  currentRoute: string,
  role: string,
  apiKey: string
): Promise<CopilotResponse | null> {
  const systemInstruction = `You are Gpilot, the AI assistant for GlobizHR. Guide users step-by-step.
Current route: "${currentRoute}", User Role: "${role}".
Respond in JSON format:
{
  "reply": "markdown text with clear steps",
  "suggestedActions": [ { "label": "Button Label", "url": "/workspace/..." } ],
  "suggestedQuestions": [ "follow up 1", "follow up 2" ]
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  const parsed = JSON.parse(rawContent);
  return {
    reply: parsed.reply,
    suggestedActions: parsed.suggestedActions || [],
    suggestedQuestions: parsed.suggestedQuestions || [],
    source: "llm",
  };
}

