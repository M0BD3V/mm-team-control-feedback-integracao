import { endpoint, invitation } from '../../../server/feedback';
export async function GET(request: Request) { return endpoint(() => invitation(new URL(request.url).searchParams.get('token'))); }
