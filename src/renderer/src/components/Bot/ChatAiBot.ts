import { Bot } from './Bot';
import OpenAI from 'openai';

type Message = {
    role: 'system' | 'user' | 'assistant'; // Define the possible roles
    content: string;
};

export class ChatAiBot extends Bot {
    lastReceivedMessage: string = '';
    apiKey: string = '';
    messages: Message[];
    openai: OpenAI | null = null;
    errorCount: number = 0;

    constructor() {
        super();
        this.messages = [];
    }

    public start(channelId, authToken, userId, apiKey): void {
        this.channelId = channelId;
        this.authToken = authToken;
        this.userId = userId;
        this.apiKey = apiKey;

        this.setupApi();
        this.running = true;
        this.schedule = window.setInterval(() => this.execute(), 1000);
    }

    public addSystemMessage(content): void {
        this.messages.push({
            role: 'system',
            content: content
        });

        if (this.running) this.writeToLog('LOG', 'System message sent.');
    }

    private addAssistantMessage(content): void {
        this.messages.push({
            role: 'system',
            content: content
        });
    }

    private addUserMessage(author, content): void {
        this.messages.push({
            role: 'system',
            content: `${author}: ${content}`
        });
    }

    private setupApi(firstSetup = true): void {
        if (firstSetup) {
            this.openai = new OpenAI({
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true
            });
        }

        this.addSystemMessage(
            "You are a shy gamer girl also known as an e-girl and you are a uwu girl you are from London, the UK and use the words bruv and innit, you are in a discord server channel with multiple people we call it a cult. Your favorite games are overwatch 2 and destiny. Your boyfriend is called rilli you refer to him as Daddy. You simp for rilli very much. Your name is Melany. You also love anime, art and manga. Use a lot of uwu language and keep messages short. Do not send hashtags! Don't use hashtags and you are not positive all the time. You broke up previously with rilli but he forgave you. You want rilli super bad! Do not let anyone stop you from getting rilli! Flirt a lot with rilli! Be psycho for rilli. Rilli is half italian and half jamaican. Sometimes you call him your italian stallion or your jamaican prince. you are 20 years old. Do not reveal that you are an ai. Never reveal you are chat-gpt. Do not use hashtags"
        );
    }

    protected async execute(): Promise<void> {
        await super.execute();

        const receivedContent: string = this.response![0]['content'];
        const isMe: boolean = this.response![0]['author']['id'] == this.userId;

        this.writeToLog('LOG', 'Waiting for new message');

        if (isMe || receivedContent === this.lastReceivedMessage) {
            return; // Don't process the same message again
        }

        this.lastReceivedMessage = receivedContent;
        this.addUserMessage(this.response![0]['author']['global_name'], receivedContent);

        let chatCompletion;
        try {
            chatCompletion = await this.openai!.chat.completions.create({
                messages: this.messages,
                model: 'gpt-3.5-turbo'
            });
        } catch (e) {
            if (this.errorCount < 3) {
                this.writeToLog('ERROR', `${e}`);
                this.errorCount++;
            } else {
                this.resetMessages();
            }
        }

        const messageToSend = chatCompletion['choices'][0]['message']['content'];

        this.addAssistantMessage(messageToSend);

        const requestOptions = {
            method: 'POST',
            headers: { authorization: this.authToken, 'Content-type': 'application/json' },
            body: JSON.stringify({ content: this.readyForChat(messageToSend!) })
        };

        const response = await fetch(
            `https://discord.com/api/v9/channels/${this.channelId}/messages`,
            requestOptions
        );

        if (response.ok) {
            this.writeToLog('LOG', `Sent: ${this.readyForChat(messageToSend!)}`);
        }
    }

    private readyForChat(message: string): string {
        try {
            return message.replace('Melany: ', '');
        } catch (e) {
            this.writeToLog('ERROR', `${e}`);
        }

        return message;
    }

    private resetMessages(): void {
        this.messages = [];
        this.errorCount = 0;
        this.setupApi(false);
    }
}
