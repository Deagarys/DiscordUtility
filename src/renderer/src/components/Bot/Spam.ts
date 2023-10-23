import { Bot } from './Bot';

export class SpamBot extends Bot {
    constructor() {
        super();
    }

    public start(channelId, authToken, messageToSpam, interval = 1): void {
        this.channelId = channelId;
        this.authToken = authToken;
        this.messageToSpam = messageToSpam;
        this.interval = interval;
        this.running = true;

        this.schedule = window.setInterval(() => this.execute(), this.interval * 1000);
    }

    protected async execute(): Promise<void> {
        await super.execute();
        const requestOptions = {
            method: 'POST',
            headers: { authorization: this.authToken, 'Content-type': 'application/json' },
            body: JSON.stringify({ content: this.messageToSpam })
        };

        const response = await fetch(
            `https://discord.com/api/v9/channels/${this.channelId}/messages`,
            requestOptions
        );

        if (response.ok) {
            this.writeToLog('LOG', `Sent: ${this.messageToSpam}`);
        }
    }
}
