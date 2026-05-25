const CALLMEBOT_MESSAGE_PLACEHOLDER = '{message}';

function getCallMeBotTemplate(): string | null {
  return process.env.CALLMEBOT_URL_TEMPLATE?.trim() || null;
}

export function isCallMeBotConfigured(): boolean {
  const template = getCallMeBotTemplate();
  return Boolean(template && template.includes(CALLMEBOT_MESSAGE_PLACEHOLDER));
}

export function buildCallMeBotUrl(message: string): string | null {
  const template = getCallMeBotTemplate();
  if (!template || !template.includes(CALLMEBOT_MESSAGE_PLACEHOLDER)) return null;
  return template.replace(CALLMEBOT_MESSAGE_PLACEHOLDER, encodeURIComponent(message));
}

export async function sendCallMeBotMessage(message: string): Promise<boolean> {
  const url = buildCallMeBotUrl(message);
  if (!url) return false;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`CallMeBot request failed (${response.status}): ${details}`);
  }

  return true;
}
