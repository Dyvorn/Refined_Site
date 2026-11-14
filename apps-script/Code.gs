/**
 * VYRN Static Site Backend — Google Apps Script Web App
 * Target Site: https://lennardpenzler.com
 * Owner Inbox: refined.mov@gmail.com
 *
 * Handles:
 *  1. Discord Launch Waitlist database (deduplicated Google Sheet "Discord Waitlist")
 *  2. Get in Touch contact form forwarding + logging ("Contact Inquiries" + Gmail delivery)
 *  3. Batch Discord invite email distribution when the server launches
 *
 * SETUP (takes ~60 seconds, free on your Google account):
 *  1. Open https://script.google.com -> Click "New project".
 *  2. Replace everything in Code.gs with the contents of this file and click Save (Ctrl+S).
 *  3. Run `setupDatabase` once in the editor toolbar and grant Google Sheets + Gmail permissions.
 *     (This automatically creates your "VYRN Site Database" Google Sheet and logs its URL in Execution Log.)
 *  4. Click "Deploy" -> "New deployment" -> Select type: "Web app":
 *       - Description: VYRN Forms & Waitlist v1
 *       - Execute as: Me (refined.mov@gmail.com)
 *       - Who has access: Anyone
 *     Copy the resulting Web App URL (https://script.google.com/macros/s/.../exec)
 *     and paste it into `CONFIG.BACKEND_ENDPOINT` in config.js.
 */

const CONFIG = {
  OWNER_EMAIL: 'refined.mov@gmail.com',
  SITE_NAME: 'VYRN',
  SITE_URL: 'https://lennardpenzler.com',
  DB_TITLE: 'VYRN Site Database',
  WAITLIST_SHEET: 'Discord Waitlist',
  CONTACT_SHEET: 'Contact Inquiries',
  // Set true only if you want an email alert for every waitlist signup (burns 100/day free Gmail quota faster)
  NOTIFY_OWNER_ON_WAITLIST: false,
  // Set true if you want an automated confirmation email sent to each waitlist subscriber immediately
  SEND_WAITLIST_CONFIRMATION: false,
  MAX_NAME_LENGTH: 120,
  MAX_EMAIL_LENGTH: 254,
  MAX_TOPIC_LENGTH: 160,
  MAX_MESSAGE_LENGTH: 5000,
};

/**
 * Run once manually from the Apps Script editor to initialize the database spreadsheet
 * and print its URL to the Execution Log.
 */
function setupDatabase() {
  const ss = getOrCreateDatabase_();
  Logger.log('Database ready: %s', ss.getUrl());
  return ss.getUrl();
}

/**
 * Health check endpoint for verifying deployment in a browser.
 */
function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'vyrn-backend',
    status: 'ready',
  });
}

/**
 * Receives AJAX form submissions from the static site.
 * Uses simple POST payloads (text/plain JSON or form-encoded) so browser requests skip CORS preflight.
 */
function doPost(e) {
  let payload;
  try {
    payload = parsePayload_(e);
  } catch (err) {
    return jsonResponse_({ ok: false, message: 'Invalid request payload.' });
  }

  // Quietly succeed on honeypot spam submissions without writing or emailing
  if (cleanText_(payload._website || payload.website, 200)) {
    return jsonResponse_({ ok: true, message: 'Submitted.' });
  }

  const action = cleanText_(payload.action, 32).toLowerCase();
  if (action === 'waitlist') {
    return handleWaitlist_(payload);
  }
  if (action === 'contact') {
    return handleContact_(payload);
  }

  return jsonResponse_({ ok: false, message: 'Unknown form action.' });
}

