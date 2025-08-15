import { RunMutationCtx } from "@convex-dev/better-auth";
import { Resend } from "@convex-dev/resend";
import { render } from "@repo/email";
import { components } from "../_generated/api";
import "../polyfill";

export const resend: Resend = new Resend(components.resend, {
  testMode: true,
});

export const sendEmail = async (
  ctx: RunMutationCtx,
  {
    from,
    to,
    subject,
    react,
    cc,
    bcc,
    replyTo,
  }: {
    from?: string;
    to: string;
    subject: string;
    react: any;
    cc?: string[];
    bcc?: string[];
    replyTo?: string[];
  }
) => {
  const defaultFrom = "delivered@resend.dev";

  await resend.sendEmail(ctx, {
    from: from || defaultFrom,
    to: to,
    subject,
    html: await render(react),
    ...(cc && { cc }),
    ...(bcc && { bcc }),
    ...(replyTo && { replyTo }),
  });
};
