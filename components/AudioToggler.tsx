import React from 'react';
import { useAudio } from '../audio/AudioContext';

const SoundOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SoundOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l-4-4m0 4l4-4" />
    </svg>
);

export const AudioToggler: React.FC = () => {
    const { isMuted, toggleMute } = useAudio();

    return (
        <button
            onClick={toggleMute}
            className="p-2 rounded-full transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
            {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
    );
};