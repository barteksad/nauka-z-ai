import { Suspense } from "react";
import { QuestionType } from "@/lib/definitions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";

function QuestionInner({
    question,
    setAnswer,
    settedAnswer
}: {
    question: QuestionType,
    setAnswer: (answer: string) => void,
    settedAnswer: string | Set<string> | null,
}) {
    if (question.type === "single-choice") {
        return (
            <div className="bg-card text-card-foreground rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                        {question.difficulty}
                    </Badge>
                </div>
                <p className="mb-4">{question.question}</p>
                <RadioGroup onValueChange={setAnswer} value={settedAnswer ? settedAnswer.toString() : undefined}>
                    {question.availableAnswers.map((answer, index) => (
                        <div key={index} className="flex items-center space-x-2 py-2">
                            <RadioGroupItem value={answer} id={`answer-${index}`} />
                            <Label htmlFor={`answer-${index}`}>{answer}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        );
    } else if (question.type === "multiple-choice") {
        return (
            <div className="bg-card text-card-foreground rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                        {question.difficulty}
                    </Badge>
                </div>
                <p className="mb-4">{question.question}</p>
                <div className="space-y-2">
                    {question.availableAnswers.map((answer, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                                id={`answer-${index}`}
                                checked={(settedAnswer as Set<string>)?.has(answer)}
                                onCheckedChange={() => setAnswer(answer)}
                            />
                            <Label htmlFor={`answer-${index}`}>{answer}</Label>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (question.type === 'open-ended') {
        return (
            <div className="bg-card text-card-foreground rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                        {question.difficulty}
                    </Badge>
                </div>
                <p className="mb-4">{question.question}</p>
                <Textarea
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </div>
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
