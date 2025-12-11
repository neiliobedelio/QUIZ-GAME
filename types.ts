export interface Question {
  id: string;
  text: string;
  answer: string;
  options: string[];
  imageUrl?: string;
  category?: string;
  funFact?: string;
}

export type AppMode = 'entry' | 'play';

export interface AudioVisualizerProps {
  isPlaying: boolean;
  isListening: boolean;
  volume: number;
}