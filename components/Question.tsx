import { Suspense } from "react";
import { QuestionType } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle"

function QuestionInner({
    question,
    setAnswer,
    settedAnswer
}: {
    question: QuestionType,
    setAnswer: (answer: string) => void,
    settedAnswer: string | Set<string> | null,
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
                            <Toggle
                                key={index}
                                pressed={(question.type === "single-choice" && settedAnswer === answer) ||
                                    (question.type === "multiple-choice" && (settedAnswer as Set<string>).has(answer))}
                                onPressedChange={() => setAnswer(answer)}
                                variant="outline"
                                aria-label="Toggle italic"
                                className="w-full text-sm p-2 data-[state=on]:border-blue-500 data-[state=on]:border-2"
                            >
                                {answer}
                            </Toggle>
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
    settedAnswer,
}: {
    question: QuestionType,
    setAnswer: (answer: string) => void,
    settedAnswer: string | Set<string> | null,
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuestionInner
                question={question}
                setAnswer={setAnswer}
                settedAnswer={settedAnswer}
            />
        </Suspense>
    );
}
