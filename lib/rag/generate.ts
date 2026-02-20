import openai from "@/lib/openai/client";
import { searchSyllabus } from "./search";
import type { MessageSource, SearchResult } from "@/types";

const SYSTEM_PROMPT = `You are KTU Exam Prep AI, an intelligent assistant specifically designed for APJ Abdul Kalam Technological University (KTU) students. 

Your role:
- Answer questions based on the KTU syllabus content provided to you
- Help students understand concepts, solve problems, and prepare for exams
- Provide structured answers with clear explanations
- Reference specific modules and topics when relevant
- Use examples and analogies to make complex topics easier to understand
- Format answers using markdown for readability (headers, bullet points, code blocks, etc.)

Guidelines:
- Always be accurate and cite the syllabus content when possible
- If the context doesn't contain enough information, say so honestly
- Prioritize exam-relevant explanations
- For numerical problems, show step-by-step solutions
- For theory questions, provide structured answers suitable for university exams`;

export async function generateAnswer(
    query: string,
    courseId?: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<{ answer: string; sources: MessageSource[] }> {
    // Search for relevant context
    let searchResults: SearchResult[];
    try {
        searchResults = await searchSyllabus(query, courseId);
    } catch {
        searchResults = [];
    }

    // Build context from search results
    const context = searchResults
        .map(
            (r, i) =>
                `[Source ${i + 1}] (Similarity: ${(r.similarity * 100).toFixed(1)}%)\n${r.content}`
        )
        .join("\n\n---\n\n");

    // Build sources for the response
    const sources: MessageSource[] = searchResults.map((r) => ({
        course_code: r.metadata?.source || "KTU",
        module: r.metadata?.module_number
            ? `Module ${r.metadata.module_number}`
            : "General",
        topic: r.metadata?.topic || "Syllabus Content",
        similarity: r.similarity,
    }));

    // Prepare messages for GPT
    const messages: { role: "system" | "user" | "assistant"; content: string }[] =
        [
            { role: "system", content: SYSTEM_PROMPT },
        ];

    // Add conversation history (last 6 messages for context)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
    }

    // Add current query with context
    const userMessage = context
        ? `Context from KTU syllabus:\n\n${context}\n\n---\n\nStudent's question: ${query}`
        : `Student's question: ${query}\n\n(No specific syllabus context found. Please answer based on general knowledge and indicate that the answer is not from the specific KTU syllabus.)`;

    messages.push({ role: "user", content: userMessage });

    // Generate response
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
    });

    const answer =
        completion.choices[0]?.message?.content ||
        "I apologize, but I was unable to generate a response. Please try again.";

    return { answer, sources };
}
