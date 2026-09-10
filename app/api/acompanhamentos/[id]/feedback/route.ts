import { checkOrigin, endpoint, getFeedback, issueLink, requireStaff } from '../../../../../server/feedback';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return endpoint(async () => { const { id } = await context.params; requireStaff(request, id); return getFeedback(id); }); }
export async function POST(request: Request, context: Context) { return endpoint(async () => { const { id } = await context.params; requireStaff(request, id); checkOrigin(request); return issueLink(id); }); }
