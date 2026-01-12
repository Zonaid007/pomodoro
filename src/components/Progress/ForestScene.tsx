import { useMemo } from 'react';
import './ForestScene.css';

interface ForestSceneProps {
    completedSessions: number;
    className?: string;
}

/**
 * Animated forest/river scene that grows with completed sessions
 * Theme: Elegant, calm, non-cartoonish
 */
export function ForestScene({ completedSessions, className = '' }: ForestSceneProps) {
    // Calculate growth level (0-10 based on sessions)
    const growthLevel = useMemo(() => {
        return Math.min(10, completedSessions);
    }, [completedSessions]);

    // River clarity (0-1) improves with more sessions
    const riverClarity = useMemo(() => {
        return Math.min(1, completedSessions / 20);
    }, [completedSessions]);

    // Number of trees based on growth
    const treeCount = useMemo(() => {
        if (completedSessions === 0) return 1;
        if (completedSessions < 3) return 2;
        if (completedSessions < 7) return 3;
        if (completedSessions < 12) return 4;
        return 5;
    }, [completedSessions]);

    return (
        <div className={`forest-scene ${className}`}>
            <svg
                viewBox="0 0 400 200"
                className="forest-svg"
                aria-label={`Forest with ${completedSessions} sessions of growth`}
            >
                <defs>
                    {/* Sky gradient */}
                    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1a1a2e" />
                        <stop offset="100%" stopColor="#16213e" />
                    </linearGradient>

                    {/* River gradient - gets clearer with progress */}
                    <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={`rgba(59, 130, 246, ${0.3 + riverClarity * 0.4})`} />
                        <stop offset="50%" stopColor={`rgba(139, 92, 246, ${0.3 + riverClarity * 0.3})`} />
                        <stop offset="100%" stopColor={`rgba(59, 130, 246, ${0.3 + riverClarity * 0.4})`} />
                    </linearGradient>

                    {/* Light rays filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Tree gradient */}
                    <linearGradient id="treeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#0f4c3a" />
                        <stop offset="100%" stopColor="#1a6b52" />
                    </linearGradient>
                </defs>

                {/* Sky background */}
                <rect x="0" y="0" width="400" height="200" fill="url(#skyGradient)" />

                {/* Stars (appear with more sessions) */}
                {growthLevel >= 3 && (
                    <g className="stars">
                        <circle cx="50" cy="25" r="1" fill="#ffffff" opacity="0.6" className="twinkle" />
                        <circle cx="120" cy="35" r="0.8" fill="#ffffff" opacity="0.4" className="twinkle-delay" />
                        <circle cx="300" cy="20" r="1" fill="#ffffff" opacity="0.5" className="twinkle" />
                        <circle cx="350" cy="40" r="0.6" fill="#ffffff" opacity="0.4" className="twinkle-delay" />
                    </g>
                )}

                {/* Moon (appears after 5 sessions) */}
                {growthLevel >= 5 && (
                    <circle
                        cx="340"
                        cy="40"
                        r="15"
                        fill="#f4f4f5"
                        opacity="0.9"
                        filter="url(#glow)"
                        className="moon"
                    />
                )}

                {/* Ground */}
                <path
                    d="M0,160 Q100,150 200,155 Q300,160 400,150 L400,200 L0,200 Z"
                    fill="#0d3320"
                />

                {/* River */}
                <path
                    d="M-20,175 Q80,165 150,175 Q220,185 280,170 Q340,160 420,175"
                    stroke="url(#riverGradient)"
                    strokeWidth="12"
                    fill="none"
                    className="river"
                />

                {/* River reflection/shimmer */}
                <path
                    d="M-20,175 Q80,165 150,175 Q220,185 280,170 Q340,160 420,175"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                    fill="none"
                    className="river-shimmer"
                />

                {/* Trees - grow with sessions */}
                <g className="trees">
                    {/* Base tree (always present) */}
                    <Tree x={200} height={40 + growthLevel * 3} delay={0} />

                    {/* Additional trees based on progress */}
                    {treeCount >= 2 && <Tree x={120} height={30 + growthLevel * 2} delay={0.5} />}
                    {treeCount >= 3 && <Tree x={280} height={35 + growthLevel * 2.5} delay={1} />}
                    {treeCount >= 4 && <Tree x={60} height={25 + growthLevel * 2} delay={1.5} />}
                    {treeCount >= 5 && <Tree x={340} height={30 + growthLevel * 2} delay={2} />}
                </g>

                {/* Light rays (appear with more sessions) */}
                {growthLevel >= 7 && (
                    <g className="light-rays" opacity="0.15">
                        <path d="M340,40 L300,160" stroke="#f4f4f5" strokeWidth="20" />
                        <path d="M340,40 L340,180" stroke="#f4f4f5" strokeWidth="15" />
                        <path d="M340,40 L380,170" stroke="#f4f4f5" strokeWidth="10" />
                    </g>
                )}
            </svg>

            {/* Progress indicator */}
            <div className="forest-progress">
                <span className="progress-text">
                    {completedSessions === 0
                        ? 'Plant your first tree'
                        : completedSessions === 1
                            ? '1 session · Forest awakening'
                            : `${completedSessions} sessions · ${getGrowthMessage(completedSessions)}`}
                </span>
            </div>
        </div>
    );
}

// Tree component with wind animation
function Tree({ x, height, delay }: { x: number; height: number; delay: number }) {
    const y = 155 - height;
    const trunkHeight = height * 0.35;
    const crownHeight = height * 0.65;

    return (
        <g style={{ animationDelay: `${delay}s` }} className="tree">
            {/* Trunk */}
            <rect
                x={x - 3}
                y={y + crownHeight}
                width={6}
                height={trunkHeight}
                fill="#3d2914"
            />
            {/* Crown */}
            <ellipse
                cx={x}
                cy={y + crownHeight / 2}
                rx={height * 0.3}
                ry={crownHeight / 2}
                fill="url(#treeGradient)"
                className="tree-crown"
            />
        </g>
    );
}

function getGrowthMessage(sessions: number): string {
    if (sessions < 3) return 'Saplings emerge';
    if (sessions < 7) return 'Forest growing';
    if (sessions < 12) return 'River clearing';
    if (sessions < 20) return 'Moonlight appears';
    return 'Flourishing forest';
}
