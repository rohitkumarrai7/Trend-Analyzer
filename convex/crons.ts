import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

/**
 * Scheduled campaign scanner — runs every hour on the Convex cloud.
 * Checks all active campaigns and scans those whose scanInterval has elapsed.
 * This runs independently of Vercel, so it works even when no user is online.
 */
const crons = cronJobs();

crons.hourly('scheduled-campaign-scan', { minuteUTC: 0 }, internal.scanner.runScheduledScans);

export default crons;
