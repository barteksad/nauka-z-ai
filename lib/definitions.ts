import assert from "assert";
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

export type Section = {
  name: string;
  outline: string;
  questions: QuestionType[];
};

export type ExamType = {
  sections: Section[];
};

export const examTypeSchema = z.object({
  sections: z
    .array(
      z.object({
        name: z.string().describe("Name of the exam section "),
        outline: z
          .string()
          .describe(
            "Outline of the exam section with short details about what student should expect and what will learn"
          ),
        questions: z.array(
          z.discriminatedUnion("type", [
            z.object({
              type: z.literal("single-choice"),
              question: z
                .string()
                .describe("One of questions to ask student in this section"),
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
              difficulty: z.enum(["easy", "medium", "hard"]),
            }),
            z.object({
              type: z.literal("multiple-choice"),
              question: z
                .string()
                .describe("One of questions to ask student in this section"),
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
              difficulty: z.enum(["easy", "medium", "hard"]),
            }),
            z.object({
              type: z.literal("open-ended"),
              question: z
                .string()
                .describe("One of questions to ask student in this section"),
              difficulty: z.enum(["easy", "medium", "hard"]),
            }),
          ])
        ),
      })
    )
    .describe("List of sections in the exam"),
});

assert(
  examTypeSchema.safeParse({
    sections: [
      {
        name: "test",
        outline: "test",
        questions: [
          {
            type: "single-choice",
            question: "test",
            availableAnswers: ["test"],
            correctAnswer: "test",
            difficulty: "easy",
          },
          {
            type: "multiple-choice",
            question: "test",
            availableAnswers: ["test"],
            correctAnswers: ["test"],
            difficulty: "easy",
          },
          {
            type: "open-ended",
            question: "test",
            difficulty: "hard",
          },
        ],
      },
    ],
  }).success,
  "ExamType must match examTypeSchema"
);
