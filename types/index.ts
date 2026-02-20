export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    college_name: string;
    graduation_year: number;
    branch: string;
    semester: number;
    referral_source?: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: string;
    course_code: string;
    course_name: string;
    semester: number;
    credits: number;
    department: string;
    description?: string;
    module_count?: number;
    created_at: string;
}

export interface Module {
    id: string;
    course_id: string;
    module_number: number;
    title: string;
    topics: string[];
    hours: number;
    created_at: string;
}

export interface SyllabusEmbedding {
    id: string;
    course_id: string;
    content: string;
    embedding: number[];
    metadata: {
        module_number?: number;
        topic?: string;
        source?: string;
    };
    created_at: string;
}

export interface QuestionPattern {
    id: string;
    course_id: string;
    topic: string;
    part_a_frequency: number;
    part_b_frequency: number;
    part_c_frequency: number;
    total_frequency: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    years_appeared: string[];
    created_at: string;
    course?: Course;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    course_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    sources?: MessageSource[];
    created_at: string;
}

export interface MessageSource {
    course_code: string;
    module: string;
    topic: string;
    similarity: number;
}

export interface UserProgress {
    id: string;
    user_id: string;
    course_id: string;
    questions_asked: number;
    study_time_minutes: number;
    last_studied: string;
    created_at: string;
    updated_at: string;
}

export interface ChatRequest {
    message: string;
    courseId?: string;
    conversationId?: string;
}

export interface ChatResponse {
    answer: string;
    sources: MessageSource[];
    conversationId: string;
}

export interface SearchRequest {
    query: string;
    courseId?: string;
}

export interface SearchResult {
    id: string;
    content: string;
    similarity: number;
    metadata: {
        module_number?: number;
        topic?: string;
        source?: string;
    };
}

export type Department = {
    id: string;
    name: string;
    shortName: string;
    icon: string;
};

export const DEPARTMENTS: Department[] = [
    { id: "cse", name: "Computer Science & Engineering", shortName: "CSE", icon: "⚙️" },
    { id: "civil", name: "Civil Engineering", shortName: "CE", icon: "🏗️" },
    { id: "mech", name: "Mechanical Engineering", shortName: "ME", icon: "🔧" },
    { id: "eee", name: "Electrical & Electronics Engineering", shortName: "EEE", icon: "⚡" },
    { id: "ece", name: "Electronics & Communication Engineering", shortName: "ECE", icon: "📡" },
];

export const KTU_COLLEGES = [
    "College of Engineering Trivandrum (CET)",
    "Government Engineering College Thrissur (GECT)",
    "TKM College of Engineering Kollam",
    "Government Engineering College Barton Hill",
    "Model Engineering College Kochi",
    "Mar Athanasius College of Engineering (MACE)",
    "Rajiv Gandhi Institute of Technology Kottayam",
    "NSS College of Engineering Palakkad",
    "Government Engineering College Kozhikode",
    "LBS Institute of Technology for Women",
    "Marian Engineering College Trivandrum",
    "Saintgits College of Engineering Kottayam",
    "Amal Jyothi College of Engineering Kanjirapally",
    "Toc H Institute of Science and Technology Kochi",
    "Federal Institute of Science and Technology (FISAT)",
    "Vidya Academy of Science and Technology Thrissur",
    "Adi Shankara Institute of Engineering and Technology",
    "Albertian Institute of Science and Technology",
    "Ilahia College of Engineering and Technology",
    "Other",
];

export const REFERRAL_OPTIONS = [
    { id: "friend", label: "Friend or Classmate", icon: "👥" },
    { id: "instagram", label: "Instagram", icon: "📱" },
    { id: "whatsapp", label: "WhatsApp/Telegram", icon: "💬" },
    { id: "google", label: "Google Search", icon: "🔍" },
    { id: "facebook", label: "Facebook", icon: "📘" },
    { id: "college", label: "College Notice/Poster", icon: "🎓" },
    { id: "other", label: "Other", icon: "📰" },
];
