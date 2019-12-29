import React from "react";
import Notify from './Notify';
import PropTypes from 'prop-types';
import {Picker as EmojiPicker} from 'emoji-mart';
import uuid from 'uuid';

import '../Assets/css/chat.css';
import '../Assets/fontawesome/css/all.css';
import 'emoji-mart/css/emoji-mart.css';


class ChatSearchBar extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func,
    };

    onSearchInput = ({target: {value: text}}) => {
        this.props.onSearch(text);
    };

    render() {
        return (
            <div className="chat-search-bar">
                <div className="chat-search-wrapper">
                    <div className="chat-search-icon">
                        <i className="fa fa-search"> </i>
                    </div>
                    <div className="chat-search-input">
                        <input type="text" onChange={this.onSearchInput}/>
                    </div>
                </div>
            </div>
        );
    }
}

class ChatListItem extends React.Component {
    static propTypes = {
        avatar: PropTypes.string,
        name: PropTypes.string,
        desc: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),
        time: PropTypes.number,
        unreadMsgCount: PropTypes.number,
        currentChatId: PropTypes.number,
        updateCurrentChat: PropTypes.func,
    };

    componentDidMount() {
        this.interval = setInterval(() => {
            this.forceUpdate();
        }, 2500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getStatusWithTimestamp = () => {
        const {time} = this.props;

        return (new Date(time)).toDateString();
    };

    getOnlineStatus = () => {
        const {time} = this.props;

        return Date.now() - time < 5000;
    };

    render() {
        let isThisCurrentChat = "";
        if (this.props.currentChatId === this.props.id) {
            isThisCurrentChat = "current";
        }

        return (
            <div
                className={`chat-list-item ${isThisCurrentChat}`}
                onClick={this.props.updateCurrentChat}
            >
                <div className="chat-list-item-image">
                    <img src={this.props.avatar} alt=""/>
                    {
                        this.getOnlineStatus() ?
                            <Notify size={"8"} position={"bottom-right"} color="lawngreen"/> : null
                    }
                </div>
                <div className="chat-list-item-info">
                    <div className="chat-list-item-name">
                        {this.props.name}
                    </div>
                    <div className="chat-list-item-desc">
                        {this.props.desc}
                    </div>
                </div>
                <div className="chat-list-item-details">
                    <div className="chat-list-item-time">
                        {this.getStatusWithTimestamp()}
                    </div>
                    {
                        this.props.unreadMsgCount > 0 ?
                            <div className="chat-list-item-msg_count">
                                {this.props.unreadMsgCount}
                            </div> : null
                    }
                </div>
            </div>
        );
    }
}

class ChatListItems extends React.Component {
    static propTypes = {
        filteredList: PropTypes.array,
        currentChatId: PropTypes.number,
        updateCurrentChat: PropTypes.func,
    };

    render() {
        return (
            <div className="chat-list-items">
                {this.props.filteredList.map(listItem =>
                    <ChatListItem
                        key={listItem.id}
                        id={listItem.id}
                        avatar={listItem.avatar}
                        desc={listItem.desc}
                        name={listItem.name}
                        time={listItem.lastSeen}
                        unreadMsgCount={listItem.messageCount}
                        currentChatId={this.props.currentChatId}
                        updateCurrentChat={() => {
                            this.props.updateCurrentChat(listItem.id);
                        }}
                    />
                )}
            </div>
        );
    }
}

class ChatList extends React.Component {
    static propTypes = {
        chat: PropTypes.object,
        updateCurrentChat: PropTypes.func,
    };

    state = {
        search: "",
    };

    onSearch = (search) => {
        this.setState({search});
    };

    getFilteredList = () => {
        return this.props.chat.list
            .filter(listItem => listItem.name.includes(this.state.search))
            .map(listItem => {
                return {
                    avatar: listItem.avatar,
                    name: listItem.name,
                    id: listItem.id,
                    messageCount: listItem.unread,
                    lastSeen: listItem.lastSeen,
                    desc: (() => {
                        let {messages} = listItem;

                        if (messages[messages.length - 1].type === "text") {
                            return `${messages[messages.length - 1].data}`;
                        } else if (messages[messages.length - 1].type === "image") {
                            return <span><i className="far fa-file-image"> </i> image</span>;
                        } else if (messages[messages.length - 1].type === "video") {
                            return <span><i className="far fa-file-video"> </i> video</span>;
                        }
                    })(),
                };
            });
    };

    render() {
        return (
            <div className="chat-list">
                <ChatSearchBar
                    onSearch={this.onSearch}
                />
                <ChatListItems
                    filteredList={this.getFilteredList()}
                    currentChatId={this.props.chat.currentChatId}
                    updateCurrentChat={this.props.updateCurrentChat}
                />
            </div>
        )
    }
}

class ChatHeader extends React.Component {
    static propTypes = {
        avatar: PropTypes.string,
        name: PropTypes.string,
        time: PropTypes.number,
        closeCurrentChat: PropTypes.func,
    };

    componentDidMount() {
        this.interval = setInterval(() => {
            this.forceUpdate();
        }, 2500);
    }

    getStatusWithTimestamp = () => {
        const {time} = this.props;

        return (new Date(time)).toDateString();
    };

    getOnlineStatus = () => {
        const {time} = this.props;

        return Date.now() - time < 5000;
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div className="chat-header">
                <div className="chat-list-item-image">
                    <img src={this.props.avatar} alt=""/>
                    {
                        this.getOnlineStatus() ?
                            <Notify size={"8"} position={"bottom-right"} color="lawngreen"/> : null
                    }
                </div>
                <div className="chat-list-item-info">
                    <div className="chat-list-item-name">
                        {this.props.name}
                    </div>
                    <div className="chat-list-item-desc">
                        {this.getStatusWithTimestamp()}
                    </div>
                </div>
                <div className="chat-close" onClick={this.props.closeCurrentChat}>
                    <i className="fas fa-times"> </i>
                </div>
            </div>
        );
    }
}

