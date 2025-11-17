import "dotenv/config";
import { db } from "../server/db";
import { emailLogs } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function updateEmailLogToSent() {
  try {
    // Get the most recent email log
    const logs = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt)).limit(1);
    
    if (logs.length === 0) {
      console.log("No email logs found in the database.");
      return;
    }

    const log = logs[0];
    console.log(`Found email log: ${log.id}`);
    console.log(`Current status: ${log.status}`);
    console.log(`Subject: ${log.subject}`);
    console.log(`Recipient: ${log.recipient}`);

    // Update to 'sent' status
    await db
      .update(emailLogs)
      .set({
        status: 'sent',
        errorMessage: null,
      })
      .where(eq(emailLogs.id, log.id));

    console.log(`\n✅ Successfully updated email log ${log.id} to 'sent' status!`);
    
    // Verify the update
    const updated = await db.select().from(emailLogs).where(eq(emailLogs.id, log.id));
    console.log(`\nUpdated log:`, updated[0]);
  } catch (error) {
    console.error("Error updating email log:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateEmailLogToSent();

