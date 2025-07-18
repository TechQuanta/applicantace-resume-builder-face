// src/components/MessageDisplay.jsx
import React from 'react';
import '../Style/MessageDisplay.css'; // You'll need to create this CSS file

const MessageDisplay = ({ message }) => {
    if (!message.text) return null;
    return (
        <div className={`message-display message-${message.type}`}>
            {message.text}
        </div>
    );
};

export default MessageDisplay;