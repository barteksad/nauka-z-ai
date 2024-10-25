"use client";
import { useEffect, useState } from "react";
import { ExamType } from "@/lib/definitions";
import Question from "./Question";
import { Message } from "ai";
import { Skeleton } from "@/components/ui/skeleton";

function formatSelectedAnswers(selectedAnswers: string[]) {
    return (
        "Student selected answers:\n" +
        selectedAnswers.map((answer, index) => `${index}: ${answer}`).join(", ")
        + "\nVerify them and give feedback."
    );
}

function QuestionsInner({
    exam,
    toolCallId,
    addToolResult,
}: {
    exam: ExamType;
    toolCallId: string;
    addToolResult: ({
        toolCallId,
        result,
    }: {
        toolCallId: string;
        result: string;
    }) => void;
}) {
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
        new Array(exam.questions.length).fill(null)
    );
    const allAnswersSet = selectedAnswers.every((answer) => answer !== null);

    const handleSubmit = () => {
        if (allAnswersSet) {
            addToolResult({
                toolCallId: toolCallId,
                result: formatSelectedAnswers(selectedAnswers),
            });
        }
    };
    const setIthSelectedAnswer = (index: number, answer: string) => {
        setSelectedAnswers((prev) => {
            const newAnswers = [...prev];
            newAnswers[index] = answer;
            return newAnswers;
        });
    };
    return (
        <div>
            {exam.questions.map((question, index) => (
                <Question
                    key={index}
                    question={question}
                    setAnswer={(answer) => setIthSelectedAnswer(index, answer)}
                />
            ))}
            <button onClick={handleSubmit} disabled={!allAnswersSet}>
                Check!
            </button>
        </div>
    );
}

function QuestionSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
}

export default function Questions({
    message,
    addToolResult,
}: {
    message: Message;
    addToolResult: ({
        toolCallId,
        result,
    }: {
        toolCallId: string;
        result: string;
    }) => void;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [exam, setExam] = useState<ExamType | null>(null);
    const toolCallId = message.toolInvocations![0].toolCallId;

    useEffect(() => {
        if (message.toolInvocations![0].state != "partial-call") {
            setIsLoading(false);
            setExam({ questions: message.toolInvocations![0].args.questions } as ExamType);
        }
    }, [message]);

    if (isLoading) {
        return <QuestionSkeleton />;
    } else {
        return (
            <QuestionsInner
                exam={exam!}
                toolCallId={toolCallId}
                addToolResult={addToolResult}
            />
        );
    }
}
