"use client";
import { QuestionType } from "@/lib/definitions";
import Question from "./Question";

function QuestionsInner({
    questions,
    setAnswer,
    settedAnswers,
}: {
    questions: QuestionType[];
    setAnswer: (questionIndex: number, answer: string) => void;
    settedAnswers: (string | Set<string> | null)[];
}) {

    return (
        <div className="space-y-4">
            {questions.map((question, index) => (
                <Question
                    key={index}
                    question={question}
                    setAnswer={(answer) => setAnswer(index, answer)}
                    settedAnswer={settedAnswers[index]}
                />
            ))}
        </div>
    );
}


export default function Questions({
    questions,
    setAnswer,
    settedAnswers,
}: {
    questions: QuestionType[];
    setAnswer: (questionIndex: number, answer: string) => void;
    settedAnswers: (string | Set<string> | null)[];
}) {
    return (
        <QuestionsInner
            questions={questions}
            setAnswer={setAnswer}
            settedAnswers={settedAnswers}
        />
    );
};
