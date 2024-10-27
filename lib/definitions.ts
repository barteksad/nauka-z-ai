import { z } from "zod";

export type BaseQuestionType = {
  question: string;
};

export type SingleChoiceQuestionType = BaseQuestionType & {
  type: "single-choice";
  availableAnswers: string[];
  correctAnswer: string;
  difficulty: "easy" | "medium" | "hard";
};

export type MultipleChoiceQuestionType = BaseQuestionType & {
  type: "multiple-choice";
  availableAnswers: string[];
  correctAnswers: string[];
  difficulty: "easy" | "medium" | "hard";
};

export type OpenEndedQuestionType = BaseQuestionType & {
  type: "open-ended";
  difficulty: "easy" | "medium" | "hard";
};

export type QuestionType =
  | SingleChoiceQuestionType
  | MultipleChoiceQuestionType
  | OpenEndedQuestionType;

export type ExamType = {
  questions: QuestionType[];
};

export const examTypeSchema = z.object({
  questions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("single-choice"),
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
      }),
      z.object({
        type: z.literal("multiple-choice"),
        question: z.string().describe("One of questions to ask student"),
        availableAnswers: z.array(
          z
            .string()
            .describe(
              "List of available answers to choose from. The correct ones should be in this list"
            )
        ),
        correctAnswers: z
          .array(z.string())
          .describe(
            "Correct answers to the question. Must be a subset of availableAnswers"
          ),
      }),
      z.object({
        type: z.literal("open-ended"),
        question: z.string().describe("One of questions to ask student"),
      }),
    ])
  ),
});
