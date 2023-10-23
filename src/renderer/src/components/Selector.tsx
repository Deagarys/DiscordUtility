import { useState } from 'react';

function Selector(args): JSX.Element {
    const options = [
        { value: 'spam', text: 'Spam' },
        { value: 'autoReply', text: 'Auto Reply' },
        { value: 'chatBot', text: 'Chat Bot' },
        { value: 'replyOnKeyword', text: 'Text/Gif on keyword' }
    ];
    const [view, setView] = useState(options[0].value);

    const handleChange = (event): void => {
        setView(event.target.value);
        args.method(event.target.value);
    };

    return (
        <select
            className={'form-select form-control'}
            value={view}
            onChange={handleChange}
            disabled={args.disabled}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.text}
                </option>
            ))}
        </select>
    );
}

export default Selector;
