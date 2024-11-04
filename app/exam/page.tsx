"use client";

import { useChat } from "ai/react";
import Topic from "@/components/Topic";
import Answer from "@/components/Answer";
import Sections from "@/components/Sections";

export default function Exam() {
    const { messages, input, handleInputChange, handleSubmit, addToolResult } =
        useChat({
            api: "/api/exam",
        });

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <Topic
                    input={input}
                    messages={messages}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                />
                {messages.length > 1 && (
                    <Sections
                        message={messages[1]}
                        addToolResult={addToolResult}
                    />
                )}
                {messages.length > 2 && (
                    <Answer
                        message={messages[2]}
                    />
                )}
            </main>
        </div>
    );
}