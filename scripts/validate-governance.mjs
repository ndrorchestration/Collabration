import { readFile } from 'node:fs/promises';
import { loadCapabilityMatrix, policyForAgent } from '../packages/governance/src/index.js';

const text = await readFile(new URL('../governance/capability-matrix.yaml', import.meta.url), 'utf8');
const matrix = loadCapabilityMatrix(text);
const agentTypes = Object.keys(matrix.agents);
for (const agentType of agentTypes) policyForAgent(matrix, agentType);
console.log(`capability matrix valid: ${matrix.version}; agents=${agentTypes.join(',')}; default=${matrix.default}`);
