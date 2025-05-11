export function getYoutubeUrl (videoId: string, t: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${t}`;
}

export function getYoutubeThumnailUrl (videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}

export function assertNotUndefined<T> (
  value: T | undefined,
  message: string = 'Unexpected undefined value'
) {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
}
