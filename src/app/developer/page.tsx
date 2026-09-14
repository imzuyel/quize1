import Link from "next/link";
import { DeveloperCard } from "@/components/credit";
export const metadata={title:"Developer",description:"PGTSC Quiz Arena developer information."};
export default function Developer(){return <main className="min-h-screen bg-[var(--pg-mist)] px-4 py-8"><div className="mx-auto max-w-3xl space-y-5"><Link href="/" className="text-sm font-bold text-[var(--pg-teal)]">← হোম</Link><DeveloperCard/><div className="pg-surface p-5 text-sm text-slate-500">এই platform-এর branding ও developer information Admin Settings থেকে পরিচালনা করা যায়।</div></div></main>}
