"use client";
import { useEffect, useState } from "react";
import { ExamType } from "@/lib/definitions";
import Questions from "./Questions";
import { Message } from "ai";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator"
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function formatSelectedAnswers(selectedAnswers: (string | Set<string> | null)[][]) {
    return (
        "Student selected answers:\n" +
        selectedAnswers.map((section, index) => `Section ${index}: \n${section.map((answer, i) => {
            if (answer === null) return `${i}: No answer`;
            if (answer instanceof Set) return `${i}: ${Array.from(answer).join(", ")}`;
            return `${i}: ${answer}`;
        }).join("\n ")}`).join("\n\n")
        + "\nVerify them and give feedback as instructed."
    );
}

function SectionsInner({
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
    const [sectionAnswers, setSectionAnswers] = useState<(string | Set<string> | null)[][]>(
        exam.sections.map((section) => section.questions.map((question) => {
            if (question.type === "multiple-choice") {
                return new Set<string>();
            } else if (question.type === "single-choice") {
                return null;
            } else {
                return "";
            }
        }))
    );
    const allAnswersSet = sectionAnswers.every((answers) => answers.every((answer) => answer !== null));
    const [skipAllAnswersSet, setSkipAllAnswersSet] = useState(false);

    const handleSubmit = () => {
        if (allAnswersSet) {
            addToolResult({
                toolCallId: toolCallId,
                result: formatSelectedAnswers(sectionAnswers),
            });
        }
    };

    const setSelectedAnswer = (sectionIndex: number, questionIndex: number, answer: string) => {
        const questionType = exam.sections[sectionIndex].questions[questionIndex].type;
        setSectionAnswers((prev) => {
            const newAnswers = structuredClone(prev);
            if (questionType === "multiple-choice") {
                // Create a new Set instance with the previous values
                const currentSet = newAnswers[sectionIndex][questionIndex] as Set<string>;
                const newSet = new Set(currentSet);

                if (newSet.has(answer)) {
                    newSet.delete(answer);
                } else {
                    newSet.add(answer);
                }
                newAnswers[sectionIndex][questionIndex] = newSet;
            } else if (questionType === "single-choice") {
                // Rest of the logic remains the same
                if (answer === newAnswers[sectionIndex][questionIndex]) {
                    newAnswers[sectionIndex][questionIndex] = null;
                } else {
                    newAnswers[sectionIndex][questionIndex] = answer;
                }
            } else {
                newAnswers[sectionIndex][questionIndex] = answer;
            }
            console.log(newAnswers)
            return newAnswers;
        });
    }

    return (
        <div>
            {exam.sections.map((section, index) => (
                <Card key={index} className="mb-6">
                    <CardHeader>
                        <CardTitle>{section.name}</CardTitle>
                    </CardHeader>
                    <p className="text-muted-foreground mb-4 p-4">{section.outline}</p>
                    <Separator className="my-4" />
                    <CardContent>

                        <Questions
                            questions={section.questions}
                            setAnswer={(questionIndex, answer) => setSelectedAnswer(index, questionIndex, answer)}
                            settedAnswers={sectionAnswers[index]}
                        />
                    </CardContent>
                </Card>
            )
            )
            }
            <Button type="submit" variant="outline" size="lg" onClick={handleSubmit} disabled={!skipAllAnswersSet}>Check</Button>
            <Button type="submit" variant="outline" size="lg" onClick={() => setSkipAllAnswersSet(true)}>Skip filling all</Button>
        </div >
    )
}


function SectionsSkeleton() {
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

export default function Sections({
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
        if (message.toolInvocations![0].state !== "partial-call") {
            setIsLoading(false);
            setExam({ sections: message.toolInvocations![0].args.sections } as ExamType);
        }
    }, [message]);

    if (isLoading) {
        return <SectionsSkeleton />;
    } else {
        console.log(message)
        console.log(exam)
        return (
            <SectionsInner
                exam={exam!}
                toolCallId={toolCallId}
                addToolResult={addToolResult}
            />
        );
    }
}