class ChatLine extends React.Component {
    static propTypes = {
        message: PropTypes.object,
        chatType: PropTypes.string,
    };

    static contextTypes = {
        showFullScreen: PropTypes.func,
    };

    static defaultProps = {
        by: 0,
    };

    showFullScreen = () => {
        const {message} = this.props;

        if (message.type === 'image') {
            this.context.showFullScreen(message.data.image, 'image');
        } else if (message.type === 'video') {
            this.context.showFullScreen(message.data.video, 'video');
        }
    };

    getTime = () => {
        const {message: {time}} = this.props;
        let currentTime = new Date(time);

        return `${currentTime.getHours()}:${currentTime.getMinutes()}`;
    };

    render() {
        const {message} = this.props;

        let data = null;

        if (message.type === "text") {
            data = message.data;
        } else if (message.type === "image") {
            data = (
                <div>
                    <div className="chat-line-image" onClick={this.showFullScreen}>
                        <img src={message.data.image} alt=""/>
                    </div>
                    {message.data.caption}
                </div>
            );
        } else if (message.type === "video") {
            data = (
                <div>
                    <div className="chat-line-video" onClick={this.showFullScreen}>
                        <img src={message.data.thumbnail} alt=""/>
                        <div className="chat-video-play-icon">
                            <i className="fa fa-play"> </i>
                        </div>
                    </div>
                    {message.data.caption}
                </div>
            );
        }

        let message_by = message.by === 0 ? "me" : "you";

        let messageDeliveryStatus = null;

        if (message.read === 0) {
            messageDeliveryStatus = <i className="far fa-clock"> </i>;
        } else if (message.read === 1) {
            messageDeliveryStatus = <i className="fas fa-check"> </i>
        } else if (message.read === 2) {
            messageDeliveryStatus = <i className="fas fa-check-double"> </i>
        }

        return (
            <div className="chat-line">
                <div className={`chat-line-wrapper ${message_by}`}>
                    {
                        this.props.chatType === "group" && message.by !== 0 &&
                        <div className={`chat-message_by ${message_by}`}>
                            {message.by}
                        </div>
                    }
                    {data}
                    <div className={`chat-message-time ${message_by}`}>
                        {this.getTime()}
                        {
                            message_by === "me" &&
                            <div className="chat-message_delivery_status">
                                {messageDeliveryStatus}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );

    }
}

class ChatContent extends React.Component {
    static propTypes = {
        messages: PropTypes.array,
        removeUnreadPointer: PropTypes.func,
        currentChatId: PropTypes.number,
        loadPreviousChat: PropTypes.func,
        hasPreviousChat: PropTypes.bool,
        chatType: PropTypes.string,
    };

