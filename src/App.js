import React from 'react';
import Chat from './Components/Chat/Chat';
import URLMetadata from './Components/Chat/URLMetadata';
import uuid from 'uuid';

import './App.css';
import FullScreenView from "./Components/FullScreenView/FullScreenView";

class App extends React.Component {
    state = {
        chat: {
            list: [
                {
                    id: 1,
                    name: "Vishal",
                    avatar: require("./Assets/images/Avatar.png"),
                    messages: [
                        {
                            id: 1,
                            by: "you",
                            data: "222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222",
                            time: 1, type: "text",
                        },
                        {
                            id: 2,
                            by: 0,
                            data: "2222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222",
                            time: 2, type: "text",
                            read: 0 // wait
                        },
                        {
                            id: 3,
                            by: 0,
                            data: "Hello",
                            time: 3,
                            type: "text",
                            read: 1 // delivered to server
                        },
                        {
                            id: 4,
                            by: "you",
                            data: "Hi",
                            time: 4,
                            type: "text"
                        },
                        {
                            unreadPointer: true,
                        },
                        {
                            id: 5,
                            by: 0,
                            data: {
                                image: require("./Assets/images/trial.png"),
                                caption: "Another Caption for image"
                            },
                            time: 5,
                            type: "image",
                            read: 2, // read
                        },
                        {
                            id: 7,
                            by: "you",
                            data: {
                                thumbnail: require("./Assets/images/trial.png"),
                                video: require("./Assets/videos/trial.mp4"),
                                caption: "Avengers End Game",
                            },
                            type: "video",
                            time: 6,
                        },
                        {
                            id: 6,
                            by: 0,
                            data: {
                                image: require("./Assets/images/trial.png"),
                                caption: "A best Avatar Caption",
                            },
                            type: "image",
                            time: 7,
                        },
                    ],
                    lastSeen: Date.now(),
                    unread: 3,
                    hasPreviousChat: true,
                    chatType: "group"
                }, {
                    id: 2,
                    name: "Vishnu",
                    avatar: require("./Assets/images/Avatar.png"),
                    messages: [
                        {id: 1, by: 0, data: "Hello", time: 1, type: "text"},
                        {id: 2, by: "you", data: "Hi", time: 2, type: "text"},
                        {id: 3, by: 0, data: "Hello", time: 3, type: "text"},
                        {id: 4, by: "you", data: "Hi", time: 4, type: "text"},
                    ],
                    lastSeen: 2,
                    unread: 0,
                    hasPreviousChat: false,
                    chatType: "individual",
                },
            ],
            currentChatId: null,
        },
    };

    updateCurrentChat = (id) => {
        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    currentChatId: id,
                    list: prevState.chat.list.map(listItem => {
                        if (listItem.id === id) {
                            return {
                                ...listItem,
                                unread: 0,
                            };
                        }
                        return listItem;
                    }),
                }
            }
        });
    };

    removeUnreadPointer = (id) => {
        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    list: prevState.chat.list.map(listItem => {
                        if (listItem.id === id) {
                            return {
                                ...listItem,
                                messages: listItem.messages.filter(message => message.unreadPointer !== true),
                            };
                        }
                        return listItem;
                    }),
                }
            }
        });
    };

    closeCurrentChat = () => {
        this.setState({
            chat: {
                ...this.state.chat,
                currentChatId: null,
            }
        })
    };

    loadPreviousChat = (id) => {
        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    list: prevState.chat.list.map(listItem => {
                        if (listItem.id === id) {
                            return {
                                ...listItem,
                                messages: [
                                    {id: uuid.v4(), by: 0, data: "Previous Message", time: 1, type: "text"},
                                    {id: uuid.v4(), by: "Arun", data: "Previous Message", time: 1, type: "text"},
                                    ...listItem.messages,
                                ],
                            };
                        }
                        return listItem;
                    }),
                }
            }
        });
    };

    updateMessage = (id, message) => {
        const {id: message_id} = message;

        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    list: prevState.chat.list.map(listItem => {
                        if (listItem.id === id) {
                            return {
                                ...listItem,
                                messages: [
                                    ...listItem.messages,
                                    message,
                                ],
                            };
                        }
                        return listItem;
                    }),
                }
            };
        });
        setTimeout(() => {
            this.setState((prevState) => {
                return {
                    chat: {
                        ...prevState.chat,
                        list: prevState.chat.list.map(listItem => {
                            if (listItem.id === id) {
                                return {
                                    ...listItem,
                                    messages: listItem.messages.map(message => {
                                        if (message_id === message.id) {
                                            return {
                                                ...message,
                                                read: 1,
                                            }
                                        }
                                        return message;
                                    }),
                                };
                            }
                            return listItem;
                        }),
                    }
                };
            });
        }, 2500)
    };

    render() {
        return (
            <div className="App">
                <FullScreenView>
                    <Chat
                        chat={this.state.chat}
                        updateCurrentChat={this.updateCurrentChat}
                        closeCurrentChat={this.closeCurrentChat}
                        updateMessage={this.updateMessage}
                        removeUnreadPointer={this.removeUnreadPointer}
                        loadPreviousChat={this.loadPreviousChat}
                    />
                </FullScreenView>
                {/*<URLMetadata url="https://www.whatsapp.com"/>*/}
            </div>
        );
    }
}

export default App;