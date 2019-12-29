import React from "react";
import Notify from "./Notify";
import * as locutus from "locutus";

import {Picker as EmojiPicker} from 'emoji-mart';
import {Link} from "react-router-dom";
import 'emoji-mart/css/emoji-mart.css';

import "../Assets/css/chat.css";

class ChatListItem extends React.Component {
    openCurrentChat() {
        window.store.dispatch({
            type: "CURRENT_CHAT",
            id: this.props.chatId,
        });
    }

    render() {
        let currentChatId = this.props.chat.currentChat;
        let chatId = this.props.chatId;
        return (
            <div className={"chat-list-item" + (currentChatId === chatId ? " clicked" : "")} onClick={() => {
                this.openCurrentChat()
            }}>
                <div className="item-image">
                    <img src={this.props.image} alt="chat"/>
                </div>
                <div className="item-info">
                    <div className="item-time">
                        {this.props.time}
                    </div>
                    <div className="item-name">
                        {this.props.name}
                    </div>
                    <div className="item-desc">
                        <span>{this.props.desc}</span>
                    </div>
                </div>
            </div>
        );
    }
}

class ChatList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ""
        };
    }

    render() {
        const persons = this.props.chat.list;
        return (
            <div className="chat-list">
                <div className="search-bar">
                    <i className="fas fa-search"> </i>
                    <input
                        type="text"
                        placeholder="Search Message or Name..."
                        value={this.state.search}
                        onChange={(e) => {
                            this.setState({
                                search: e.target.value,
                            });
                        }}/>
                </div>
                <div className="chat-list-body">
                    {persons.filter(person => person.name.includes(this.state.search)).map((person) => {
                            let lastMessage = person.messages[person.messages.length - 1];
                            let lastSentBy = lastMessage.sender === "you" ? "" : "Me: ";
                            return <ChatListItem
                                chat={this.props.chat}
                                key={person.id}
                                chatId={person.id}
                                time={person.lastSeen + " min ago"}
                                name={person.name}
                                desc={`${lastSentBy} ${lastMessage.type === "text" ? lastMessage.data : lastMessage.type}`}
                                image={person.profile_picture}
                            />
                        }
                    )}
                </div>
            </div>
        );
    }
}


class ChatInfo extends React.Component {
    closeChat() {
        window.store.dispatch({
            type: "CLOSE_CHAT"
        });
    }

