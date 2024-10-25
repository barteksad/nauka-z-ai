import { z } from "zod";

export type QuestionType = {
  question: string;
  availableAnswers: string[];
  correctAnswer: string;
};

export type ExamType = {
  questions: QuestionType[];
};

export const examTypeSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("One of questions to ask student"),
      availableAnswers: z.array(
        z
          .string()
          .describe(
            "List of available answers to choose from. The correct one should be in this list and on random position"
          )
      ),
      correctAnswer: z
        .string()
        .describe(
          "Correct answer to the question. Must be one of availableAnswers"
        ),
    })
  ),
});
