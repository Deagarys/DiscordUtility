import { Bot } from './Bot';

export class GifOnKeywordBot extends Bot {
    linkToGif: string = '';
    keywords: string = '';

    constructor() {
        super();
    }

    public start(channelId, authToken, userId, linkToGif, keywords): void {
        this.channelId = channelId;
        this.authToken = authToken;
        this.userId = userId;
        this.linkToGif = linkToGif;
        this.keywords = keywords;
        this.running = true;

        this.schedule = window.setInterval(() => this.execute(), 1000);
    }

    protected async execute(): Promise<void> {
        await super.execute();

        const receivedContent: string = this.response![0]['content'];
        const isMe: boolean = this.response![0]['author']['id'] == this.userId;

        this.writeToLog('LOG', 'Waiting for new message');

        if (isMe) return;
        if (!this.hasKeyword(receivedContent)) {
            this.writeToLog('LOG', 'Message does not contain keyword.');
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { authorization: this.authToken, 'Content-type': 'application/json' },
            body: JSON.stringify({ content: this.linkToGif })
        };

        const response = await fetch(
            `https://discord.com/api/v9/channels/${this.channelId}/messages`,
            requestOptions
        );

        if (response.ok) {
            this.writeToLog('LOG', `Sent: ${this.linkToGif}`);
        }
    }

    private hasKeyword(content): boolean {
        const keywordsArray: string[] = this.keywords.split(',');
        let includes: boolean = false;

        keywordsArray.forEach((keyword) => {
            if (content.includes(keyword)) includes = true;
        });

        return includes;
    }
}
