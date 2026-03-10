import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(240,15%,8%)] relative overflow-hidden py-12">
      <div className="orb orb-brand absolute w-[400px] h-[400px] bottom-0 left-0 opacity-40 mix-blend-screen animate-pulse-slow"></div>
      <div className="orb orb-accent absolute w-[300px] h-[300px] top-0 right-1/4 opacity-30 mix-blend-screen"></div>

      <div className="relative z-10 glass-card p-1 rounded-3xl border border-white/[0.08] shadow-2xl backdrop-blur-2xl">
        <SignUp 
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-0",
              headerTitle: "text-white font-display text-2xl font-bold",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButtonText: "text-white/80 font-medium",
              socialButtonsBlockButton: "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors rounded-xl",
              dividerLine: "bg-white/[0.08]",
              dividerText: "text-white/40",
              formFieldLabel: "text-white/80 text-sm font-medium",
              formFieldInput: "bg-white/[0.04] border-white/[0.08] text-white rounded-xl focus:brand-accent-500 focus:ring-1 focus:ring-brand-500 transition-colors",
              formButtonPrimary: "bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 text-white font-semibold rounded-xl text-md py-3 shadow-brand transition-all hover:shadow-brand-hover hover:scale-[1.02]",
              footerActionText: "text-white/60",
              footerActionLink: "text-brand-400 hover:text-brand-300 font-medium",
              identityPreviewText: "text-white/80",
              identityPreviewEditButton: "text-brand-400 hover:text-brand-300",
            }
          }}
        />
      </div>
    </div>
  );
}
