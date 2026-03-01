interface StaleTimeOptions {
  seconds?: number;
  minutes?: number;
  hours?: number;
}

export function useStaleTime(options: StaleTimeOptions): number {
  const { seconds = 0, minutes = 0, hours = 0 } = options;
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
