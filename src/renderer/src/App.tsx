import Selector from './components/Selector';
import { useState } from 'react';
import Spam from './components/Views/Spam';
import AutoReply from './components/Views/AutoReply';
import GifOnKeyword from './components/Views/GifOnKeyword';
import ChatBot from './components/Views/ChatBot';

function App(): JSX.Element {
    const [currentView, setCurrentView] = useState('spam');
    const [started, setStarted] = useState(false);

    const toggleStarted = (): void => {
        setStarted(!started);
    };

    const changeView = (view: string): void => {
        setCurrentView(view);
    };

    return (
        <div className="container">
            <h1>Discord Utility</h1>
            <Selector method={changeView} disabled={started} />
            {currentView == 'spam' ? <Spam method={toggleStarted} /> : ''}
            {currentView == 'autoReply' ? <AutoReply method={toggleStarted} /> : ''}
            {currentView == 'replyOnKeyword' ? <GifOnKeyword method={toggleStarted} /> : ''}
            {currentView == 'chatBot' ? <ChatBot method={toggleStarted} /> : ''}
        </div>
    );
}

export default App;
