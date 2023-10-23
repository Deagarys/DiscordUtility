import { Bot } from './Bot';
import OpenAI from 'openai';
import { Message } from '../Dependencies/Message';

export class ChatAiBot extends Bot {
    lastReceivedMessage: string = '';
    apiKey: string = '';
    messages: Message[];
    openai: OpenAI | null = null;
    systemMessage: string = '';
    errorCount: number = 0;

    constructor() {
        super();
        this.messages = [];
    }

    public start(channelId, authToken, userId, systemMessage, apiKey): void {
        this.channelId = channelId;
        this.authToken = authToken;
        this.userId = userId;
        this.apiKey = apiKey;
        this.systemMessage = systemMessage;

        this.setupApi();
        this.running = true;
        this.schedule = window.setInterval(() => this.execute(), 1000);
    }

    public addSystemMessage(content): void {
        this.messages.push({
            role: 'system',
            content: content
        });
        console.log(this.systemMessage);
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

        this.addSystemMessage(this.systemMessage);
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

        const response = await fetch(`https://discord.com/api/v9/channels/${this.channelId}/messages`, requestOptions);

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
