/**
 * SMS service — uses Twilio when env vars are set, otherwise mocks.
 *
 * Required env vars for real SMS:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER   (e.g. +15551234567)
 */

import { prisma } from "./prisma";

const twilioConfigured =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_FROM_NUMBER;

async function sendViaTwilio(to: string, body: string) {
  const twilio = (await import("twilio")).default;
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
  await client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER!,
    body,
  });
}

async function sendMock(
  eventId: string,
  toPhone: string,
  toName: string,
  body: string,
  type: string
) {
  await prisma.mockMessage.create({
    data: { eventId, toPhone, toName, body, type },
  });
  console.log(`[MOCK SMS] To: ${toPhone} — ${body}`);
}

export async function sendMagicLink(
  phone: string,
  url: string,
  isMock: boolean
): Promise<{ mockUrl?: string }> {
  const body = `Your fete link: ${url}\n\nExpires in 15 minutes.`;
  if (!isMock && twilioConfigured) {
    await sendViaTwilio(phone, body);
    return {};
  } else {
    console.log(`[MOCK SMS] Magic link to ${phone}: ${url}`);
    return { mockUrl: url };
  }
}

export async function sendCustomMessage(
  eventId: string,
  toPhone: string,
  toName: string,
  body: string
) {
  if (twilioConfigured) {
    await sendViaTwilio(toPhone, body);
    // Also log it so host can see what was sent
    await sendMock(eventId, toPhone, toName, body, "message");
  } else {
    await sendMock(eventId, toPhone, toName, body, "message");
  }
}
