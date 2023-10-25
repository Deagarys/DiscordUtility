import Selector from './components/Selector';
import { useState } from 'react';
import Spam from './components/Views/Spam';
import AutoReply from './components/Views/AutoReply';
import GifOnKeyword from './components/Views/GifOnKeyword';
import ChatBot from './components/Views/ChatBot';
const { ipcRenderer } = require('electron');

function App(): JSX.Element {
    const [currentView, setCurrentView] = useState('spam');
    const [started, setStarted] = useState(false);
    const [updateComplete, setUpdateComplete] = useState(process.env.NODE_ENV === 'development');
    const [updateText, setUpdateText] = useState('Checking for update...');

    const toggleStarted = (): void => {
        setStarted(!started);
    };

    const changeView = (view: string): void => {
        setCurrentView(view);
    };

    ipcRenderer.on('message', (event, text) => {
        setUpdateText(text);
        console.log(`Message: ${text}`);
        console.log(`Event: ${event}`);
    });

    ipcRenderer.on('updateComplete', () => {
        setUpdateComplete(true);
    });

    console.log(process.env.NODE_ENV);

    return (
        <div className="container">
            {updateComplete ? (
                <div>
                    <h1>Discord Utility</h1>
                    <Selector method={changeView} disabled={started} />
                    {currentView == 'spam' ? <Spam method={toggleStarted} /> : ''}
                    {currentView == 'autoReply' ? <AutoReply method={toggleStarted} /> : ''}
                    {currentView == 'replyOnKeyword' ? <GifOnKeyword method={toggleStarted} /> : ''}
                    {currentView == 'chatBot' ? <ChatBot method={toggleStarted} /> : ''}
                </div>
            ) : (
                <div className={'updateDiv'}>
                    <h1>{updateText}</h1>
                </div>
            )}
        </div>
    );
}

export default App;
