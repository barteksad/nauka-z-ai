"use client";

import { useChat } from "ai/react";
import Topic from "@/components/Topic";
import Questions from "@/components/Questions";
import Answer from "@/components/Answer";

export default function Exam() {
    const { messages, input, handleInputChange, handleSubmit, addToolResult } =
        useChat({
            api: "/api/exam",
        });

    return (
        <div>
            <Topic
                input={input}
                messages={messages}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
            {messages.length > 1 && (
                <Questions
                    message={messages[1]}
                    addToolResult={addToolResult}
                />
            )}
            {messages.length > 2 && (
                <Answer
                    message={messages[2]}
                />
            )}
        </div>
    );
}