import React from "react";
import Notify from '../Notify';
import * as PropTypes from 'prop-types';
import {Picker as EmojiPicker} from 'emoji-mart';
import uuid from 'uuid';
import URLMetadata from './URLMetadata';
import * as utils from '../../js/utils';
import VideoThumbnail from 'react-video-thumbnail';
import download from 'downloadjs';

import './Assets/css/chat.css';
import '../../Assets/fontawesome/css/all.css';
import 'emoji-mart/css/emoji-mart.css';
import Loading from "../Loading";


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
        currentChatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
                        isThisCurrentChat !== "current" &&
                        this.props.unreadMsgCount > 0 &&
                        <div className="chat-list-item-msg_count">
                            {this.props.unreadMsgCount}
                        </div>
                    }
                    {
                        isThisCurrentChat !== "current" &&
                        this.props.unreadMsgCount === -1 &&
                        <div className="chat-list-item-msg_count">

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
        currentChatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        updateCurrentChat: PropTypes.func,
        loadingList: PropTypes.bool,
    };

    render() {
        return (
            <div className="chat-list-items">
                {this.props.loadingList && (
                    <div className="chat-list-item loading">
                        <Loading/>
                    </div>
                )}
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
        } else if (this.props.status === 3) {
            messageDeliveryStatus = <i style={{color: "#b0ee9f"}} className="fas fa-check-double"> </i>
        }
        return messageDeliveryStatus;
    }
}

class ChatList extends React.Component {
    static propTypes = {
        loadingList: PropTypes.bool,
        chat: PropTypes.object,
        updateCurrentChat: PropTypes.func,
        searchPerson: PropTypes.func,
        more: PropTypes.bool,
        noLoadingList: PropTypes.func,
    };

    state = {
        search: "",
    };

    onSearch = (search) => {
        this.setState({search});
    };

    getFilteredList = () => {
        const filteredList = this.props.chat.list
            .sort((AListItem, BListItem) => {
                return BListItem.latestMessageTime - AListItem.latestMessageTime;
            })
            .filter(listItem => {
                if (this.state.search.length !== 0) {
                    return listItem.name.toLowerCase().includes(this.state.search.toLowerCase());
                }
                return listItem.chatType === "group" || listItem.messages.length !== 0;
            })
            .map(listItem => {
                return {
                    avatar: listItem.avatar,
                    name: listItem.name,
                    id: listItem.id,
                    messageCount: listItem.unread,
                    lastSeen: listItem.lastSeen,
                    desc: (() => {
                        let {messages} = listItem;
                        if (messages.length > 0) {
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
                            } else if (message.type === "document") {
                                return (
                                    <span>
                                    {messageDeliveryStatus}
                                        <i className="far fa-file"> </i> document
                                </span>
                                );
                            }
                        }
                        return "";
                    })(),
                };
            });
        if (this.state.search.length > 0 && filteredList.length === 0 && !this.props.loadingList && this.props.more) {
            this.props.searchPerson(this.state.search);
        }
        if (this.props.loadingList && this.state.search.length === 0) {
            this.props.noLoadingList();
        }
        return filteredList;
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
                    loadingList={this.props.loadingList}
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
        onLoad: PropTypes.func,
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

    downloadFile = () => {
        const {message} = this.props;

        download(message.data.file);
    };

    getTime = () => {
        const {message: {time}} = this.props;
        return utils.getFormattedTime(time);
    };

