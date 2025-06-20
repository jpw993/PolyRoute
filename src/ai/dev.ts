
import '@/ai/flows/optimal-route-finding.ts';
// Ensure the functions exported by optimal-route-finding.ts are usable by Genkit dev tools
// For example, if using Genkit defineFlow directly in the file:
// import { calculateDirectRouteOnly, calculateOptimalRouteWithOptionalDirect } from '@/ai/flows/optimal-route-finding';
// No explicit registration needed here if they are just exported async functions called by client.
// If they were Genkit flows, you would ensure they are defined with ai.defineFlow(...)
// and imported here so genkit CLI picks them up.
// The current setup uses them as plain async functions, which is fine for client-side calls.
