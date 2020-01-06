import React from "react";
import Notify from '../Notify';
import * as PropTypes from 'prop-types';
import {Picker as EmojiPicker} from 'emoji-mart';
import uuid from 'uuid';
import URLMetadata from './URLMetadata';
import * as utils from '../../js/utils';

import './Assets/css/chat.css';
import '../../Assets/fontawesome/css/all.css';
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

        return utils.getTimeAgo(time);
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
                        this.getStatusWithTimestamp() === "online" &&
                        <Notify size={"8"} position={"bottom-right"} color="lawngreen"/>
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
                        this.props.unreadMsgCount > 0 &&
                        <div className="chat-list-item-msg_count">
                            {this.props.unreadMsgCount}
                        </div>
                    }
                </div>
            </div>
        );
    }
}

class ChatListItems extends React.Component {
    static propTypes = {
        list: PropTypes.array,
        currentChatId: PropTypes.number,
        updateCurrentChat: PropTypes.func,
    };

    render() {
        return (
            <div className="chat-list-items">
                {this.props.list.map(listItem =>
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

class MessageDeliveryStatusIcons extends React.Component {
    static propTypes = {
        status: PropTypes.number,
    };

    render() {
        let messageDeliveryStatus = null;
        if (this.props.status === 0) {
            messageDeliveryStatus = <i className="far fa-clock"> </i>;
        } else if (this.props.status === 1) {
            messageDeliveryStatus = <i className="fas fa-check"> </i>
        } else if (this.props.status === 2) {
            messageDeliveryStatus = <i className="fas fa-check-double"> </i>
        }
        return messageDeliveryStatus;
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
                        let message = messages[messages.length - 1];

                        let messageDeliveryStatus = (
                            message.by === 0 &&
                            <div className="chat-message_delivery_status">
                                <MessageDeliveryStatusIcons status={message.read}/>
                            </div>
                        );

                        if (message.type === "text") {
                            return (
                                <span>
                                    {messageDeliveryStatus}
                                    {message.data}
                                </span>
                            );
                        } else if (message.type === "image") {
                            return (
                                <span>
                                    {messageDeliveryStatus}
                                    <i className="far fa-file-image"> </i> image
                                </span>
                            );
                        } else if (message.type === "video") {
                            return (
                                <span>
                                    {messageDeliveryStatus}
                                    <i className="far fa-file-video"> </i> video
                                </span>
                            );
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
                    list={this.getFilteredList()}
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

        return utils.getTimeAgo(time);
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
                        this.getStatusWithTimestamp() === "online" ?
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

        switch (message.type) {
            case 'image': // noinspection JSDeprecatedSymbols
                this.context.showFullScreen(message.data.image, 'image');
                break;
            case 'video': // noinspection JSDeprecatedSymbols
                this.context.showFullScreen(message.data.video, 'video');
                break;
            default:
        }
    };

    getTime = () => {
        const {message: {time}} = this.props;
        return utils.getFormattedTime(time);
    };

    getConvertedMessage = (text) => {
        let textAndLinks = utils.linksSplitter(text);
        let link = null;

        return [textAndLinks.map(item => {
            if (item.type === "link") {
                link = item.word;
                return <a href={item.word}>{item.word}</a>;
            }
            return item.word;
        }), link];
    };

    render() {
        const {message} = this.props;

        let data = null;

        switch (message.type) {
            case "text":
                let linkAndMessage = this.getConvertedMessage(message.data);
                data = (
                    <div>
                        {
                            !!linkAndMessage[1] &&
                            <div className="chat-url_metadata" onClick={this.showFullScreen}>
                                <URLMetadata url={linkAndMessage[1]}/>
                            </div>
                        }
                        {linkAndMessage[0]}
                    </div>
                );
                break;
            case "image":
                data = (
                    <div>
                        <div className="chat-line-image" onClick={this.showFullScreen}>
                            <img src={message.data.image} alt=""/>
                        </div>
                        {this.getConvertedMessage(message.data.caption)}
                    </div>
                );
                break;
            case "video":
                data = (
                    <div>
                        <div className="chat-line-video" onClick={this.showFullScreen}>
                            <img src={message.data.thumbnail} alt=""/>
                            <div className="chat-video-play-icon">
                                <i className="fa fa-play"> </i>
                            </div>
                        </div>
                        {this.getConvertedMessage(message.data.caption)}
                    </div>
                );
                break;
            default:
        }

        let message_by = message.by === 0 ? "me" : "you";

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
                            message.by === 0 &&
                            <div className="chat-message_delivery_status">
                                <MessageDeliveryStatusIcons status={message.read}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class DateMarker extends React.Component {
    static propTypes = {
        date: PropTypes.number,
    };

    render() {
        return (
            <div className="chat-line">
                <div className="chat-date_marker">
                    {utils.getFormattedDate(this.props.date)}
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
        if (!utils.deepCompare(prevProps, this.props)) {
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

        return messages.reduce((accumulator, currentMessage) => {
            let {messages, currentDate} = accumulator;
            let newDate = new Date(currentMessage.time);

            if (!currentMessage.time
                || (currentDate.getFullYear() === newDate.getFullYear()
                    && currentDate.getMonth() === newDate.getMonth()
                    && currentDate.getDate() === newDate.getDate())) {
            } else {
                messages.push({
                    dateMarker: currentMessage.time,
                });
                accumulator.currentDate = newDate;
            }
            accumulator.messages.push(currentMessage);

            return accumulator;
        }, {
            messages: [],
            currentDate: new Date(0),
        }).messages;
    };

    render() {
        const messages = this.createMessagesWithDateObjects();

        return (
            <div className="chat-content" onScroll={(event) => {
                console.log(event.target.scrollTop);
            }}>
                {
                    this.props.hasPreviousChat &&
                    <div className="chat-line">
                        <div className="chat-load_previous" onClick={this.loadPreviousChat}>
                            Load Previous
                        </div>
                    </div>
                }
                {
                    messages.map(message => {
                        if (message.unreadPointer) {
                            return (
                                <div
                                    key="unreadPointer"
                                    className="chat-line"
                                >
                                    <div
                                        className="chat-unread_messages"
                                        ref={(div) => {
                                            this.unreadPointer = div;
                                        }}
                                    >
                                        Unread Messages
                                    </div>
                                </div>
                            )
                        }
                        if (message.dateMarker) {
                            return (
                                <DateMarker
                                    key={`date-${message.dateMarker}`}
                                    date={message.dateMarker}
                                />
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
                    this.state.showEmojiPanel &&
                    <EmojiPicker
                        set='google'
                        style={{
                            position: "absolute",
                            bottom: "30px",
                            right: "0",
                        }}
                        onSelect={onEmojiSelect}
                    />
                }
            </span>
        );
    }
}

class MessageInputWithURLMetadata extends React.Component {
    static propTypes = {
        reference: PropTypes.func,
        message: PropTypes.string,
        onChange: PropTypes.func,
        link: PropTypes.string,
    };

    render() {
        return (
            <div className="chat-message-input">
                <input
                    type="text"
                    onChange={this.props.onChange}
                    value={this.props.message}
                    ref={(inp) => this.props.reference(inp)}
                    className="message_input"
                />
                {
                    !!this.props.link &&
                    <div className="chat-input-link-metadata">
                        <URLMetadata key={this.props.link} url={this.props.link}/>
                    </div>
                }
            </div>
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
        link: null,
    };

    getLink = text => {
        let link = utils.linksSplitter(text).lastFind(item => item.type === "link");
        return link ? link.word : null;
    };

    onMessageInput = ({target: {value: message}}) => {
        this.setState({
            message,
            type: "text",
            link: this.getLink(message),
        });
    };

    onMessageSubmit = (event) => {
        event.preventDefault();
        if (this.state.message.match(utils.onlySpacesRegex)) {
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
            link: null,
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
                    <MessageInputWithURLMetadata
                        message={this.state.message}
                        reference={(inp) => this.messageInput = inp}
                        onChange={this.onMessageInput}
                        link={this.state.link}
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
                    !!currentChatId &&
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
                    </span>
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

    render() {
        return (
            <div className="chat">
                <ChatList
                    chat={this.props.chat}
                    updateCurrentChat={this.props.updateCurrentChat}
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