    getConvertedMessage = (text) => {
        let textAndLinks = utils.linksSplitter(text);
        let link = null;

        return [textAndLinks.map((item, i) => {
            if (item.type === "link") {
                link = item.word;
                return <a key={i} href={item.word}>{item.word}</a>;
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
                            <img src={message.data.image} alt="" onLoad={this.props.onLoad}/>
                        </div>
                        {this.getConvertedMessage(message.data.caption)}
                    </div>
                );
                break;
            case "video":
                data = (
                    <div>
                        <div className="chat-line-video" onClick={this.showFullScreen}>
                            <VideoThumbnail videoUrl={message.data.video} onLoad={this.props.onLoad}/>
                            <div className="chat-video-play-icon">
                                <i className="fa fa-play"> </i>
                            </div>
                        </div>
                        {this.getConvertedMessage(message.data.caption)}
                    </div>
                );
                break;
            case "document":
                data = (
                    <div>
                        <div className="chat-line-document" onClick={this.downloadFile}>
                            <i className="fa fa-file"> </i>
                            <div className="chat-line-document-name">
                                {message.data.file.replace(/^.*[\\/]/, '')}
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

// class ChatNewMessagesIcon extends React.Component {
//     static propTypes = {
//         unread: PropTypes.number,
//     };
//
//     render() {
//         return (
//             <div className="chat-new-message-icon">
//                 <i className="fas fa-chevron-down"> </i>
//                 {
//                     this.props.unread > 0 &&
//                     <div className="chat-new-message-number-icon">
//                         {this.props.unread}
//                     </div>
//                 }
//             </div>
//         );
//     }
// }

class ChatContent extends React.Component {
    static propTypes = {
        messages: PropTypes.array,
        removeUnreadPointer: PropTypes.func,
        currentChatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        loadPreviousChat: PropTypes.func,
        hasPreviousChat: PropTypes.bool,
        chatType: PropTypes.string,
        updateScrollerPosition: PropTypes.func,
        scrollerPosition: PropTypes.number,
        newMessageByMe: PropTypes.bool,
        cleanNewMessageByMe: PropTypes.func,
        newMessage: PropTypes.bool,
        unreadMsgCount: PropTypes.number,
        loadingMessages: PropTypes.bool,
        notify: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.autoScroll = false;
    }

    componentDidMount() {
        if (this.unreadPointer) {
            this.unreadPointer.scrollIntoView();
        } else {
            let {scrollerPosition} = this.props;
            if (scrollerPosition) {
                console.log("ScrollerPositionThere");
                this.chatContent.scrollTop = scrollerPosition;
                console.log(scrollerPosition);
            } else {
                this.endPointer.scrollIntoView();
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.previousChatUpdate && !this.props.loadingMessages) {
            this.chatContent.scrollTop = this.chatContent.scrollHeight - snapshot.previousScrollHeight;
            this.previousChatUpdate = false;
            if (this.unreadPointer) {
                this.props.removeUnreadPointer(this.props.currentChatId);
            }
        } else if (this.props.newMessageByMe) {
            if (snapshot.previousAutoScroll) {
                this.endPointer.scrollIntoView({
                    behavior: "smooth",
                });
                this.autoScroll = true;
            } else {
                this.endPointer.scrollIntoView();
            }
            this.props.cleanNewMessageByMe();
            if (this.unreadPointer) {
                this.props.removeUnreadPointer(this.props.currentChatId);
            }
        }
        if (snapshot.previousAutoScroll) {
            this.endPointer.scrollIntoView({
                behavior: "smooth",
            });
            this.autoScroll = true;
        }
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        console.log("autoScroll: ", this.autoScroll);
        return {
            previousScrollHeight: this.chatContent.scrollHeight,
            previousAutoScroll: this.autoScroll,
        }
    }

    componentWillUnmount() {
        if (this.unreadPointer) {
            this.props.removeUnreadPointer(this.props.currentChatId);
        }
        this.props.updateScrollerPosition(this.chatContent.scrollTop, this.props.currentChatId);
    }

    onScroll = ({target: {scrollTop, scrollHeight, clientHeight}}) => {
        if (scrollTop === 0 && this.props.hasPreviousChat) {
            this.loadPreviousChat();
        }

        this.autoScroll = scrollTop === scrollHeight - clientHeight;
        console.log("autoScroll: ", this.autoScroll);
    };

    // scrollDiv = (event) => {
    //     this.chatContent.scrollBy(event.deltaX, event.deltaY);
    // };

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
            <>
                <div
                    className="chat-content"
                    ref={(inp) => this.chatContent = inp}
                    onScroll={this.onScroll}
                >
                    {
                        this.props.loadingMessages && (
                            <div className="chat-line loading">
                                <Loading/>
                            </div>
                        )
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
                                    // onLoad={this.scrollToEndPointer}
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
                {/*<div*/}
                {/*    className="chat-content-overflow_control_wrap"*/}
                {/*    onWheel={this.scrollDiv}*/}
                {/*>*/}
                {/*    {*/}
                {/*        !this.autoScroll &&*/}
                {/*        <ChatNewMessagesIcon*/}
                {/*            unread={this.props.unreadMsgCount}*/}
                {/*            onClick={() => {*/}
                {/*                this.unreadPointer.scrollIntoView()*/}
                {/*            }}*/}
                {/*        />*/}
                {/*    }*/}
                {/*</div>*/}
            </>
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

class FileButton extends React.Component {
    static propTypes = {
        onFileSelected: PropTypes.func,
        maxFileSize: PropTypes.number,
        accept: PropTypes.string,
        notify: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.fileSelector = React.createRef();
    }

    onButtonClick = () => {
        this.fileSelector.current.click();
    };

    fileSelected = (event) => {
        const {onFileSelected} = this.props;

        const selectedFile = event.target.files[0];
        if (selectedFile) {
            console.log("File Selected");
            console.log(selectedFile);
            if (this.props.maxFileSize) {
                if (selectedFile.size > this.props.maxFileSize) {
                    console.log("File Size limit exceeded");
                    this.props.notify(`Max File Size limit exceeded ${this.props.maxFileSize / (1024 * 1024)} MB`);
                    return;
                }
            }
            onFileSelected(selectedFile);
        } else {
            console.log("File Deselected");
            onFileSelected(null);
        }
    };

    render() {
        const {onFileSelected, accept, ...remainingProps} = this.props;
        return (
            <>
                <button {...remainingProps} onClick={this.onButtonClick}>
                    {this.props.children}
                </button>
                <input
                    type="file"
                    ref={this.fileSelector}
                    style={{display: "none"}}
                    onChange={this.fileSelected}
                    accept={accept}
                />
            </>
        );
    }
}

class AttachmentsButton extends React.Component {
    static propTypes = {
        onAttachment: PropTypes.func,
        fileSelected: PropTypes.bool,
        fileType: PropTypes.string,
        notify: PropTypes.func,
    };

    state = {
        showAttachmentsPanel: false,
    };

    toggleAttachmentPanel = () => {
        this.setState({
            showAttachmentsPanel: !this.state.showAttachmentsPanel,
        });
    };

    imageSelected = (file) => {
        const {onAttachment} = this.props;

        if (file) {
            onAttachment(file, "image");
        } else {
            onAttachment(null, null);
        }
    };

    videoSelected = (file) => {
        const {onAttachment} = this.props;

        if (file) {
            onAttachment(file, "video");
        } else {
            onAttachment(null, null);
        }
    };

    documentSelected = (file) => {
        const {onAttachment} = this.props;

        if (file) {
            onAttachment(file, "document");
        } else {
            onAttachment(null, null);
        }
    };

    cancelAttachment = () => {
        const {onAttachment} = this.props;
        onAttachment(null, null);
    };

    render() {
        const {className, onAttachment, fileSelected, fileType, notify, ...buttonProps} = this.props;
        const chatFileSelected = fileSelected ? "chat-file-selected" : "";
        const chatImageSelected = fileType === "image" ? "chat-file-selected" : "";
        const chatVideoSelected = fileType === "video" ? "chat-file-selected" : "";
        const chatDocumentSelected = fileType === "document" ? "chat-file-selected" : "";

        const maxFileSize = 24 * 1024 * 1024;

        return (
            <span style={{position: "relative"}}>
                <button className={`${className} ${chatFileSelected}`}
                        onClick={this.toggleAttachmentPanel} {...buttonProps}>
                    {this.props.children}
                </button>
                {
                    this.state.showAttachmentsPanel &&
                    <div className="chat-attachments-panel">
                        <FileButton type="button" className={`chat-attachment-button ${chatImageSelected}`}
                                    maxFileSize={maxFileSize}
                                    onFileSelected={this.imageSelected} accept="image/*" notify={notify}>
                            <i className="fas fa-image"> </i>
                        </FileButton>
                        <FileButton type="button" className={`chat-attachment-button ${chatVideoSelected}`}
                                    maxFileSize={maxFileSize}
                                    onFileSelected={this.videoSelected} accept="video/*" notify={notify}>
                            <i className="fas fa-video"> </i>
                        </FileButton>
                        <FileButton type="button" className={`chat-attachment-button ${chatDocumentSelected}`}
                                    maxFileSize={maxFileSize}
                                    onFileSelected={this.documentSelected} notify={notify}>
                            <i className="fas fa-file"> </i>
                        </FileButton>
                        <button type="button" className="chat-attachment-button" onClick={this.cancelAttachment}>
                            <i className="fas fa-times"> </i>
                        </button>
                    </div>
                }
            </span>
        );
    }
}

class ChatInput extends React.Component {
    static propTypes = {
        updateMessage: PropTypes.func,
        notify: PropTypes.func,
    };

    state = {
        message: "",
        type: "text",
        link: null,
        file: null,
        fileSelected: false,
    };

    getLink = text => {
        let link = utils.linksSplitter(text).lastFind(item => item.type === "link");
        return link ? link.word : null;
    };

    onMessageInput = ({target: {value: message}}) => {
        let link = null;
        if (this.state.type === "text") {
            link = this.getLink(message);
        }
        this.setState({
            message,
            link,
        });
    };

    onAttachment = (file, type) => {
        if (type) {
            this.setState({
                file: file,
                type: type,
                fileSelected: true,
            });
        } else {
            this.setState({
                file: null,
                type: "text",
                fileSelected: false,
            });
        }
    };

    onMessageSubmit = (event) => {
        const maxTextLength = 10240;

        event.preventDefault();
        if (this.state.type === "text" && this.state.message.match(utils.onlySpacesRegex)) {
            return;
        }
        if (this.state.message.length > maxTextLength) {
            this.props.notify("Message too long. Max limit reached only 10240 characters allowed.");
            return;
        }
        const {updateMessage} = this.props;

        let message = {
            data: this.state.message,
            type: this.state.type,
            id: -100,
            by: 0,
            time: Date.now(),
            read: 0,
            file: this.state.file,
        };

        this.setState({
            message: "",
            type: "text",
            link: null,
            file: null,
            fileSelected: false,
        });

        updateMessage(message);
    };

    emojiUpdate = (emoji) => {
        this.setState({
            message: this.state.message + emoji.native,
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
                    <AttachmentsButton
                        type="button"
                        className="button"
                        onAttachment={this.onAttachment}
                        fileSelected={this.state.fileSelected}
                        fileType={this.state.type}
                        notify={this.props.notify}
                    >
                        <i className="fas fa-paperclip"> </i>
                    </AttachmentsButton>
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
        currentChat: PropTypes.object,
        currentChatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        updateMessage: PropTypes.func,
        closeCurrentChat: PropTypes.func,
        unreadMsgCount: PropTypes.number,
        removeUnreadPointer: PropTypes.func,
        loadPreviousChat: PropTypes.func,
        updateScrollerPosition: PropTypes.func,
        scrollerPosition: PropTypes.number,
        notify: PropTypes.func,
    };

    state = {
        newMessageByMe: false,
    };

    cleanNewMessageByMe = () => {
        this.setState({
            newMessageByMe: false,
        });
    };

    updateNewMessageByMe = () => {
        this.setState({
            newMessageByMe: true,
        });
    };

    updateMessage = (message) => {
        let {currentChatId} = this.props;

        this.updateNewMessageByMe();
        this.props.updateMessage(currentChatId, message);
    };

    render() {
        const {currentChatId, currentChat} = this.props;

        return (
            <div className="chat-body">
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
                    unreadMsgCount={this.props.unreadMsgCount}
                    removeUnreadPointer={this.props.removeUnreadPointer}
                    loadPreviousChat={this.props.loadPreviousChat}
                    chatType={currentChat.chatType}
                    scrollerPosition={this.props.scrollerPosition}
                    updateScrollerPosition={this.props.updateScrollerPosition}
                    newMessageByMe={this.state.newMessageByMe}
                    newMessage={currentChat.newMessage}
                    cleanNewMessageByMe={this.cleanNewMessageByMe}
                    loadingMessages={currentChat.loadingMessages}
                    notify={this.props.notify}
                />
                <ChatInput
                    updateMessage={this.updateMessage}
                    notify={this.props.notify}
                />
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
        markAsReadCurrentChat: PropTypes.func,
        searchPerson: PropTypes.func,
        noLoadingList: PropTypes.func,
        notify: PropTypes.func,
    };

    state = {
        scrollerPositions: {},
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {chat: {currentChatId}, markAsReadCurrentChat} = this.props;
        const currentChat = this.props.chat.list.find(listItem => listItem.id === currentChatId);

        if (currentChatId && currentChat.newMessage) {
            markAsReadCurrentChat(currentChatId);
        }
    }

    updateScrollerPosition = (scrollerPosition, chatId) => {
        this.setState((prevState) => {
            let newScrollerPositions = {
                ...prevState.scrollerPositions,
            };
            newScrollerPositions[chatId] = scrollerPosition;

            return {
                scrollerPositions: newScrollerPositions,
            }
        });
    };

    render() {
        const {currentChatId} = this.props.chat;
        const currentChat = this.props.chat.list.find(listItem => listItem.id === currentChatId);

        return (
            <div className="chat">
                <ChatList
                    loadingList={this.props.chat.loadingList}
                    chat={this.props.chat}
                    updateCurrentChat={this.props.updateCurrentChat}
                    searchPerson={this.props.searchPerson}
                    more={this.props.chat.more}
                    noLoadingList={this.props.noLoadingList}
                />
                {
                    currentChatId && currentChat &&
                    <ChatBody
                        currentChat={currentChat}
                        currentChatId={currentChatId}
                        updateMessage={this.props.updateMessage}
                        closeCurrentChat={this.props.closeCurrentChat}
                        unreadMsgCount={currentChat.unread}
                        removeUnreadPointer={this.props.removeUnreadPointer}
                        loadPreviousChat={this.props.loadPreviousChat}
                        updateScrollerPosition={this.updateScrollerPosition}
                        scrollerPosition={this.state.scrollerPositions[currentChatId]}
                        key={`chat-${currentChatId}`}
                        notify={this.props.notify}
                    />
                }
            </div>
        );
    }
}