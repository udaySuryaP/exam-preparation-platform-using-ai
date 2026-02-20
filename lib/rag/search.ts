import { createEmbedding } from "@/lib/openai/embeddings";
import { createServiceClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/types";

export async function searchSyllabus(
    query: string,
    courseId?: string,
    matchCount: number = 5,
    matchThreshold: number = 0.7
): Promise<SearchResult[]> {
    const supabase = await createServiceClient();
    const embedding = await createEmbedding(query);

    const { data, error } = await supabase.rpc("match_syllabus", {
        query_embedding: embedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_course_id: courseId || null,
    });

    if (error) {
        console.error("Vector search error:", error);
        throw new Error("Failed to search syllabus");
    }

    return (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        content: item.content as string,
        similarity: item.similarity as number,
        metadata: item.metadata as SearchResult["metadata"],
    }));
}
