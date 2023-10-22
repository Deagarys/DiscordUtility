import { Bot } from './Bot';

export class AutoReplyBot extends Bot {
    lastReceivedMessage: string = '';

    constructor() {
        super();
    }

    public start(channelId, authToken, userId): void {
        this.channelId = channelId;
        this.authToken = authToken;
        this.userId = userId;
        this.running = true;

        this.schedule = window.setInterval(() => this.execute(), 1000);
    }

    protected async execute(): Promise<void> {
        await super.execute();
        const receivedContent: string = this.response![0]['content'];
        const isMe: boolean = this.response![0]['author']['id'] == this.userId;

        this.writeToLog('LOG', 'Waiting for new message');

        if (isMe) return;

        this.lastReceivedMessage = receivedContent;
        let messageToSend = receivedContent;
        const messageToSendChars = messageToSend.split('');

        messageToSendChars.forEach((char: string, index: number): void => {
            if (index % 2) {
                messageToSendChars[index] = char.toUpperCase();
            } else {
                messageToSendChars[index] = char.toLowerCase();
            }
        });

        messageToSend = messageToSendChars.join('');
        const requestOptions = {
            method: 'POST',
            headers: { authorization: this.authToken, 'Content-type': 'application/json' },
            body: JSON.stringify({ content: messageToSend })
        };

        const response = await fetch(
            `https://discord.com/api/v9/channels/${this.channelId}/messages`,
            requestOptions
        );

        if (response.ok) {
            this.writeToLog('LOG', `Sent: ${messageToSend}`);
        }
    }
}
