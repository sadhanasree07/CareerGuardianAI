export type TranscriptSegment = { id: number; startTime: number; endTime: number; speaker: string; text: string };
export type RecordingKeyEvidence = { segmentId: number; startTime: number; endTime: number; category: string; text: string; repeatCount: number; firstOccurrence: number; subsequentOccurrences: number[]; similarity?: number; context?: string };

export function formatTimestamp(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function buildRecordingTranscript(segments: TranscriptSegment[]) {
  return segments.map((segment) => `[${formatTimestamp(segment.startTime)}] ${segment.speaker}: ${segment.text}`).join("\n");
}
