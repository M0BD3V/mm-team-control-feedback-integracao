import { endpoint, listFollowups, requireStaff } from '../../../server/feedback';
export async function GET(request: Request) { return endpoint(async () => { requireStaff(request); return listFollowups(); }); }
