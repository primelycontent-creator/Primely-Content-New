import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export async function notifyUser({
  userId,
  type,
  title,
  message,
  link,
  emailSubject,
  emailHtml,
  emailText,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  emailSubject?: string;
  emailHtml?: string;
  emailText?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailNotificationsEnabled: true,
      inAppNotificationsEnabled: true,
      settings: {
        select: {
          emailNotifications: true,
          inAppNotifications: true,
        },
      },
    },
  });

  if (!user) return { ok: false, error: "User not found" };

  let notification = null;

  const allowInApp =
    user.inAppNotificationsEnabled && (user.settings?.inAppNotifications ?? true);

  const allowEmail =
    user.emailNotificationsEnabled && (user.settings?.emailNotifications ?? true);

  if (allowInApp) {
    notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  }

  if (allowEmail && emailSubject && emailHtml) {
    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText ?? message,
    });
  }

  return { ok: true, notification };
}