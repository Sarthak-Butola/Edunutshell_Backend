import cron from "node-cron";
import sgMail from "@sendgrid/mail";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// helper: calculate tomorrow range
function getTomorrowRange() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  return { tomorrow, dayAfterTomorrow };
}

export function startEmailReminderJob() {
  // cron: runs every day at 12 a.m. 
  cron.schedule("0 0 * * *", async () => {
    const { tomorrow, dayAfterTomorrow } = getTomorrowRange();

    try {
      const users = await User.find({
        emailSent: false,
        $or: [
          { startDate: { $gte: tomorrow, $lt: dayAfterTomorrow } }, // tomorrow
          { startDate: { $lt: tomorrow } },                         // past
        ],
      });

      for (const user of users) {
        let subject, text;

        if (user.startDate >= tomorrow && user.startDate < dayAfterTomorrow) {
          // Tomorrow’s users
          subject = "Reminder: Your start date is tomorrow!";
          text = `Hi ${user.name}, just a reminder your start date is on ${user.startDate.toDateString()}.`;
        } else {
          // Past users (missed emails)
          subject = "Reminder: Your start date has already passed!";
          text = `Hi ${user.name}, we noticed your start date was on ${user.startDate.toDateString()}, but you hadn’t received a reminder earlier.`;
        }

        const msg = {
          to: user.email,
          from: "sarthakbutola@gmail.com", // MUST be verified in SendGrid
          subject,
          text,
        };

        await sgMail.send(msg);
        // console.log(`✅ Sent email to ${user.email}`);

        user.emailSent = true;
        await user.save();
      }
    } catch (err) {
      console.error("❌ Error in cron job:", err);
    }
  }, {
  timezone: "Asia/Kolkata"
}
);
}
