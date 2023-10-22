export class Bot {
    channelId: string = '';
    authToken: string = '';
    userId: string = '';
    messageToSpam: string = '';
    interval: number = 0;
    running: boolean = false;
    schedule: number = 0;
    response: Response | null = null;

    public start(channelId, authToken, userId, messageToSpam, interval = 1): void {
        this.channelId = channelId;
        this.authToken = authToken;
        this.userId = userId;
        this.messageToSpam = messageToSpam;
        this.interval = interval;
        this.running = true;

        this.schedule = window.setInterval(() => this.execute(), 1000);
    }

    protected async execute(): Promise<void> {
        if (!this.running) return;

        this.response = await this.retrieveMessages();
    }

    public stop(): void {
        this.running = false;
        window.clearInterval(this.schedule);
    }

    protected async retrieveMessages(): Promise<Response> {
        const requestOptions = {
            method: 'GET',
            headers: { authorization: this.authToken }
        };

        const response = await fetch(
            `https://discord.com/api/v8/channels/${this.channelId}/messages`,
            requestOptions
        );
        return await response.json();
    }

    protected writeToLog(type: string, message: string): void {
        const logBox = document.getElementById('logBox');
        console.log(logBox);
        logBox!.prepend(`${new Date().toLocaleTimeString()} - ${type}: ${message} \n`);
    }
}