    componentDidMount() {
        setTimeout(() => {
            if (this.unreadPointer) {
                this.unreadPointer.scrollIntoView({
                    behavior: "smooth"
                });
            } else {
                this.endPointer.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }, 1000 / 60);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.previousChatUpdate) {
            setTimeout(() => {
                if (this.unreadPointer) {
                    this.unreadPointer.scrollIntoView({
                        behavior: "smooth"
                    });
                } else {
                    this.endPointer.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }, 1000 / 60);
        }
        this.previousChatUpdate = false;
    }

    UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
        if (this.unreadPointer) {
            this.props.removeUnreadPointer(this.props.currentChatId);
        }
    }

    componentWillUnmount() {
        if (this.unreadPointer) {
            this.props.removeUnreadPointer(this.props.currentChatId);
        }
    }

    loadPreviousChat = () => {
        this.previousChatUpdate = true;
        this.props.loadPreviousChat(this.props.currentChatId);
    };

    createMessagesWithDateObjects = () => {
        let {messages} = this.props;

        let returnMessages = [];
        let currentDate = 0;

        for (let i = 0; i < messages.length; i++) {
            let newDate = new Date(messages[i].time);

            if (!messages[i].time
                || (currentDate !== 0
                    && currentDate.getFullYear() === newDate.getFullYear()
                    && currentDate.getMonth() === newDate.getMonth()
                    && currentDate.getDate() === newDate.getDate())) {
            } else {
                returnMessages.push({
                    dateMarker: messages[i].time,
                });
                currentDate = newDate;
            }
            returnMessages.push(messages[i]);
        }

        return returnMessages;
    };

    getDate = (time) => {
        let currentTime = new Date(time);

        return `${currentTime.getDate()}/${currentTime.getMonth()}/${currentTime.getFullYear()}`;
    };

    render() {
        const messages = this.createMessagesWithDateObjects();

        return (
            <div className="chat-content">
                {
                    this.props.hasPreviousChat &&
                    <div className="chat-load_previous" onClick={this.loadPreviousChat}>
                        Load Previous
                    </div>
                }
                {
                    messages.map(message => {
                        if (message.unreadPointer) {
                            return (
                                <div
                                    key="unreadPointer"
                                    className="chat-unread_messages"
                                    ref={(div) => {
                                        this.unreadPointer = div;
                                    }}
                                >
                                    Unread Messages
                                </div>
                            )
                        } else if (message.dateMarker) {
                            return (
                                <div
                                    key={`Date-${message.dateMarker}`}
                                    className="chat-date_marker"
                                >
                                    {this.getDate(message.dateMarker)}
                                </div>
                            )
                        }
                        return (
                            <ChatLine
                                message={message}
                                key={message.id}
                                chatType={this.props.chatType}
                            />
                        );
                    })
                }
                <div
                    ref={(div) => {
                        this.endPointer = div;
                    }}
                >
                </div>
            </div>
        );
    }
}

class EmojiPanelButton extends React.Component {
    static propTypes = {
        onEmojiSelect: PropTypes.func,
    };

    state = {
        showEmojiPanel: false,
    };

    toggleEmojiPanel = () => {
        this.setState({
            showEmojiPanel: !this.state.showEmojiPanel,
        });
    };

