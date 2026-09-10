import { checkOrigin, endpoint, jsonBody, submitFeedback } from '../../../server/feedback';
export async function POST(request: Request) { return endpoint(async () => { checkOrigin(request); return submitFeedback(await jsonBody(request)); }); }
