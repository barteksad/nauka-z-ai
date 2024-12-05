import { Message } from "ai";
import { Suspense } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function TopicInner({
    input,
    messages,
    handleInputChange,
    handleSubmit,
}: {
    input: string,
    messages: Message[],
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
}) {
    if (messages.length == 0) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-row w-full max-w-sm items-center space-x-2">
                <Input type="text" placeholder="Nauka tabliczki mnożenia" value={input} onChange={handleInputChange} />
                <Button type="submit" variant="outline" size="lg">Generate</Button>
            </form>
        );
    } else {
        return (
            <div className="text-3xl font-bold text-center mb-6">
                {messages[0].content}
            </div>
        )
    }
}

export default function Topic({
    input,
    messages,
    handleInputChange,
    handleSubmit,
}: {
    input: string,
    messages: Message[],
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TopicInner
                input={input}
                messages={messages}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        </Suspense>
    );
}