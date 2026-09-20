import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TopographyBackground } from "@/components/academy/topography-background";
import { AcademyGradientBackground } from "@/components/academy/gradient-background";
import { CourseSequence } from "@/components/academy/course-sequence";
import { VideoNotesPanel } from "@/components/academy/video-notes-panel";
import { workshops, resources, featuredLesson } from "@/lib/academy-data";

// TODO(academy backend): once Quiz/Resource models exist, replace the
// `workshops`/`resources` mock imports with real queries filtered by
// Event.programs containing AI_ACADEMY, and gate an inline-edit affordance
// here for the Academy director instead of routing them through /admin.

export default function AcademyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AcademyGradientBackground />
      <Navbar active="Academy" />

      <main className="mx-auto flex w-full max-w-[1300px] flex-col gap-[40px] px-[24px] pb-[64px] pt-[40px] lg:px-[46px]">
        {/* Intro */}
        <section className="flex flex-col items-start gap-[28px] text-left lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-start gap-[16px] text-left">
            <Image
              src="/images/academy/wordmark.png"
              alt="AI Academy"
              width={893}
              height={279}
              className="h-[130px] w-auto object-contain"
              priority
            />
            <p className="style-body-text max-w-xl text-white">
              Weekly workshops to provide resources and teach you everything you need
              to know to start your first AI project.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-[12px]">
            <button className="rounded-full bg-[#2563eb] px-[22px] py-[14px] style-button-text text-white shadow-[0_5px_14px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#1e4fc7]">
              Browse Courses
            </button>
            <button className="rounded-full border border-[#d4af37] bg-[#d4af37] px-[22px] py-[14px] style-button-text text-ink transition-colors hover:bg-[#c19d2e]">
              Get Started
            </button>
          </div>
        </section>

        {/* Featured video course + notes */}
        <section className="relative flex flex-col gap-[20px] overflow-hidden rounded-[16px] border-t-[10px] border-b-[10px] border-[#2f5fe8] bg-[#181c25] p-[36px] lg:p-[46px]">
          <TopographyBackground />
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-[4px]">
              <h2 className="style-section-header uppercase text-white">Featured Video Courses</h2>
              <p className="style-body-text text-white">
                Start with the fundamentals, then move into practical tools and techniques
                used in real AI projects.
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-pill-amber px-[16px] py-[8px] style-badge-text text-orange-text sm:inline-block">
              View all
            </span>
          </div>
          <VideoNotesPanel
            title={featuredLesson.title}
            videoUrl={featuredLesson.videoUrl}
            notesKey="featured-lesson-3"
          />
        </section>

        {/* Course Sequence */}
        <ScrollReveal>
          <section className="flex flex-col gap-[20px]">
            <h2 className="style-section-header uppercase text-white">Course Sequence</h2>
            <CourseSequence workshops={workshops} />
          </section>
        </ScrollReveal>

        {/* Resources */}
        <section className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[4px]">
            <h2 className="style-section-header uppercase text-white">Resources</h2>
            <p className="style-body-text text-white/70">
              Downloadable materials, guides, and toolkits to help you prepare and keep
              learning outside of workshops.
            </p>
          </div>
          <div className="flex snap-x snap-mandatory gap-[20px] overflow-x-auto pb-[8px] scrollbar-none">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.href}
                className="flex w-[260px] shrink-0 snap-start flex-col gap-[16px] rounded-[20px] border border-[#2a2f3a] bg-[#181c25] p-[16px] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2563eb]/60"
              >
                <div className="flex flex-col gap-[8px]">
                  <span className="style-card-title text-white">{resource.title}</span>
                  <span className="style-caption text-white/70">{resource.description}</span>
                </div>
                <div className="mt-auto flex flex-wrap gap-[8px]">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#2563eb]/15 px-[12px] py-[6px] style-badge-text text-[#9db8ff]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
