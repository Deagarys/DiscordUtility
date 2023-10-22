import { useEffect, useState } from 'react';
import { SpamBot } from '../Bot/Spam';

function Spam(args): JSX.Element {
    const [started, setStarted] = useState(false);
    const [channelId, setChannelId] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [messageToSpam, setMessageToSpam] = useState('');
    const [interval, setInterval] = useState('');

    const inputs = [
        { id: 'channelId', text: 'Channel Id', setter: setChannelId, getter: channelId },
        { id: 'authToken', text: 'Authorization Token', setter: setAuthToken, getter: authToken },
        {
            id: 'messageToSpam',
            text: 'Message to Spam',
            setter: setMessageToSpam,
            getter: messageToSpam
        },
        { id: 'interval', text: 'Interval in Seconds', setter: setInterval, getter: interval }
    ];
    const [bot] = useState(new SpamBot());

    useEffect(() => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.has('spamSettings', function (error, hasKey) {
            if (error) throw error;

            if (hasKey) {
                storage.get('spamSettings', (error, data) => {
                    if (error) throw error;

                    setChannelId(data.channelId);
                    setAuthToken(data.authToken);
                    setMessageToSpam(data.messageToSpam);
                    setInterval(data.interval);
                });
            }
        });
    }, []);

    const start = (): void => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.set('spamSettings', {
            channelId: channelId,
            authToken: authToken,
            messageToSpam: messageToSpam,
            interval: interval
        });

        if (!started) {
            setStarted(true);
            bot.start(channelId, authToken, messageToSpam, parseInt(interval));
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
                            onChange={(e): void =>
                                input.setter((e.target as HTMLInputElement).value)
                            }
                        />
                        <label htmlFor={input.id}>{input.text}</label>
                    </div>
                ))
            ) : (
                <div className="form-floating">
                    <textarea
                        className="form-control log-box"
                        placeholder="Log"
                        id={'logBox'}
                        readOnly={true}
                    ></textarea>
                    <label htmlFor="floatingTextarea2">Log</label>
                </div>
            )}

            <button type="button" className="btn btn-primary" onClick={!started ? start : stop}>
                {!started ? 'Start' : 'Stop'}
            </button>
        </div>
    );
}

export default Spam;
