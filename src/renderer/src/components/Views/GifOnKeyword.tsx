import { useEffect, useState } from 'react';
import { GifOnKeywordBot } from '../Bot/GifOnKeywordBot';

function GifOnKeyword(args): JSX.Element {
    const [started, setStarted] = useState(false);
    const [channelId, setChannelId] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [userId, setUserId] = useState('');
    const [linkToGif, setLinkToGif] = useState('');
    const [keywords, setKeywords] = useState('');

    const inputs = [
        { id: 'channelId', text: 'Channel Id', setter: setChannelId, getter: channelId },
        { id: 'authToken', text: 'Authorization Token', setter: setAuthToken, getter: authToken },
        { id: 'userId', text: 'User Id', setter: setUserId, getter: userId },
        { id: 'linkToGif', text: 'Link to gif', setter: setLinkToGif, getter: linkToGif },
        { id: 'keywords', text: 'Keywords (separate by ,)', setter: setKeywords, getter: keywords }
    ];
    const [bot] = useState(new GifOnKeywordBot());

    useEffect(() => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.has('gifOnKeywordSettings', function (error, hasKey) {
            if (error) throw error;

            if (hasKey) {
                storage.get('gifOnKeywordSettings', (error, data) => {
                    if (error) throw error;

                    setChannelId(data.channelId);
                    setAuthToken(data.authToken);
                    setUserId(data.userId);
                    setKeywords(data.keywords);
                    setLinkToGif(data.linkToGif);
                });
            }
        });
    }, []);

    const start = (): void => {
        const os = require('os');
        const storage = require('electron-json-storage');

        storage.setDataPath(os.tmpdir());
        storage.set('gifOnKeywordSettings', {
            channelId: channelId,
            authToken: authToken,
            userId: userId,
            linkToGif: linkToGif,
            keywords: keywords
        });

        if (!started) {
            setStarted(true);
            bot.start(channelId, authToken, userId, linkToGif, keywords);
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

export default GifOnKeyword;
