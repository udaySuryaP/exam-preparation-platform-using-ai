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
    matchThreshold: number = 0.5
): Promise<SyllabusMatch[]> {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Convert to pgvector string format: "[x,y,z,...]"
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    // Use direct fetch to PostgREST RPC endpoint to avoid type ambiguity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_syllabus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": serviceKey,
                "Authorization": `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
                query_embedding: embeddingStr,
                match_threshold: matchThreshold,
                match_count: matchCount,
                filter_course_id: courseId ?? null,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[searchSyllabus] RPC error:", response.status, errText);
            return [];
        }

        const data = await response.json();
        return (data as SyllabusMatch[]) ?? [];
    } catch (err) {
        console.error("[searchSyllabus] fetch error:", err instanceof Error ? err.message : err);
        return [];
    }
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
