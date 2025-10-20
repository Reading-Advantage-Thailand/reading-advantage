/**
 * Server-Sent Events (SSE) endpoint for real-time metrics updates
 * 
 * This endpoint streams metrics:update events to connected clients
 * for real-time cache invalidation and UI updates.
 */

import { NextRequest } from 'next/server';
import { getPostgresListener, MetricsUpdatePayload } from '@/lib/cache/postgres-listener';
import { getMetricsCacheStats } from '@/lib/cache/metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for metrics updates
 * 
 * Usage:
 * ```ts
 * const eventSource = new EventSource('/api/v1/metrics/stream');
 * eventSource.addEventListener('metrics:update', (event) => {
 *   const data = JSON.parse(event.data);
 *   console.log('Metrics updated:', data);
 * });
 * ```
 */
export async function GET(req: NextRequest) {
  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const send = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      send('connected', {
        timestamp: new Date().toISOString(),
        stats: getMetricsCacheStats(),
      });

      // Get PostgreSQL listener
      const listener = getPostgresListener();

      // Handle metrics updates
      const onMetricsUpdate = (payload: MetricsUpdatePayload) => {
        send('metrics:update', payload);
      };

      listener.on('metrics:update', onMetricsUpdate);

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          send('heartbeat', {
            timestamp: new Date().toISOString(),
            stats: getMetricsCacheStats(),
          });
        } catch (error) {
          console.error('[SSE] Heartbeat error:', error);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        listener.off('metrics:update', onMetricsUpdate);
        clearInterval(heartbeat);
        controller.close();
        console.log('[SSE] Client disconnected');
      });

      console.log('[SSE] Client connected');
    },
  });

  return new Response(stream, { headers });
}