    render() {
        const state = this.props.chat;
        const currentChat = state.currentChat;
        if (currentChat) {
            const person = state.persons.find((person) => person.id === currentChat);
            return (
                <div className="chat-info">
                    <div className="exit" onClick={() => {
                        this.closeChat()
                    }}>
                        <i className="fas fa-times"> </i>
                    </div>
                    <div className="item-image">
                        <img src={person.profile_picture} alt="chat"/>
                        <Notify display={!person.lastSeen} position="bottom-right" size={10} color="lawngreen"/>
                    </div>
                    <div className="item-info">
                        <div className="item-name">
                            {person.name}
                        </div>
                        <div className="item-desc">
                            {person.lastSeen + " min ago"}
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

class ChatLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optionShow: false,
        };
    }

    showOption() {
        this.setState({
            optionShow: true
        });
    }

    hideOption() {
        this.setState({
            optionShow: false
        });
    }

    render() {
        let message;
        if (this.props.type === "text") {
            const linkRegExp = /(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))?/;
            message = (
                <div className="text">
                    <span>
                        {
                            this.props.message.split(" ").map((word, index) => {
                                if (word.match(linkRegExp)) {
                                    return <span key={index}><a href={word} target="_blank"
                                                                rel="noopener noreferrer">{word}</a> </span>;
                                }
                                return <span key={index}>{word} </span>;
                            })
                        }
                    </span>
                </div>
            )
        } else if (this.props.type === "image") {
            message = (
                <Link
                    style={{textDecoration: "none"}}
                    to={{
                        pathname: "/full_screen",
                        state: {
                            data: this.props.message,
                            type: this.props.type,
                        }
                    }}
                >
                    <div
                        className="image"
                    >
                        <img src={this.props.message} alt=""/>
                    </div>
                </Link>
            )
        } else if (this.props.type === "video") {
            let thumbnail;
            let description;
            if (this.props.message.videoType === "youtube") {
                thumbnail = this.props.message.thumbnail;
                description = (
                    <span>
                        {this.props.message.title}<br/>
                        <a href={this.props.message.url} target="_blank"
                           rel="noopener noreferrer">{this.props.message.url}</a>
                    </span>
                );
            } else {
                thumbnail = require("../Assets/images/trial.png");
                description = "Description"
            }
            message = (

                <div
                    className="image"
                >
                    <Link style={{
                        textDecoration: "none",
                    }} to={{
                        pathname: "/full_screen",
                        state: {
                            data: this.props.message,
                            type: this.props.type,
                        }
                    }}>
                        <figure>
                            <img src={thumbnail} alt=""/>
                            <div className="play">
                                <i className="fa fa-play-circle"> </i>
                            </div>
                        </figure>
                    </Link>
                    <span>{description}</span>
                </div>

            )
        }
        return (
            <div
                className="chat-line"
                onMouseOver={() => {
                    this.showOption();
                }}
                onMouseLeave={() => {
                    this.hideOption();
                }}
            >
                <div className={(this.props.me ? "chat-me-wrapper" : "") + (this.props.you ? "chat-you-wrapper" : "")}>
                    <div className={(this.props.me ? "chat-me" : "") + (this.props.you ? "chat-you" : "")}>
                        {message}
                    </div>
                    <div
                        className={"options"}
                        style={{display: this.state.optionShow ? null : "none"}}
                    >
                        <button><i className="fa fa-ellipsis-h"> </i></button>
                    </div>
                </div>
            </div>
        );
    }
}

class ChatContent extends React.Component {
    // scrollToBottom() {
    //     if (this.messagesEnd)
    //         this.messagesEnd.scrollIntoView(true);
    // }
    //
    // componentDidMount() {
    //     this.scrollToBottom();
    //     console.log("ComponentDidMount Called")
    // }
    //
    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (this.props.autoScroll)
    //         this.scrollToBottom();
    // }

