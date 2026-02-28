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
    // State Government Engineering Colleges
    "College of Engineering, Trivandrum",
    "Government Engineering College, Thrissur",
    "Thangal Kunju Musaliar College of Engineering",
    "NSS College of Engineering, Palakkad",
    "Mar Athanasius College of Engineering, Kothamangalam",
    "Government College of Engineering, Kannur",
    "Rajiv Gandhi Institute of Technology, Kottayam",
    "Government Engineering College, Sreekrishnapuram",
    "Government Engineering College, Trivandrum (Barton Hill)",
    "Government Engineering College, Kozhikode",
    "Government Engineering College, Wayanad",
    "Government Engineering College, Idukki",

    // Engineering Colleges Under Government Departments
    "Government Model Engineering College, Cochin",
    "College of Engineering Chengannur",
    "L.B.S College of Engineering, Kasaragod",
    "L B S Institute of Technology for Women, Poojappura, Trivandrum",
    "College of Engineering Attingal",
    "College of Engineering, Cherthala",
    "College of Engineering, Kallooppara",
    "College of Engineering, Karunagappally",
    "College of Engineering, Kottarakkara",
    "College of Engineering, Poonjar",
    "College of Engineering, Aranmula",
    "College of Engineering, Kidangoor",
    "College of Engineering & Management, Punnapra",
    "College of Engineering, Pathanapuram",
    "College of Engineering, Perumon",
    "College of Engineering, Thalassery",
    "College of Engineering, Thrikaripur",
    "College of Engineering, Vatakara",
    "College of Engineering Muttathara",
    "College of Engineering Munnar",
    "College of Engineering, Adoor",
    "Sree Chitra Thirunal College of Engineering (SCTCE)",

    // Private Self-Financing Colleges
    "ACE College of Engineering",
    "Adi Shankara Institute of Engineering and Technology",
    "Ahalia School of Engineering and Technology",
    "Al Azhar College of Engineering and Technology",
    "Al-Ameen Engineering College",
    "Albertian Institute of Science and Technology",
    "Amal Jyothi College of Engineering",
    "Ammini College of Engineering",
    "Archana College of Engineering",
    "Aryanet Institute of Technology",
    "AWH Engineering College",
    "Axis College of Engineering and Technology",
    "Baselios Mathews II College of Engineering",
    "Baselios Thomas I Catholicose College of Engineering and Technology",
    "Believers Church Caarmel Engineering College",
    "Bishop Jerome Institute",
    "Carmel College of Engineering and Technology",
    "Christ College of Engineering, Irinjalakuda",
    "Christ Knowledge City",
    "Cochin College of Engineering and Technology",
    "Cochin Institute of Science and Technology",
    "College of Engineering and Technology, Mathamangalam",
    "Eranad Knowledge City Technical Campus",
    "Federal Institute of Science and Technology (FISAT)",
    "College Of Engineering Poomala (FOP)",
    "Gurudeva Institute of Science And Technology",
    "Heera College of Engineering and Technology",
    "Holy Grace Academy of Engineering",
    "Holy Kings College of Engineering and Technology (MGM College of Engineering & Technology)",
    "IES College of Engineering",
    "Ilahia College of Engineering Technology",
    "Ilahia School of Science and Technology",
    "ILM College of Engineering and Technology",
    "Indira Gandhi Institute of Engineering and Technology For Women",
    "Jai Bharath College of Management and Engineering Technology",
    "Jawaharlal College of Engineering and Technology",
    "John Cox Memorial C S I Institute of Technology",
    "Jyothi Engineering College",
    "KMEA Engineering College (K M E A Engineering College)",
    "K R Gouri Amma College of Engineering For Women",
    "KMCT College of Engineering",
    "KMCT College of Engineering For Women",
    "KMP College of Engineering",
    "Kottayam Institute of Technology and Science (KITS)",
    "KVM College of Engineering and Information Technology",
    "Lourdes Matha College of Science and Technology",
    "MEA Engineering College",
    "MES College of Engineering, Kuttippuram",
    "M G College of Engineering",
    "M. Dasan Institute of Technology",
    "Malabar College of Engineering and Technology",
    "Malabar Institute of Technology",
    "Mangalam College of Engineering",
    "Mar Baselios Christian College of Engineering and Technology",
    "Mar Baselios College of Engineering and Technology (Nalanchira)",
    "Mar Baselios Institute of Technology and Science",
    "Matha College of Technology",
    "MES College of Engineering and Technology (Kunnukara)",
    "MES Institute of Technology and Management (Chathannoor)",
    "MET'S School of Engineering",
    "Mohandas College of Engineering and Technology",
    "Mookambika Technical Campus",
    "Mount Zion College of Engineering",
    "Mount Zion College of Engineering For Women",
    "Musaliar College of Engineering",
    "Musaliar College of Engineering and Technology",
    "Muslim Association College of Engineering",
    "Muthoot Institute of Technology and Science",
    "Nehru College of Engineering and Research Centre",
    "Nirmala College of Engineering",
    "North Malabar Institute of Technology",
    "Pinnacle School of Engineering and Technology",
    "Prime College of Engineering",
    "Providence College of Engineering",
    "PRS College of Engineering and Technology",
    "Rajadhani Institute of Engineering and Technology",
    "Rajagiri School of Engineering and Technology",
    "Royal College of Engineering and Technology",
    "Sadguru Swami Nithyananda Institute of Technology",
    "Sahrdaya College of Engineering and Technology",
    "Saintgits College of Engineering",
    "Sarabhai Institute of Science and Technology",
    "SCMS School of Engineering and Technology",
    "Shahul Hameed Memorial Engineering College",
    "SNM Institute of Management and Technology",
    "Sree Buddha College of Engineering",
    "Sree Buddha College of Engineering For Women",
    "Sree Ernakulathappan College of Engineering and Management (now ICCS College of Engineering and Management)",
    "Sree Narayana Guru College of Engineering and Technology",
    "Sree Narayana Guru Institute of Science and Technology",
    "Sree Narayana Gurukulam College of Engineering",
    "Sree Narayana Institute of Technology",
    "Sreepathy Institute of Management and Technology",
    "Sri Vellappally Natesan College of Engineering (now Mahaguru Institute of Technology)",
    "St. Gregorios College of Engineering",
    "St. Joseph's College of Engineering and Technology, Pala",
    "St. Thomas College of Engineering and Technology, Sivapuram",
    "St. Thomas College of Engineering and Technology, Chengannur",
    "St. Thomas Institute for Science and Technology, Kazhakuttom",
    "TKM Institute of Technology",
    "Thejus Engineering College",
    "Toc H Institute of Science and Technology",
    "Toms College of Engineering For Startups",
    "Travancore Engineering College",
    "Trinity College of Engineering",
    "UKF College of Engineering and Technology",
    "Universal Engineering College",
    "Valia Koonambaikulathamma College of Engineering and Technology",
    "Vedavyasa Institute of Technology",
    "Vidya Academy of Science and Technology (VAST)",
    "Vidya Academy of Science and Technology Technical Campus (VAST TC)",
    "VISAT Engineering College",
    "Vimal Jyothi Engineering College",
    "Viswajyothi College of Engineering and Technology",
    "Younus College of Engineering, Kottarakkara",
    "Younus College of Engineering & Technology (ceased)",
    "Younus Institute of Technology (ceased)",

    // Fallback
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
