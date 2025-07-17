import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST, // e.g., 'imap.gmail.com'
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

export const fetchInboxEmails = async (req, res) => {
  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
      struct: true,
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const emails = messages.map((item) => {
      const header = item.parts[0].body;
      return {
        id: item.attributes.uid,
        subject: header.subject[0],
        from: header.from[0],
        date: header.date[0],
      };
    });

    connection.end();
    res.json(emails);
  } catch (error) {
    console.error('Email fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch inbox' });
  }
};

export const fetchEmailById = async (req, res) => {
  try {
    const uid = req.params.id;
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const messages = await connection.search([['UID', uid]], {
      bodies: [''],
      struct: true,
    });

    const fullEmail = await simpleParser(messages[0].parts[0].body);

    connection.end();

    res.json({
      subject: fullEmail.subject,
      from: fullEmail.from.text,
      date: fullEmail.date,
      html: fullEmail.html,
      text: fullEmail.text,
    });
  } catch (error) {
    console.error('Email read error:', error);
    res.status(500).json({ message: 'Failed to fetch email' });
  }
};
