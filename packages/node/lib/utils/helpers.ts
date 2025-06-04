import { METALLIC_AGENT_PORT } from './constants';

export function createAgentUrl(projectId: string, instanceId: string) {
  return `${projectId.replace(/_/g, '-')}-${instanceId}-${METALLIC_AGENT_PORT}.metallic.computer:443`;
}
