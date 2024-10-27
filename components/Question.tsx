import { Suspense } from "react";
import { QuestionType } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function QuestionInner({
    question,
    setAnswer,
}: {
    question: QuestionType,
    setAnswer: (answer: string) => void,
}) {
    if (question.type === "single-choice" || question.type === "multiple-choice") {
        return (
            <Card className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg border">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                        <span className="block text-ellipsis overflow-hidden">
                            {question.question}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        {question.availableAnswers.map((answer, index) => (
                            <Button
                                key={index}
                                onClick={() => setAnswer(answer)}
                                variant="outline"
                                className="w-full text-sm p-2"
                            >
                                {answer}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    } else if (question.type === 'open-ended') {
        return (
            <Card className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg border">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                        <span className="block text-ellipsis overflow-hidden">
                            {question.question}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <input
                        type="text"
                        className="w-full bg-gray-100 p-2 rounded-md"
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </CardContent>
            </Card>
        );
    }
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
