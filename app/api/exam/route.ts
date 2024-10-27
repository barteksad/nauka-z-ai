import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { examTypeSchema } from "@/lib/definitions";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: convertToCoreMessages(messages),
    experimental_toolCallStreaming: true,
    tools: {
      generateExam: {
        description: `Use this tool to generate the exam in correct format.`,
        parameters: examTypeSchema,
      },
    },
    toolChoice: messages.length === 1 ? "required" : "none",
    temperature: 1,
    topP: 0.95,
    system: `Generate one detailed exam for a specific topic the student is learning. 
          The questions should be of hight quality and should result in a good learning experience. Write 10 questions of different categories: single-choice, multiple-choice and open-ended.
          The result of generateExam tool call will be presented to the student. 
          Then you will see the student's answers and you will be able to give feedback. Provide insightful information about incorrect answers and highlight key topics to study more. For correct answers, just say correct.
          Use the following structure for scoring the answers:
          
          [✅/🟡/❌] [Question index + Question text] 
          [Detailed correct answer explanation with key points. For open-ended questions also with references to student answer]
          
          Use the same language as the student.
          `,
  });

  return result.toDataStreamResponse();
}
