import { buildDeploymentContract } from '../../../lib/deployment-contract.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify(buildDeploymentContract(process.env)), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0'
    }
  });
}
