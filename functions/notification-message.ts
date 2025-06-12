import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';
import { environment } from '../src/environment';

admin.initializeApp();

// Twilio config
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const whatsappFrom = `whatsapp:${environment.clientPhone}`;
const smsFrom = `${environment.clientPhone}`;
const toNumber = '+DESTINATION_NUMBER';

const client = twilio(accountSid, authToken);

// Watch changes in a collection
export const notifyOnFirestoreChange = functions.firestore
  .document('orders/{docId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() : null;
    if (after) {
        let message = '';
    //   const message = `Data changed in Firestore:\n${JSON.stringify(after)}`;

      // Send WhatsApp
        await client.messages.create({
            body: message,
            from: whatsappFrom,
            to: 'whatsapp:' + toNumber,
        });

        // Send SMS
        await client.messages.create({
            body: message,
            from: smsFrom,
            to: toNumber,
        });
    }
    return null;
  });