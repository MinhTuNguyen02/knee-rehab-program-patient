'use client';

import { useState, useMemo } from 'react';
import type { AssessmentResponse } from '@/hooks/useAssessmentHistory';
import { formatDate } from '../../lib/utils';
import { Activity, Calendar } from 'lucide-react';

interface ScoreTrendChartProps {
    assessments: AssessmentResponse[];
}

type TimeFilter = 'all' | '3m' | '6m';

export default function ScoreTrendChart({ assessments }: ScoreTrendChartProps) {
    const [filter, setFilter] = useState<TimeFilter>('all');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Filter assessments based on selected time frame
    const filteredAssessments = useMemo(() => {
        if (filter === 'all') return assessments;

        const now = new Date();
        const cutOffDate = new Date();
        if (filter === '3m') {
            cutOffDate.setMonth(now.getMonth() - 3);
        } else if (filter === '6m') {
            cutOffDate.setMonth(now.getMonth() - 6);
        }

        return assessments.filter(a => new Date(a.createdAt) >= cutOffDate);
    }, [assessments, filter]);

    // Reverse to chronological order (oldest to newest) for chart plotting
    const trendData = useMemo(() => {
        return [...filteredAssessments].reverse();
    }, [filteredAssessments]);

    // Dimensions
    const chartHeight = 220;
    const chartWidth = 600;
    const paddingX = 50;
    const paddingYTop = 40;
    const paddingYBottom = 40;

    // Coordinate Math
    const { chartPoints, pointsPath, areaPath, minScore, maxScore, yTicks } = useMemo(() => {
        if (trendData.length === 0) {
            return { chartPoints: [], pointsPath: '', areaPath: '', minScore: 0, maxScore: 10, yTicks: [] };
        }

        const scores = trendData.map(d => d.score);
        let minVal = 0;
        let maxVal = 10;

        // If any score goes outside 0-10, scale accordingly
        const actualMin = Math.min(...scores);
        const actualMax = Math.max(...scores);
        if (actualMin < 0) minVal = -10;
        if (actualMax > 10) maxVal = 12; // just in case

        const range = maxVal - minVal || 1;

        // Generate points
        const points = trendData.map((d, index) => {
            const x = paddingX + (trendData.length > 1
                ? (index / (trendData.length - 1)) * (chartWidth - paddingX * 2)
                : (chartWidth - paddingX * 2) / 2 + paddingX); // center if single point
            const yAxisHeight = chartHeight - paddingYTop - paddingYBottom;
            const y = chartHeight - paddingYBottom - ((d.score - minVal) / range) * yAxisHeight;
            const dateStr = formatDate(d.createdAt);
            return {
                x,
                y,
                score: d.score,
                dateStr,
                zone: d.zone,
                pain: d.pain,
                functionScore: d.functionScore
            };
        });

        // SVG paths
        let pPath = '';
        let aPath = '';
        if (points.length > 1) {
            pPath = points.reduce((acc, p, i) => {
                return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
            }, '');
            aPath = `${pPath} L ${points[points.length - 1].x} ${chartHeight - paddingYBottom} L ${points[0].x} ${chartHeight - paddingYBottom} Z`;
        }

        // Generate Y-axis gridline ticks
        const ticks = [];
        const tickStep = (maxVal - minVal) / 4;
        for (let i = 0; i <= 4; i++) {
            ticks.push(minVal + tickStep * i);
        }

        return { chartPoints: points, pointsPath: pPath, areaPath: aPath, minScore: minVal, maxScore: maxVal, yTicks: ticks };
    }, [trendData, chartHeight, chartWidth, paddingX, paddingYTop, paddingYBottom]);

    const getZoneColorHex = (zone: string) => {
        switch (zone?.toLowerCase()) {
            case 'green': return '#10B981';
            case 'amber': return '#F59E0B';
            case 'red': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getZoneName = (zone: string) => {
        if (!zone) return 'N/A';
        return zone.charAt(0).toUpperCase() + zone.slice(1).toLowerCase();
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-gray-850 dark:text-gray-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        KRPS Score Trend
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Track your knee performance history over time</p>
                </div>

                {/* Time filter controls */}
                {trendData.length <= 1 ? null : <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 self-start sm:self-center">
                    <button
                        onClick={() => { setFilter('all'); setHoveredIndex(null); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-300'}`}
                    >
                        All time
                    </button>
                    <button
                        onClick={() => { setFilter('6m'); setHoveredIndex(null); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === '6m' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-300'}`}
                    >
                        Last 6 months
                    </button>
                    <button
                        onClick={() => { setFilter('3m'); setHoveredIndex(null); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === '3m' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-300'}`}
                    >
                        Last 3 months
                    </button>
                </div>}
            </div>

            {trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <Calendar className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-500">No assessments found in this time period.</p>
                </div>
            ) : trendData.length === 1 ? (
                <div className="space-y-6">
                    {/* SVG with single dot taking full width */}
                    <div className="relative border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/30 dark:bg-gray-900/30 overflow-x-auto pb-4 scrollbar-thin">
                        <div className="min-w-[600px] w-full">
                            <svg
                                viewBox={`0 -90 ${chartWidth} ${chartHeight + 90}`}
                                className="w-full h-auto overflow-visible"
                                onClick={() => setHoveredIndex(null)}
                            >
                                {/* Grid lines */}
                                {yTicks.map((tick, i) => {
                                    const yAxisHeight = chartHeight - paddingYTop - paddingYBottom;
                                    const y = chartHeight - paddingYBottom - ((tick - minScore) / (maxScore - minScore)) * yAxisHeight;
                                    return (
                                        <g key={i}>
                                            <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="currentColor" className="text-gray-100 dark:text-gray-800/20" />
                                            <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] font-medium fill-gray-400 dark:fill-gray-500">
                                                {tick.toFixed(0)}
                                            </text>
                                        </g>
                                    );
                                })}
                                {/* Center point */}
                                {chartPoints.map((p, index) => (
                                    <g key={index}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setHoveredIndex(hoveredIndex === index ? null : index)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <circle cx={p.x} cy={p.y} r="16" fill={getZoneColorHex(p.zone)} opacity="0.25"
                                            className={`transition-opacity duration-200 ${hoveredIndex === index ? 'opacity-25' : 'opacity-0'}`}
                                        />
                                        <circle cx={p.x} cy={p.y} r="8" fill="#FFFFFF" stroke={getZoneColorHex(p.zone)} strokeWidth="4.5" />
                                        <text x={p.x} y={p.y + 26} textAnchor="middle" className="text-[11px] font-bold fill-gray-800 dark:fill-gray-200">
                                            Score: {p.score.toFixed(1)}
                                        </text>
                                        <text x={p.x} y={chartHeight - 10} textAnchor="middle" className="text-[10px] font-medium fill-gray-400 dark:fill-gray-500">
                                            {p.dateStr}
                                        </text>
                                    </g>
                                ))}

                                {/* Active Tooltip rendering */}
                                {hoveredIndex !== null && chartPoints[hoveredIndex] && (() => {
                                    const p = chartPoints[hoveredIndex];
                                    // Constrain tooltip within bounds horizontally
                                    const tooltipWidth = 140;
                                    const tooltipHeight = 85;
                                    const shiftX = p.x < tooltipWidth / 2 + 10
                                        ? (tooltipWidth / 2 + 10 - p.x)
                                        : p.x > chartWidth - tooltipWidth / 2 - 10
                                            ? (chartWidth - tooltipWidth / 2 - 10 - p.x)
                                            : 0;

                                    const tooltipX = p.x + shiftX;
                                    const tooltipY = p.y - tooltipHeight - 10;

                                    return (
                                        <g transform={`translate(${tooltipX}, ${tooltipY})`} className="pointer-events-none drop-shadow-md">
                                            <rect
                                                x={-tooltipWidth / 2}
                                                y="0"
                                                width={tooltipWidth}
                                                height={tooltipHeight}
                                                rx="10"
                                                fill="#1E293B"
                                                className="fill-slate-900/95 dark:fill-slate-950/95"
                                            />
                                            <text fill="#FFFFFF" className="text-[10px] font-medium" textAnchor="middle">
                                                <tspan x="0" dy="16" fontWeight="bold" fill="#38BDF8">{p.dateStr}</tspan>
                                                <tspan x="0" dy="16" fontWeight="bold" fontSize="11" fill="#FFFFFF">Score: {p.score.toFixed(1)}</tspan>
                                                <tspan x="0" dy="14" fill="#94A3B8">Zone: {getZoneName(p.zone)}</tspan>
                                                <tspan x="0" dy="14" fill="#F87171">Pain: {p.pain}/10 | Func: {p.functionScore}/10</tspan>
                                            </text>
                                            {/* Small arrow down */}
                                            <polygon
                                                points={`${-shiftX - 5},${tooltipHeight} ${-shiftX + 5},${tooltipHeight} ${-shiftX},${tooltipHeight + 5}`}
                                                fill="#1E293B"
                                                className="fill-slate-900/95 dark:fill-slate-950/95"
                                            />
                                        </g>
                                    );
                                })()}
                            </svg>
                        </div>
                    </div>

                    {/* Guidance Box and Button below full width chart */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2 p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                            <h4 className="font-bold text-sm text-primary">Need more data to unlock your trend</h4>
                            <p className="text-sm text-gray-550 leading-relaxed dark:text-gray-405">
                                Completing a second knee rehabilitation progress assessment allows the system to build your first trend line. This helps you track changes in your knee mobility and pain indicators.
                            </p>
                        </div>
                        <div>
                            <a
                                href={process.env.NEXT_PUBLIC_ASSESS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex justify-center items-center py-3.5 px-4 w-full rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] transition-transform text-center"
                            >
                                Retake Assessment
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative border border-gray-100 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/30 dark:bg-gray-900/30 overflow-x-auto pb-4 scrollbar-thin">
                    <div className="min-w-[600px] w-full">
                        <svg
                            viewBox={`0 -90 ${chartWidth} ${chartHeight + 90}`}
                            className="w-full h-auto overflow-visible"
                            onClick={() => setHoveredIndex(null)}
                        >
                            <defs>
                                <linearGradient id="full-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Y-axis Ticks & Horizontal Grid lines */}
                            {yTicks.map((tick, i) => {
                                const yAxisHeight = chartHeight - paddingYTop - paddingYBottom;
                                const y = chartHeight - paddingYBottom - ((tick - minScore) / (maxScore - minScore)) * yAxisHeight;
                                return (
                                    <g key={i}>
                                        <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="currentColor" className="text-gray-100 dark:text-gray-800/20" strokeDasharray="3 3" />
                                        <text x={paddingX - 12} y={y + 4} textAnchor="end" className="text-[10px] font-medium fill-gray-400 dark:fill-gray-500">
                                            {tick.toFixed(0)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area Fill */}
                            {areaPath && (
                                <path d={areaPath} fill="url(#full-chart-gradient)" />
                            )}

                            {/* Trend Line */}
                            {pointsPath && (
                                <path
                                    d={pointsPath}
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* Points */}
                            {chartPoints.map((p, index) => (
                                <g key={index}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHoveredIndex(hoveredIndex === index ? null : index)
                                    }}
                                    className="cursor-pointer"
                                >
                                    {/* Glow hover background */}
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="8.5"
                                        fill={getZoneColorHex(p.zone)}
                                        className={`transition-opacity duration-200 ${hoveredIndex === index ? 'opacity-25' : 'opacity-0'}`}
                                    />
                                    {/* Center white dot with colored border */}
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="5.5"
                                        fill="#FFFFFF"
                                        stroke={getZoneColorHex(p.zone)}
                                        strokeWidth="3"
                                        className="transition-transform duration-200"
                                    />
                                </g>
                            ))}

                            {/* Axis Labels */}
                            {chartPoints.map((p, index) => {
                                // Only show date labels for subset of points if there are too many (max 5)
                                const interval = Math.max(1, Math.ceil(chartPoints.length / 5));
                                if (index % interval !== 0 && index !== chartPoints.length - 1) return null;

                                return (
                                    <text
                                        key={index}
                                        x={p.x}
                                        y={chartHeight - 10}
                                        textAnchor="middle"
                                        className="text-[10px] font-semibold fill-gray-450 dark:fill-gray-500"
                                    >
                                        {p.dateStr}
                                    </text>
                                );
                            })}

                            {/* Active Tooltip rendering */}
                            {hoveredIndex !== null && chartPoints[hoveredIndex] && (() => {
                                const p = chartPoints[hoveredIndex];
                                // Constrain tooltip within bounds horizontally
                                const tooltipWidth = 140;
                                const tooltipHeight = 85;
                                const shiftX = p.x < tooltipWidth / 2 + 10
                                    ? (tooltipWidth / 2 + 10 - p.x)
                                    : p.x > chartWidth - tooltipWidth / 2 - 10
                                        ? (chartWidth - tooltipWidth / 2 - 10 - p.x)
                                        : 0;

                                const tooltipX = p.x + shiftX;
                                const tooltipY = p.y - tooltipHeight - 10;

                                return (
                                    <g transform={`translate(${tooltipX}, ${tooltipY})`} className="pointer-events-none drop-shadow-md">
                                        <rect
                                            x={-tooltipWidth / 2}
                                            y="0"
                                            width={tooltipWidth}
                                            height={tooltipHeight}
                                            rx="10"
                                            fill="#1E293B"
                                            className="fill-slate-900/95 dark:fill-slate-950/95"
                                        />
                                        <text fill="#FFFFFF" className="text-[10px] font-medium" textAnchor="middle">
                                            <tspan x="0" dy="16" fontWeight="bold" fill="#38BDF8">{p.dateStr}</tspan>
                                            <tspan x="0" dy="16" fontWeight="bold" fontSize="11" fill="#FFFFFF">Score: {p.score.toFixed(1)}</tspan>
                                            <tspan x="0" dy="14" fill="#94A3B8">Zone: {getZoneName(p.zone)}</tspan>
                                            <tspan x="0" dy="14" fill="#F87171">Pain: {p.pain}/10 | Func: {p.functionScore}/10</tspan>
                                        </text>
                                        {/* Small arrow down */}
                                        <polygon
                                            points={`${-shiftX - 5},${tooltipHeight} ${-shiftX + 5},${tooltipHeight} ${-shiftX},${tooltipHeight + 5}`}
                                            fill="#1E293B"
                                            className="fill-slate-900/95 dark:fill-slate-950/95"
                                        />
                                    </g>
                                );
                            })()}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
