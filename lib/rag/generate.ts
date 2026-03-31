import OpenAI from "openai";
import { searchSyllabus, formatContext } from "./search";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface GenerateAnswerResult {
    answer: string;
    sources: Array<{
        course: string;
        module: number | null;
        topic: string;
        similarity: number;
    }>;
}

function buildSystemPrompt(syllabusContext: string): string {
    const hasContext = syllabusContext.trim().length > 0;
    const contextBlock = hasContext
        ? `\n\nRELEVANT SYLLABUS CONTENT:\n${syllabusContext}`
        : "\n\n(No specific syllabus content matched for this query.)";

    return `You are an AI study assistant for APJ Abdul Kalam Technological University (KTU) students in Kerala, India. The subject is Object Oriented Programming using Java (S3, PBCST304).

STRICT RULES:
1. Answer ONLY based on the KTU syllabus content provided below. Do not use outside knowledge.
2. If the question is outside the provided syllabus, say: "This topic doesn't appear to be in the OOPs syllabus. Please check if you've selected the right subject."
3. Structure answers to match KTU exam answer patterns:
   - Part A (2 marks): 2-4 sentence direct definition/answer.
   - Part B (9 marks): Detailed explanation with subpoints, syntax, and a code example.
   - Part C (18 marks): Comprehensive answer with code, comparison tables, all aspects covered.
4. Always mention which MODULE the topic belongs to (e.g., "This is covered in Module 2 — Polymorphism and Inheritance").
5. For definitions, start with a clean one-line definition, then expand.
6. For comparisons, always use a markdown table.
7. If asked for "important questions" or "likely exam topics", list key topics with Part A/B/C frequency.
8. Never make up facts, code, or definitions not in the syllabus content.
${contextBlock}`;
}

export async function generateAnswer(
    message: string,
    history: ChatMessage[],
    courseId?: string
): Promise<GenerateAnswerResult> {
    const matches = await searchSyllabus(message, courseId);
    const syllabusContext = formatContext(matches);
    const systemPrompt = buildSystemPrompt(syllabusContext);

    const recentHistory = history.slice(-10);

    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        })),
        { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
        model: "o4-mini",
        messages: conversationMessages,
        max_completion_tokens: 1500,
    });

    const answer =
        completion.choices[0]?.message?.content ??
        "Sorry, I couldn't generate a response. Please try again.";

    const sources = matches.map((m) => ({
        course: m.metadata.course_name ?? m.metadata.course_code ?? "OOPs",
        module: m.metadata.module_number ?? null,
        topic: m.metadata.topic ?? "General",
        similarity: Math.round(m.similarity * 100) / 100,
    }));

    return { answer, sources };
}
