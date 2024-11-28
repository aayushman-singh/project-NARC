import { Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export async function logSanitizedMessages(page: Page, recipientName: string): Promise<string | null> {
    try {
        console.log(`Fetching conversation with ${recipientName}...`);

        // Locate the container for messages using `aria-label` with "Messages in..."
        const messagesContainer = await page.locator('div[aria-label^="Messages in"]');

        if (!(await messagesContainer.count())) {
            console.error('Messages container with "Messages in..." not found.');
            return null;
        }

        console.log('Messages container found.');

        // Select all direct child div elements within the container
        const rows = await messagesContainer.locator('div[role="row"]').all();

        if (rows.length === 0) {
            console.error('No message rows found within the container.');
            return null;
        }

        console.log(`Total rows found in container: ${rows.length}`);

        let lastSender = ''; // Keep track of the last sender to group messages
        const groupedMessages: { sender: string; messages: string[] }[] = []; // Collect grouped messages

        for (const row of rows) {
            const rowContent = (await row.textContent()).replace(/Enter/g, '').trim(); // Remove "Enter"

            // Ignore empty messages after cleaning
            if (!rowContent) {
                continue;
            }

            // Extract the sender (e.g., "You sent" or recipient's name)
            const senderMatch = rowContent.match(/^(You sent|[\w\s]+):?/);
            const sender = senderMatch ? senderMatch[1].trim() : 'Unknown';

            // Extract the message content
            const message = senderMatch
                ? rowContent.replace(senderMatch[0], '').trim()
                : rowContent;

            // Group messages by sender
            if (sender !== lastSender) {
                groupedMessages.push({ sender, messages: [message] });
                lastSender = sender;
            } else {
                groupedMessages[groupedMessages.length - 1].messages.push(message);
            }
        }

        // Prepare the file content
        const fileContent = [`Conversation with ${recipientName}:\n`];
        groupedMessages.forEach((group, index) => {
            const senderLabel = group.sender === 'You sent' ? 'You' : recipientName;
            fileContent.push(`${index + 1}. ${senderLabel}:\n`);
            group.messages.forEach((msg, idx) => {
                fileContent.push(`   ${idx + 1}. ${msg}\n`);
            });
        });

        // Write the log to a file
        const logsDirectory = path.resolve('./logs');
        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory, { recursive: true });
        }

        const filePath = path.join(logsDirectory, `chat_log_${recipientName.replace(/\s+/g, '_')}.txt`);
        fs.writeFileSync(filePath, fileContent.join(''), 'utf-8');
        console.log(`Chat log written to: ${filePath}`);

        return filePath;
    } catch (error) {
        console.error('An error occurred while logging messages:', error);
        return null;
    }
}