    render() {
        const state = this.props.chat;
        const currentChat = state.currentChat;
        const person = state.list.find((person) => person.id === currentChat);
        if (currentChat) {
            return (
                <div className="chat-content" onScroll={(e) => {
                    // let element = e.target;
                    // // console.log("scrollHeight: ", element.scrollHeight);
                    // // console.log("scrollTop: ", element.scrollTop);
                    // // console.log("clientHeight: ", parseInt(element.scrollTop + element.clientHeight));
                    // if (element.scrollHeight === parseInt(element.scrollTop + element.clientHeight)) {
                    //     console.log("Hello World!!");
                    //     this.props.switchAutoScroll(true);
                    // } else {
                    //     this.props.switchAutoScroll(false);
                    // }
                }}>
                    {person.messages
                        .sort((a, b) => a.time - b.time)
                        .map((message) => {
                            if (message.sender === "me") {
                                return (<ChatLine key={message.id} me message={message.data}
                                                  type={message.type}/>);
                            } else if (message.sender === 'you') {
                                return (<ChatLine key={message.id} you message={message.data}
                                                  type={message.type}/>);
                            }
                            return null;
                        })
                    }
                    <div style={{float: "left", clear: "both"}}
                         ref={(el) => {
                             this.messagesEnd = el;
                         }}>
                    </div>
                </div>
            );
        }
        return null;
    }
}

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            showEmojiPanel: false,
        };
    }

    addMessage(e, type) {
        e.preventDefault();
        if (type === "text") {
            const youtubeRegEx = /^\s*http(|s):\/\/(|www\.|m\.)youtube\.com\/watch\?v=\S+\s*$/i;
            if (this.state.message.match(youtubeRegEx)) {
                const url = this.state.message.trim();
                console.log(url);
                const videoId = url.split("=")[1];
                let thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                fetch(`https://youtube.com/get_video_info?video_id=${videoId}`)
                    .then(response => response.text())
                    .then(text => {
                        let result = [];
                        locutus.php.strings.parse_str(text, result);
                        console.log(result);
                        let json = JSON.parse(result["player_response"]);
                        let title = json.videoDetails.title;
                        console.log(json);
                        window.store.dispatch({
                            type: "ADD_MESSAGE",
                            message: {thumbnail, title, url, videoType: "youtube"},
                            chatId: window.store.getState().currentChat,
                            message_type: "video",
                        });
                    });
            } else if (this.state.message) {
                window.store.dispatch({
                    type: "ADD_MESSAGE",
                    message: this.state.message,
                    chatId: window.store.getState().currentChat,
                    message_type: "text",
                });
            }

            this.setState({
                message: "",
            });
            // this.props.switchAutoScroll(true);
        } else if (type === "attachment") {
            let input = e.target;
            let reader = new FileReader();
            reader.onload = (e) => {
                let text = e.target.result;
                window.store.dispatch({
                    type: "ADD_MESSAGE",
                    message: text,
                    chatId: window.store.getState().currentChat,
                    message_type: "image",
                });
                this.props.switchAutoScroll(true);
            };
            console.log(input.files[0]);
            reader.readAsDataURL(input.files[0]);
        }
    }

    render() {
        let input;
        const currentChat = this.props.chat.currentChat;
        if (currentChat) {
            return (
                <div className="chat-input">
                    <form
                        onSubmit={(e) => {
                            this.addMessage(e, "text")
                        }}
                    >
                        <div className="input-text">
                            <input
                                type="text"
                                placeholder="Type your message here..."
                                value={this.state.message}
                                onChange={(event) => {
                                    this.setState({message: event.target.value});
                                }}
                                ref={(inp) => {
                                    this.message = inp
                                }}
                            />
                        </div>
                        <div className="input-icons">
                            <button
                                type="button"
                                onClick={(e) => {
                                    input = document.createElement("input");
                                    input.setAttribute("type", "file");
                                    input.addEventListener("change", (e) => {
                                        this.addMessage(e, "attachment")
                                    });
                                    input.click();
                                }}
                            >
                                <i className="fa fa-paperclip"> </i>
                            </button>
                            <button type="button"><i className="fa fa-file-video"> </i></button>
                            <button
                                type="button"
                                onClick={() => {
                                    this.setState({
                                        showEmojiPanel: !this.state.showEmojiPanel,
                                    });
                                }}
                                style={{position: "relative"}}
                            >
                                <i className="fa fa-smile"> </i>
                            </button>
                            {this.state.showEmojiPanel ?
                                <EmojiPicker
                                    set='twitter'
                                    style={{
                                        position: "absolute",
                                        bottom: "30px",
                                        left: "0",
                                    }}
                                    onSelect={(emoji) => {
                                        this.setState({
                                            message: this.state.message + emoji.native,
                                            showEmojiPanel: false
                                        });
                                        this.message.focus();
                                    }}
                                /> : null
                            }
                        </div>
                        <div className="input-send">
                            <button type="submit"><i className="fa fa-paper-plane"> </i></button>
                        </div>
                    </form>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default class ContentChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autoScroll: true,
        };
    }

    autoScroll(state) {
        this.setState({
            autoScroll: state,
        });
    }

    render() {
        const currentId = this.props.chat.currentChat;
        return (
            <div className="chat">
                <ChatList chat={this.props.chat}/>
                <div className="chat-body" style={{display: currentId ? null : "none"}}>
                    <ChatInfo chat={this.props.chat}/>
                    <ChatContent chat={this.props.chat} autoScroll={this.state.autoScroll} switchAutoScroll={(state) => {
                        this.autoScroll(state)
                    }}/>
                    <ChatInput chat={this.props.chat} autoScroll={this.state.autoScroll} switchAutoScroll={(state) => {
                        this.autoScroll(state)
                    }}/>
                </div>
            </div>
        );
    }
}