function handleWaitlist_(payload) {
  const email = cleanText_(payload.email, CONFIG.MAX_EMAIL_LENGTH).toLowerCase();
  const source = cleanText_(payload.source, 200) || '/';

  if (!isValidEmail_(email)) {
    return jsonResponse_({ ok: false, message: 'Please enter a valid email address.' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = getOrCreateDatabase_();
    const sheet = getOrCreateSheet_(ss, CONFIG.WAITLIST_SHEET, [
      'Submitted At (UTC)',
      'Email',
      'Status',
      'Source',
      'Notified At',
    ]);

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (let i = 0; i < existingValues.length; i++) {
        if (String(existingValues[i][0] || '').trim().toLowerCase() === email) {
          return jsonResponse_({
            ok: true,
            alreadyRegistered: true,
            message: "You're already on the list! We'll email your invite once Discord opens.",
          });
        }
      }
    }

    const nowIso = new Date().toISOString();
    sheet.appendRow([nowIso, email, 'Waitlisted', source, '']);

    if (CONFIG.NOTIFY_OWNER_ON_WAITLIST && MailApp.getRemainingDailyQuota() > 2) {
      MailApp.sendEmail({
        to: CONFIG.OWNER_EMAIL,
        subject: '[VYRN Waitlist] New signup: ' + email,
        body: 'New Discord waitlist signup:\n\nEmail: ' + email + '\nTime: ' + nowIso + '\nDatabase: ' + ss.getUrl(),
      });
    }

    if (CONFIG.SEND_WAITLIST_CONFIRMATION && MailApp.getRemainingDailyQuota() > 5) {
      MailApp.sendEmail({
        to: email,
        replyTo: CONFIG.OWNER_EMAIL,
        name: CONFIG.SITE_NAME,
        subject: "You're on the VYRN Discord waitlist",
        body: [
          'Hey,',
          '',
          "You're confirmed on the early access waitlist for the VYRN Discord community.",
          'As soon as the server launches, you will receive your private invite link at this address.',
          '',
          '— VYRN',
          CONFIG.SITE_URL,
        ].join('\n'),
      });
    }

    return jsonResponse_({
      ok: true,
      message: "You're on the list! We'll email your invite as soon as Discord goes live.",
    });
  } catch (err) {
    Logger.log('Waitlist error: %s', err && err.stack ? err.stack : err);
    return jsonResponse_({
      ok: false,
      message: 'Could not save your waitlist email right now. Please try again shortly.',
    });
  } finally {
    lock.releaseLock();
  }
}

function handleContact_(payload) {
  const name = cleanText_(payload.name, CONFIG.MAX_NAME_LENGTH);
  const email = cleanText_(payload.email, CONFIG.MAX_EMAIL_LENGTH).toLowerCase();
  const topic = cleanText_(payload.topic, CONFIG.MAX_TOPIC_LENGTH) || 'General Inquiry';
  const message = cleanText_(payload.message, CONFIG.MAX_MESSAGE_LENGTH, true);
  const consent = payload.consent === true || String(payload.consent).toLowerCase() === 'true';

  if (!name || !isValidEmail_(email) || !message) {
    return jsonResponse_({ ok: false, message: 'Please fill in your name, email, and message.' });
  }
  if (!consent) {
    return jsonResponse_({ ok: false, message: 'Please confirm the privacy consent checkbox.' });
  }

  const ss = getOrCreateDatabase_();
  const sheet = getOrCreateSheet_(ss, CONFIG.CONTACT_SHEET, [
    'Submitted At (UTC)',
    'Name',
    'Email',
    'Topic',
    'Message',
    'Consent',
    'Delivery Status',
  ]);

  const nowIso = new Date().toISOString();
  sheet.appendRow([nowIso, name, email, topic, message, 'Accepted', 'Pending']);
  const rowIndex = sheet.getLastRow();

  try {
    if (MailApp.getRemainingDailyQuota() < 1) {
      throw new Error('Daily Gmail sending quota reached.');
    }

    MailApp.sendEmail({
      to: CONFIG.OWNER_EMAIL,
      replyTo: email,
      name: name + ' via ' + CONFIG.SITE_NAME,
      subject: '[VYRN] ' + topic + ' — ' + name,
      body: [
        'New inquiry submitted on ' + CONFIG.SITE_URL,
        '',
        'Name:   ' + name,
        'Email:  ' + email,
        'Topic:  ' + topic,
        'Time:   ' + nowIso,
        '',
        'Message:',
        '----------------------------------------',
        message,
        '----------------------------------------',
        '',
        'Tip: Reply directly to this email to answer ' + name + '.',
      ].join('\n'),
    });

    sheet.getRange(rowIndex, 7).setValue('Sent');

    return jsonResponse_({
      ok: true,
      message: "Message sent! Thank you for reaching out — I'll reply to you shortly.",
    });
  } catch (err) {
    const errMsg = err && err.message ? err.message : String(err);
    sheet.getRange(rowIndex, 7).setValue('Failed: ' + errMsg);
    Logger.log('Contact delivery error: %s', err && err.stack ? err.stack : err);
    return jsonResponse_({
      ok: false,
      message: 'Unable to deliver your message automatically right now. Please email ' + CONFIG.OWNER_EMAIL + ' directly.',
    });
  }
}

/**
 * DISCORD LAUNCH BLAST HELPER
 * Run this function manually from Apps Script when the Discord server is ready!
 * Only rows with Status === "Waitlisted" receive the email, and each row is marked "Invited"
 * immediately so re-running later is safe and never emails the same subscriber twice.
 *
 * Usage: Pass your live invite URL into `sendDiscordInvites('https://discord.gg/your-code')`
 * or edit `inviteUrl` below and run `runDiscordLaunchBlast`.
 */
function runDiscordLaunchBlast() {
  const inviteUrl = 'https://discord.gg/REPLACE_WITH_YOUR_INVITE';
  if (inviteUrl.indexOf('REPLACE_WITH_YOUR_INVITE') !== -1) {
    throw new Error('Set your real Discord invite URL before running runDiscordLaunchBlast.');
  }
  return sendDiscordInvites(inviteUrl);
}

function sendDiscordInvites(inviteUrl) {
  if (!inviteUrl || String(inviteUrl).indexOf('https://') !== 0) {
    throw new Error('Invalid Discord invite URL.');
  }

  const ss = getOrCreateDatabase_();
  const sheet = getOrCreateSheet_(ss, CONFIG.WAITLIST_SHEET, [
    'Submitted At (UTC)',
    'Email',
    'Status',
    'Source',
    'Notified At',
  ]);

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No waitlist subscribers found.');
    return { sent: 0, remainingWaitlisted: 0 };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  let sentCount = 0;
  let skippedQuota = 0;

  for (let i = 0; i < data.length; i++) {
    const email = cleanText_(data[i][1], CONFIG.MAX_EMAIL_LENGTH).toLowerCase();
    const status = cleanText_(data[i][2], 40);
    if (!isValidEmail_(email) || status !== 'Waitlisted') continue;

    if (MailApp.getRemainingDailyQuota() < 2) {
      skippedQuota++;
      continue;
    }

    MailApp.sendEmail({
      to: email,
      replyTo: CONFIG.OWNER_EMAIL,
      name: CONFIG.SITE_NAME,
      subject: 'The VYRN Discord Community is now open — your invite link',
      body: [
        'Hey!',
        '',
        'You joined the early access waitlist on ' + CONFIG.SITE_URL + ', and the Discord server is finally live.',
        '',
        'Join here: ' + inviteUrl,
        '',
        'Welcome to the community — DaVinci Resolve editors, audio engineers, and creative coders.',
        '',
        '— VYRN',
        CONFIG.SITE_URL,
      ].join('\n'),
    });

    const rowNumber = i + 2;
    const sentAt = new Date().toISOString();
    sheet.getRange(rowNumber, 3).setValue('Invited');
    sheet.getRange(rowNumber, 5).setValue(sentAt);
    SpreadsheetApp.flush();
    sentCount++;
  }

  Logger.log('Discord launch blast complete. Sent: %s | Deferred for quota: %s', sentCount, skippedQuota);
  return { sent: sentCount, deferredForQuota: skippedQuota };
}

function getOrCreateDatabase_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SPREADSHEET_ID');
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (e) {
      // Recreate only if saved spreadsheet was deleted
    }
  }

  const ss = SpreadsheetApp.create(CONFIG.DB_TITLE);
  props.setProperty('SPREADSHEET_ID', ss.getId());

  getOrCreateSheet_(ss, CONFIG.WAITLIST_SHEET, [
    'Submitted At (UTC)',
    'Email',
    'Status',
    'Source',
    'Notified At',
  ]);
  getOrCreateSheet_(ss, CONFIG.CONTACT_SHEET, [
    'Submitted At (UTC)',
    'Name',
    'Email',
    'Topic',
    'Message',
    'Consent',
    'Delivery Status',
  ]);

  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Tabellenblatt1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  return ss;
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0 && headers && headers.length) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    const raw = String(e.postData.contents).trim();
    if (raw.charAt(0) === '{') {
      return JSON.parse(raw);
    }
  }
  return (e && e.parameter) ? e.parameter : {};
}

function cleanText_(val, maxLen, preserveNewlines) {
  if (val === undefined || val === null) return '';
  let str = String(val).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (!preserveNewlines) {
    str = str.replace(/[\r\n]+/g, ' ');
  }
  str = str.trim();
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= CONFIG.MAX_EMAIL_LENGTH;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
