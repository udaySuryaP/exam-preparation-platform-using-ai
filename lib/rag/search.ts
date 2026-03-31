import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SyllabusMatch {
    id: string;
    content: string;
    similarity: number;
    metadata: {
        module_number?: number;
        topic?: string;
        course_code?: string;
        course_name?: string;
    };
}

export async function searchSyllabus(
    query: string,
    courseId?: string,
    matchCount: number = 5,
    matchThreshold: number = 0.65
): Promise<SyllabusMatch[]> {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    const supabase = await createServiceClient();

    const { data, error } = await supabase.rpc("match_syllabus", {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_course_id: courseId ?? null,
    });

    if (error) {
        console.error("[searchSyllabus] RPC error:", error.message);
        return [];
    }

    return (data as SyllabusMatch[]) ?? [];
}

export function formatContext(matches: SyllabusMatch[]): string {
    if (matches.length === 0) return "";

    return matches
        .map((m, i) => {
            const meta = m.metadata;
            const header = [
                meta.course_name && `Course: ${meta.course_name}`,
                meta.module_number && `Module ${meta.module_number}`,
                meta.topic && `Topic: ${meta.topic}`,
            ]
                .filter(Boolean)
                .join(" | ");
            return `[Reference ${i + 1}] ${header}\n${m.content}`;
        })
        .join("\n\n---\n\n");
}
