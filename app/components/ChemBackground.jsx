'use client';

import { useEffect, useState } from 'react';
import { FaSquareRootAlt, FaCalculator ,FaInfinity} from 'react-icons/fa';
import { FaAtom } from 'react-icons/fa';
import { IoMdFlask } from "react-icons/io";

const ChemBackground = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Predefined positions for initial server render
    const initialPositions = [
        { top: 20, left: 80, rotate: 45 },
        { top: 40, left: 20, rotate: 90 },
        { top: 60, left: 90, rotate: 135 },
        { top: 30, left: 50, rotate: 180 },
        { top: 70, left: 30, rotate: 225 },
        { top: 80, left: 70, rotate: 270 }
    ];

    const icons = [FaSquareRootAlt, FaSquareRootAlt,FaInfinity, FaSquareRootAlt, FaCalculator];

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 
                dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950"></div>

            {/* Molecules */}
            {initialPositions.map((pos, i) => {
                const Icon = icons[i % icons.length];
                const position = mounted ? {
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`
                } : {
                    top: `${pos.top}%`,
                    left: `${pos.left}%`,
                    transform: `rotate(${pos.rotate}deg)`
                };

                return (
                    <div key={i}
                        className={`absolute opacity-5 dark:opacity-10 animate-float-${i % 3}`}
                        style={{
                            ...position,
                            animationDelay: `${i * 0.5}s`
                        }}>
                        <Icon className="text-6xl text-blue-600" />
                    </div>
                );
            })}

            {/* Bubbles */}
            {[...Array(8)].map((_, i) => {
                const bubbleStyle = mounted ? {
                    width: `${Math.random() * 100 + 50}px`,
                    height: `${Math.random() * 100 + 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 10 + 15}s`
                } : {
                    width: '75px',
                    height: '75px',
                    left: `${(i * 12) % 100}%`,
                    top: `${(i * 15) % 100}%`,
                    animationDuration: '20s'
                };

                return (
                    <div key={`bubble-${i}`}
                        className="absolute rounded-full mix-blend-multiply animate-bubble-float"
                        style={{
                            ...bubbleStyle,
                            background: `radial-gradient(circle at 30% 30%, ${i % 2 === 0 ? '#93c5fd30' : '#a5b4fc30'
                                }, transparent)`,
                            animationDelay: `${i * 1.5}s`
                        }}>
                    </div>
                );
            })}
        </div>
    );
};

export default ChemBackground;
