import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

const OWNER_EMAIL = 'aniruddhadamale001@gmail.com';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName = ''
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      const shouldPromoteOwner =
        normalizedEmail === OWNER_EMAIL && !current.isAdmin;
      if (
        shouldPromoteOwner ||
        current.email !== normalizedEmail ||
        (displayName && current.displayName !== displayName)
      ) {
        const updated = await db
          .update(users)
          .set({
            email: normalizedEmail,
            displayName: displayName || current.displayName,
            isAdmin: current.isAdmin || shouldPromoteOwner,
          })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return current;
    }

    const existingAdmins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1);

    const grantAdmin =
      normalizedEmail === OWNER_EMAIL || existingAdmins.length === 0;

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        displayName,
        isAdmin: grantAdmin,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
          displayName,
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database user synchronization failed:', error);
    throw new Error('Unable to synchronize account record.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database user lookup failed:', error);
    throw new Error('Unable to fetch user record.', { cause: error });
  }
}
