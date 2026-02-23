import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

// --- Audio Service Logic ---

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

const initAudio = () => {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.5; // Master volume
        masterGain.connect(audioContext.destination);
    } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
    }
};

const playNote = (
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.5
) => {
    if (!audioContext || !masterGain) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Simple ADSR-like envelope
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.5, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
};

const audioService = {
    setMuted: (muted: boolean) => {
        if (!masterGain || !audioContext) return;
        masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, audioContext.currentTime, 0.01);
    },
    playKeyPress: () => {
        if (!audioContext) return;
        playNote(800 + Math.random() * 100, audioContext.currentTime, 0.1, 'triangle', 0.3);
    },
    playBackspace: () => {
        if (!audioContext) return;
        playNote(500, audioContext.currentTime, 0.1, 'triangle', 0.3);
    },
    playClear: () => {
        if (!audioContext) return;
        playNote(400, audioContext.currentTime, 0.2, 'square', 0.2);
        playNote(600, audioContext.currentTime + 0.1, 0.2, 'square', 0.2);
    },
    playSubmit: () => {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        playNote(523.25, now, 0.1, 'sine', 0.4); // C5
        playNote(659.25, now + 0.1, 0.15, 'sine', 0.4); // E5
    },
    playSuccess: () => {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        playNote(523.25, now, 0.1, 'sine'); // C5
        playNote(659.25, now + 0.1, 0.1, 'sine'); // E5
        playNote(783.99, now + 0.2, 0.2, 'sine'); // G5
    },
    playNoSolution: () => {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        playNote(300, now, 0.2, 'sawtooth', 0.3);
        playNote(250, now + 0.05, 0.2, 'sawtooth', 0.3);
    },
    playError: () => {
        if (!audioContext) return;
        playNote(150, audioContext.currentTime, 0.2, 'square', 0.4);
    },
    playHover: () => {
        if (!audioContext) return;
        playNote(1200, audioContext.currentTime, 0.05, 'sine', 0.2);
    }
};

// --- React Context ---

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playKeyPress: () => void;
    playBackspace: () => void;
    playClear: () => void;
    playSubmit: () => void;
    playSuccess: () => void;
    playNoSolution: () => void;
    playError: () => void;
    playHover: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Start muted by default to respect user preferences
    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = useCallback(() => {
        // First time unmuting also initializes the audio context, respecting browser autoplay policies.
        if (isMuted) {
            initAudio();
        }
        setIsMuted(prev => !prev);
    }, [isMuted]);
    
    // This effect connects the React state to the audio service
    useEffect(() => {
        audioService.setMuted(isMuted);
    }, [isMuted]);
    
    const value = {
        isMuted,
        toggleMute,
        playKeyPress: audioService.playKeyPress,
        playBackspace: audioService.playBackspace,
        playClear: audioService.playClear,
        playSubmit: audioService.playSubmit,
        playSuccess: audioService.playSuccess,
        playNoSolution: audioService.playNoSolution,
        playError: audioService.playError,
        playHover: audioService.playHover,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};