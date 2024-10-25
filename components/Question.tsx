import { Suspense } from "react";

import { QuestionType } from "@/lib/definitions";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function QuestionInner({
    question,
    setAnswer,
}: {
    question: QuestionType,
    setAnswer: (answer: string) => void,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex flex-col items-center space-x-4 rounded-md border p-4">
                    {question.availableAnswers.map((answer, index) => (
                        <Button
                            key={index}
                            onClick={() => setAnswer(answer)}
                            variant="outline"
                            className="w-[400px]"
                        >
                            {answer}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )

}

export default function Question({
    question,
    setAnswer,
}: {
    question: QuestionType,
    setAnswer: (answer: string) => void,
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuestionInner
                question={question}
                setAnswer={setAnswer}
            />
        </Suspense>
    );
}