import { useEffect, useState } from 'react';
import { ChatAiBot } from '../Bot/ChatAiBot';

function ChatBot(args): JSX.Element {
    const [started, setStarted] = useState(false);
    const [channelId, setChannelId] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [userId, setUserId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [initialSystemMessage, setInitialSystemMessage] = useState('');

    const [systemMessage, setSystemMessage] = useState('');

    const inputs = [
        { id: 'channelId', text: 'Channel Id', setter: setChannelId, getter: channelId },
        { id: 'authToken', text: 'Authorization Token', setter: setAuthToken, getter: authToken },
        { id: 'userId', text: 'User Id', setter: setUserId, getter: userId },
        { id: 'systemMessage', text: 'System Message', setter: setInitialSystemMessage, getter: initialSystemMessage },
        { id: 'apiKey', text: 'API Key', setter: setApiKey, getter: apiKey }
    ];
    const [bot] = useState(new ChatAiBot());

    useEffect(() => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.has('chatBotSettings', function (error, hasKey) {
            if (error) throw error;

            if (hasKey) {
                storage.get('chatBotSettings', (error, data) => {
                    if (error) throw error;

                    setChannelId(data.channelId);
                    setAuthToken(data.authToken);
                    setUserId(data.userId);
                    setInitialSystemMessage(data.initialSystemMessage);
                    setApiKey(data.apiKey);
                });
            }
        });
    }, []);

    const start = (): void => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.set('chatBotSettings', {
            channelId: channelId,
            authToken: authToken,
            userId: userId,
            initialSystemMessage: initialSystemMessage,
            apiKey: apiKey
        });

        if (!started) {
            setStarted(true);
            bot.start(channelId, authToken, userId, initialSystemMessage, apiKey);
            args.method();
        }
    };

    const stop = (): void => {
        if (started) {
            setStarted(false);
            bot.stop();
            args.method();
        }
    };

    const sendMessage = (): void => {
        bot.addSystemMessage(systemMessage);
        setSystemMessage('');
    };

    return (
        <div className="view">
            {!started ? (
                inputs.map((input) => (
                    <div key={input.id} className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            id={input.id}
                            placeholder={input.text}
                            value={input.getter}
                            onChange={(e): void => input.setter((e.target as HTMLInputElement).value)}
                        />
                        <label htmlFor={input.id}>{input.text}</label>
                    </div>
                ))
            ) : (
                <div>
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder={'System message'}
                            value={systemMessage}
                            onChange={(e): void => setSystemMessage((e.target as HTMLInputElement).value)}
                        />
                        <label>System message</label>
                    </div>
                    <button type="button" className="btn btn-primary mb-3" onClick={sendMessage}>
                        Send
                    </button>
                    <div className="form-floating">
                        <textarea className="form-control log-box log-box-small" placeholder="Log" id={'logBox'} readOnly={true}></textarea>
                        <label htmlFor="floatingTextarea2">Log</label>
                    </div>
                </div>
            )}

            <button type="button" className="btn btn-primary" onClick={!started ? start : stop}>
                {!started ? 'Start' : 'Stop'}
            </button>
        </div>
    );
}

export default ChatBot;
