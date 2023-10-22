import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import './assets/main.css';
import App from './App';
import discord from '../../../resources/discord.png';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <div className="drag-box">
            <img src={discord} alt="" className={'logo'} />
            <span className="title">Discord Utility</span>
        </div>
        <App />
    </React.StrictMode>
);
