"use client";

import { useChat } from "ai/react";
import Topic from "@/components/Topic";
import Answer from "@/components/Answer";
import Sections from "@/components/Sections";
import SearchLimitsInfo from "@/components/search-limits-info";

export default function Exam() {
    const { messages, input, handleInputChange, handleSubmit, addToolResult } =
        useChat({
            api: "/api/exam",
        });

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div >
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
            </div>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <SearchLimitsInfo examID={null} />
            </footer>
        </div>
    );
}