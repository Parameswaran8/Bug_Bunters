import cron from "node-cron";
import BugModel from "../models/bug.models";
import User from "../models/user.model";
import { sendEmail } from "./mail";

export const sendDailyReport = async () => {
  try {
    console.log("Running Daily Bug Report Cron Job...");

    // Get bugs that are NOT in Closure
    const bugs = await BugModel.find({
      currentPhase: { $nin: ["Closure", "Closed"] },
      isActive: true
    }).populate("phaseI_BugReport.reportedBy", "name email");

    if (bugs.length === 0) {
      console.log("No pending bugs to report.");
      return;
    }

    // Create email content
    let htmlContent = `
      <h2>Daily Bug Report</h2>
      <p>Here is the list of bugs that are created, updated, or pending (excluding closed/closure bugs) as of 8:00 PM today:</p>
      <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="text-align: left;">Bug ID</th>
            <th style="text-align: left;">Phase</th>
            <th style="text-align: left;">Priority</th>
            <th style="text-align: left;">Reported By</th>
            <th style="text-align: left;">Tool</th>
          </tr>
        </thead>
        <tbody>
    `;

    bugs.forEach(bug => {
      const reporter = bug.phaseI_BugReport?.reportedBy as any;
      const reporterName = reporter?.name || "Unknown";
      const priority = bug.phaseI_BugReport?.toolInfo?.priority || "N/A";
      const toolName = bug.phaseI_BugReport?.toolInfo?.toolName || "N/A";

      htmlContent += `
        <tr>
          <td><strong>${bug.bugId}</strong></td>
          <td>${bug.currentPhase}</td>
          <td>${priority}</td>
          <td>${reporterName}</td>
          <td>${toolName}</td>
        </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
      <p>Please review these bugs in the system dashboard.</p>
    `;

    // Find all admins & superadmins
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } });
    const adminEmails = admins.map(admin => admin.email).filter(Boolean) as string[];



    if (adminEmails.length > 0) {
      await sendEmail(
        adminEmails.join(","),
        "Daily Bug Report (Created, Updated & Pending)",
        "Daily Report of Pending Bugs",
        htmlContent
      );
      console.log(`Daily bug report sent to: ${adminEmails.join(", ")}`);
    } else {
      console.log("No admins found with email addresses to send the report.");
    }

  } catch (error) {
    console.error("Error in daily bug report cron job:", error);
  }
};

export const setupCronJobs = () => {
  // Run every day at 8:00 PM (20:00)
  cron.schedule("0 20 * * *", sendDailyReport);
};