    render() {
        const {onEmojiSelect, ...buttonProps} = this.props;
        return (
            <span style={{position: "relative"}}>
            <button className="emoji" onClick={this.toggleEmojiPanel} {...buttonProps}>
                {this.props.children}
            </button>
                {
                    this.state.showEmojiPanel ?
                        <EmojiPicker
                            set='google'
                            style={{
                                position: "absolute",
                                bottom: "30px",
                                right: "0",
                            }}
                            onSelect={onEmojiSelect}
                        /> : null
                }
            </span>
        );
    }
}

class ChatInput extends React.Component {
    static propTypes = {
        updateMessage: PropTypes.func,
    };

    state = {
        message: "",
        type: "",
    };

    onMessageInput = ({target: {value: message}}) => {
        this.setState({
            message,
            type: "text",
        });
    };

    onMessageSubmit = (event) => {
        event.preventDefault();
        if (this.state.message === "") {
            return;
        }
        const {updateMessage} = this.props;

        let message = {
            data: this.state.message,
            type: this.state.type,
            id: uuid.v4(),
            by: 0,
            time: Date.now(),
            read: 0,
        };

        this.setState({
            message: "",
            type: "",
        });

        updateMessage(message);
    };

    emojiUpdate = (emoji) => {
        this.setState({
            message: this.state.message + emoji.native,
            type: "text",
        });
        this.messageInput.focus();
    };

    render() {
        return (
            <form onSubmit={this.onMessageSubmit}>
                <div className="chat-input">
                    <input
                        type="text"
                        onChange={this.onMessageInput}
                        value={this.state.message}
                        ref={(inp) => this.messageInput = inp}
                    />
                    <button type="submit" className="button"><i className="far fa-paper-plane"> </i></button>
                    <button type="button" className="button"><i className="fas fa-paperclip"> </i></button>
                    <EmojiPanelButton type="button" className="button" onEmojiSelect={this.emojiUpdate}>
                        <i className="far fa-smile"> </i>
                    </EmojiPanelButton>
                </div>
            </form>
        );
    }
}

class ChatBody extends React.Component {
    static propTypes = {
        chat: PropTypes.object,
        updateMessage: PropTypes.func,
        closeCurrentChat: PropTypes.func,
        removeUnreadPointer: PropTypes.func,
        loadPreviousChat: PropTypes.func,
    };

    updateMessage = (message) => {
        let {currentChatId} = this.props.chat;

        this.props.updateMessage(currentChatId, message);
    };


    render() {
        const {currentChatId} = this.props.chat;
        const currentChat = this.props.chat.list.find(listItem => listItem.id === currentChatId);

        return (
            <div className="chat-body">
                {
                    currentChatId ?
                        <span>
                        <ChatHeader
                            name={currentChat.name}
                            time={currentChat.lastSeen}
                            avatar={currentChat.avatar}
                            closeCurrentChat={this.props.closeCurrentChat}
                        />
                        <ChatContent
                            hasPreviousChat={currentChat.hasPreviousChat}
                            currentChatId={currentChatId}
                            messages={currentChat.messages}
                            removeUnreadPointer={this.props.removeUnreadPointer}
                            loadPreviousChat={this.props.loadPreviousChat}
                            chatType={currentChat.chatType}
                        />
                        <ChatInput
                            updateMessage={this.updateMessage}
                        />
                    </span> : null
                }
            </div>
        )
    }
}

export default class Chat extends React.Component {
    static propTypes = {
        chat: PropTypes.object.isRequired,
        updateCurrentChat: PropTypes.func,
        updateMessage: PropTypes.func,
        closeCurrentChat: PropTypes.func,
        removeUnreadPointer: PropTypes.func,
        loadPreviousChat: PropTypes.func,
    };

    updateCurrentChat = (id) => {
        this.props.updateCurrentChat(id);
    };

    render() {
        return (
            <div className="chat">
                <ChatList
                    chat={this.props.chat}
                    updateCurrentChat={this.updateCurrentChat}
                />
                <ChatBody
                    chat={this.props.chat}
                    updateMessage={this.props.updateMessage}
                    closeCurrentChat={this.props.closeCurrentChat}
                    removeUnreadPointer={this.props.removeUnreadPointer}
                    loadPreviousChat={this.props.loadPreviousChat}
                />
            </div>
        );
    }
}