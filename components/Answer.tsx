import { Message } from "ai";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

export default function Answer({
    message,
}: {
    message: Message;
}) {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}>
            {message.content}
        </ReactMarkdown>
    )
}