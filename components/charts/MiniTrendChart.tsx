'use client';

import type { AssessmentResponse } from '@/hooks/useAssessmentHistory';
import { formatDate } from '../../lib/utils';
import { useEffect, useState } from 'react';

interface MiniTrendChartProps {
    assessments: AssessmentResponse[];
}

export default function MiniTrendChart({ assessments }: MiniTrendChartProps) {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
    }, []);

    // Reverse to chronological order (oldest to newest)
    const trendData = [...assessments].reverse();

    const chartHeight = 150;
    const chartWidth = 500;
    const paddingX = 40;
    const paddingYTop = 30;
    const paddingYBottom = 30;

    let pointsPath = '';
    let areaPath = '';
    let chartPoints: { x: number; y: number; score: number; dateStr: string }[] = [];

    if (trendData.length > 1) {
        const scores = trendData.map(d => d.score);
        let minScore = Math.min(...scores);
        let maxScore = Math.max(...scores);
        // Ensure there is at least a difference of 2 points between min and max for display aesthetics
        if (maxScore - minScore < 2) {
            minScore = Math.max(-10, minScore - 1);
            maxScore = Math.min(10, maxScore + 1);
        }
        const range = maxScore - minScore || 1;

        chartPoints = trendData.map((d, index) => {
            const x = paddingX + (index / (trendData.length - 1)) * (chartWidth - paddingX * 2);
            const yAxisHeight = chartHeight - paddingYTop - paddingYBottom;
            const y = chartHeight - paddingYBottom - ((d.score - minScore) / range) * yAxisHeight;
            const dateStr = formatDate(d.createdAt);
            return { x, y, score: d.score, dateStr };
        });

        pointsPath = chartPoints.reduce((acc, p, i) => {
            return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
        }, '');

        areaPath = `${pointsPath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - paddingYBottom} L ${chartPoints[0].x} ${chartHeight - paddingYBottom} Z`;
    }

    if (trendData.length <= 1) {
        return null;
    }

    return (
        <div className="relative w-full overflow-x-auto overflow-y-visible py-2">
            <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[320px] transition-transform duration-300 group-hover:scale-[1.01] overflow-visible"
            >
                <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Chart Area Under the Line */}
                {areaPath && (
                    <path d={areaPath} fill="url(#chart-gradient)" />
                )}

                {/* Grid lines (horizontal helper lines) */}
                <line x1={paddingX} y1={paddingYTop} x2={chartWidth - paddingX} y2={paddingYTop} stroke="currentColor" className="text-gray-100 dark:text-gray-800/40" strokeDasharray="4 4" />
                <line x1={paddingX} y1={chartHeight - paddingYBottom} x2={chartWidth - paddingX} y2={chartHeight - paddingYBottom} stroke="currentColor" className="text-gray-100 dark:text-gray-800/40" />

                {/* Chart Line */}
                {pointsPath && (
                    <path
                        d={pointsPath}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength="1"
                        className={prefersReducedMotion ? "" : "animate-draw-line"}
                    />
                )}

                {/* Interactive Dots & Text Labels */}
                {chartPoints.map((p, index) => {
                    const delay = (index / (chartPoints.length - 1)) * 1.3;
                    const delayStr = `${delay}s`;

                    const dotStyle = prefersReducedMotion
                        ? { opacity: 1 }
                        : {
                            opacity: 0,
                            animationName: 'dotFadeIn',
                            animationDuration: '0.4s',
                            animationTimingFunction: 'ease-out',
                            animationFillMode: 'forwards',
                            animationDelay: delayStr
                        };
                    return (
                        <g
                            key={index}
                            style={dotStyle}
                        >
                            <g className="transition-all duration-300 group">
                                {/* Tooltip background on hover */}
                                <rect
                                    x={p.x - 18}
                                    y={p.y - 25}
                                    width="36"
                                    height="18"
                                    rx="4"
                                    fill="var(--foreground)"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                />
                                {/* Tooltip score value */}
                                <text
                                    x={p.x}
                                    y={p.y - 13}
                                    textAnchor="middle"
                                    className="text-[9px] font-bold fill-background opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                >
                                    {p.score.toFixed(0)}
                                </text>

                                {/* Outer Glow Ring on Point */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="7"
                                    fill="var(--primary)"
                                    className="opacity-0 group-hover:opacity-20 transition-opacity duration-200 cursor-pointer"
                                />

                                {/* Core point dot */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="4"
                                    fill="var(--background)"
                                    stroke="var(--primary)"
                                    strokeWidth="2.5"
                                    className="cursor-pointer"
                                />

                                {/* X Axis Label */}
                                <text
                                    x={p.x}
                                    y={chartHeight - 10}
                                    textAnchor="middle"
                                    className="text-[10px] font-medium fill-gray-400 dark:fill-gray-500"
                                >
                                    {p.dateStr}
                                </text>
                            </g>
                        </g>
                    )
                })}
            </svg>
        </div>
    );
}
