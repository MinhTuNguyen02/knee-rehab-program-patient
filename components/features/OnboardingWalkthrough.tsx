import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, ChevronLeft, MessageSquare, LineChart, ShieldCheck } from "lucide-react";

export default function OnboardingWalkthrough() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const hasSeen = localStorage.getItem('has_seen_onboarding');
        if (!hasSeen) {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;
            if (e.key === "Escape") {
                handleComplete();
            } else if (e.key === "ArrowRight" || e.key === "Enter") {
                nextStep();
            } else if (e.key === "ArrowLeft") {
                prevStep();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, currentStep]);

    const handleComplete = () => {
        localStorage.setItem('has_seen_onboarding', 'true');
        setIsVisible(false);
    };

    const nextStep = () => {
        if (currentStep === steps.length - 1) {
            handleComplete();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const steps = [
        {
            icon: <ShieldCheck className="w-12 h-12 text-emerald-500" />,
            title: "Your KRPS Score",
            subtitle: "Understand your recovery zones",
            description: "Each time you complete an assessment, your score (-10 to 10) puts you in one of three zones, indicating the current health of your knee.",
            visual: (
                <div className="w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-4">
                            {/* <div className="w-20 h-20 rounded-full border-8 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center bg-white dark:bg-slate-900 shadow-md transform hover:scale-105 transition-transform duration-300">
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">7</span>
                            </div> */}
                            <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-900 shadow-md transform hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                {/* Circle */}
                                <svg
                                    viewBox="0 0 100 100"
                                    className="absolute inset-0 w-full h-full -rotate-90 overflow-visible"
                                >
                                    {/* blur background circle*/}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        strokeWidth="8"
                                        className="stroke-emerald-500/20"
                                    />
                                    {/* Process circle*/}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        className="stroke-emerald-500 transition-all duration-1000 ease-out"
                                        pathLength="100"
                                        strokeDasharray="100"
                                        strokeDashoffset={100 - (7 / 20 * 100)}
                                    />
                                </svg>

                                {/* Text mock score */}
                                <span className="relative text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    7
                                </span>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">Green Zone</h4>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Good progress & function</span>
                            </div>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                            Safe
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="text-center p-3 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30">
                            <span className="block text-xs font-bold text-red-700 dark:text-red-400 mb-1">Red</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">-10 to 2</span>
                        </div>
                        <div className="text-center p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30">
                            <span className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Amber</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">3 to 5</span>
                        </div>
                        <div className="text-center p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
                            <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Green</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">6 to 10</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <LineChart className="w-12 h-12 text-primary" />,
            title: "Track Over Time",
            subtitle: "Visualize your recovery journey",
            description: "Your scores are plotted on a trend chart. Watch your scores rise over time as you progress with your recovery program.",
            visual: (
                <div className="w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-md flex flex-col justify-between h-56">
                    <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">
                        <span>Score (-10 to 10)</span>
                        <span>Assessment Trend</span>
                    </div>
                    <div className="flex-1 relative flex items-end justify-between px-4 pb-2">
                        <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" viewBox="0 0 200 80">
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor="#007a87" stopOpacity="0" />
                                    <stop offset="100%" stopColor="#007a87" stopOpacity="0.25" />
                                </linearGradient>
                            </defs>
                            {/* Horizontal guide lines */}
                            <line x1="0" y1="15" x2="200" y2="15" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                            <line x1="0" y1="45" x2="200" y2="45" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

                            {/* Area under the line */}
                            <path d="M 20 65 L 100 45 L 180 20 L 180 80 L 20 80 Z" fill="url(#chartGrad)" />

                            {/* Line path */}
                            <path
                                d="M 20 65 L 100 45 L 180 20"
                                fill="none"
                                stroke="#007a87"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Node circles */}
                            <circle cx="20" cy="65" r="5" fill="#EF4444" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="100" cy="45" r="5" fill="#F59E0B" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="180" cy="20" r="6" fill="#10B981" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
                        </svg>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex justify-between w-full relative z-10 pt-24">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Latest</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <MessageSquare className="w-12 h-12 text-blue-500" />,
            title: "Chat With Us",
            subtitle: "Direct line to your physiotherapist",
            description: "Experiencing pain or have a question about your exercise plan? Reach out directly to your clinical team via chat at any time.",
            visual: (
                <div className="w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-md space-y-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-primary dark:text-primary-hover font-black text-sm shrink-0 border border-primary/20">
                            PT
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%] text-left">
                            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                                Hi there! How is your knee feeling after today's extension exercises? Let me know if you feel any discomfort.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-primary text-white rounded-2xl rounded-tr-none p-4 max-w-[80%] text-left shadow-md">
                            <p className="text-sm leading-relaxed font-semibold">
                                It feels a bit tight, but much better than yesterday!
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    if (!isClient || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12 bg-white dark:bg-slate-950 transition-all duration-300 animate-fade-in overflow-y-auto">

            {/* Top Bar Header */}
            <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-md">
                        K
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-primary">KRPS Onboarding</span>
                </div>
                <button
                    onClick={handleComplete}
                    className="px-6 py-2.5 text-sm font-extrabold text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl transition-all cursor-pointer shadow-sm min-h-[44px]"
                >
                    Skip
                </button>
            </div>

            {/* Main Interactive Grid Area */}
            <div className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-8 md:py-12">

                {/* Left Side: Copy */}
                <div className="space-y-6 text-left max-w-xl animate-fade-in-up">
                    <div className="space-y-2">
                        <span className="text-sm font-black text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-xl">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight pt-2">
                            {steps[currentStep].title}
                        </h2>
                        <h3 className="text-base md:text-lg font-bold text-primary tracking-wide uppercase">
                            {steps[currentStep].subtitle}
                        </h3>
                    </div>
                    <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {steps[currentStep].description}
                    </p>
                </div>

                {/* Right Side: Visual Mock */}
                <div className="flex items-center justify-center w-full min-h-[280px] md:min-h-[350px] animate-fade-in">
                    <div className="w-full transform hover:scale-[1.02] transition-transform duration-300">
                        {steps[currentStep].visual}
                    </div>
                </div>

            </div>

            {/* Bottom Navigation Control Bar */}
            <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-6 border-t border-slate-100 dark:border-slate-900 mt-auto">
                {/* Back Button wrapper */}
                <div className="w-1/4">
                    {currentStep > 0 ? (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-1.5 text-sm font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors py-3 cursor-pointer min-h-[44px]"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>
                    ) : (
                        <div className="h-[44px]" />
                    )}
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-2.5 justify-center w-2/4">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep
                                ? "w-8 bg-primary"
                                : "w-2 bg-slate-200 dark:bg-slate-800"
                                }`}
                        />
                    ))}
                </div>

                {/* Next/Get Started Button */}
                <div className="w-1/4 flex justify-end">
                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-extrabold px-6 py-3 rounded-2xl transition-all transform active:scale-95 shadow-md cursor-pointer min-h-[48px]"
                    >
                        <span>{currentStep === steps.length - 1 ? "Let's Go" : "Next"}</span>
                        {currentStep === steps.length - 1 ? (
                            <ArrowRight className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}