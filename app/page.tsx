import Link from "next/link";
import {
  GraduationCap,
  Brain,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                KTU Exam Prep AI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                How It Works
              </a>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02] shadow-sm"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <Link
              href="/signup"
              className="md:hidden inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Powered by GPT-4 Turbo & KTU 2024 Syllabus
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Ace Your{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              KTU Exams
            </span>
            <br />
            with AI
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Personalized exam preparation trained on the 2024 KTU syllabus. Get
            instant answers, analyze question patterns, and study smarter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-indigo-600/25"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200"
            >
              Learn More
            </a>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              2024 Syllabus
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              All Departments
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform gives you the tools to study effectively
              and ace your exams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI-Powered Answers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get accurate, syllabus-aligned answers powered by GPT-4 Turbo.
                Ask anything from your KTU syllabus and get detailed
                explanations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Exam Patterns
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Analyze past question paper patterns. Know which topics appear
                most frequently and prioritize your study based on data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Study
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track your progress, get personalized recommendations, and study
                the right topics at the right time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-200 via-blue-200 to-emerald-200" />

            {[
              {
                step: 1,
                icon: Target,
                title: "Select Your Course",
                desc: "Choose your department, semester, and subjects to get personalized preparation.",
                color: "indigo",
              },
              {
                step: 2,
                icon: Brain,
                title: "Ask Questions",
                desc: "Ask anything from your syllabus. Our AI provides accurate, exam-focused answers.",
                color: "blue",
              },
              {
                step: 3,
                icon: TrendingUp,
                title: "Track & Improve",
                desc: "Monitor your preparation progress and focus on high-priority topics.",
                color: "emerald",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6 relative z-10">
                  <item.icon className="w-8 h-8 text-indigo-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Learning Now
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of KTU students who are already preparing smarter
            with AI. Your exams won&apos;t wait — start studying today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  KTU Exam Prep AI
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                AI-powered exam preparation platform for APJ Abdul Kalam
                Technological University students. Study smarter, not harder.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} KTU Exam Prep AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
