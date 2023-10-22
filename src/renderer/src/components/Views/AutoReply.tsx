import { useEffect, useState } from 'react';
import { AutoReplyBot } from '../Bot/AutoReply';

function AutoReply(args): JSX.Element {
    const [started, setStarted] = useState(false);
    const [channelId, setChannelId] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [userId, setUserId] = useState('');

    const inputs = [
        { id: 'channelId', text: 'Channel Id', setter: setChannelId, getter: channelId },
        { id: 'authToken', text: 'Authorization Token', setter: setAuthToken, getter: authToken },
        { id: 'userId', text: 'User Id', setter: setUserId, getter: userId }
    ];
    const [bot] = useState(new AutoReplyBot());

    useEffect(() => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.has('autoReplySettings', function (error, hasKey) {
            if (error) throw error;

            if (hasKey) {
                storage.get('autoReplySettings', (error, data) => {
                    if (error) throw error;

                    setChannelId(data.channelId);
                    setAuthToken(data.authToken);
                    setUserId(data.userId);
                });
            }
        });
    }, []);

    const start = (): void => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.set('autoReplySettings', {
            channelId: channelId,
            authToken: authToken,
            userId: userId
        });

        if (!started) {
            setStarted(true);
            bot.start(channelId, authToken, userId);
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

export default AutoReply;
