import { getCurrentAdmin } from '@/lib/auth/requireAdmin'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentAdmin()
  return Response.json({ success: true, data: { user } })
}
