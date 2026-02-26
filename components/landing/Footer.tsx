import Link from 'next/link';
import { Globe, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">TrendMap</span>
                    </div>

                    <p className="text-muted-foreground max-w-md text-lg">
                        Open source social intelligence for everyone.
                        Visualize what the world is thinking in real-time.
                    </p>

                    <div className="flex items-center gap-6 mt-4">
                        <Link href="https://github.com" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:scale-110">
                            <Github className="h-5 w-5" />
                        </Link>
                        <Link href="https://twitter.com" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-blue-400 transition-all hover:scale-110">
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link href="https://linkedin.com" target="_blank" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-blue-600 transition-all hover:scale-110">
                            <Linkedin className="h-5 w-5" />
                        </Link>
                    </div>

                    <div className="text-sm text-muted-foreground mt-8">
                        © 2026 TrendMap. Open Source Project.
                    </div>
                </div>
            </div>
        </footer>
    );
}
