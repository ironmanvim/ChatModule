import React from 'react';
import Chat from './Components/Chat';
import uuid from 'uuid';

import './App.css';
import FullScreenView from "./Components/FullScreenView";

class App extends React.Component {
    state = {
        chat: {
            loadingList: false,
            more: true,
            list: [
                {
                    id: 1,
                    name: "Vishal",
                    avatar: require("./Assets/images/Avatar.png"),
                    latestMessageTime: 20,
                    loadingMessages: false,
                    messages: [
                        {
                            id: 1,
                            by: "you",
                            data: "222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222",
                            time: 1, type: "text",
                            sendSeen: false,
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
                            type: "text",
                            sendSeen: false,
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
                                video: require("./Assets/videos/trial.mp4"),
                                caption: "Avengers End Game",
                            },
                            type: "video",
                            time: 6,
                            sendSeen: false,
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
                            read: 3, // read
                        },
                        {
                            id: 6,
                            by: 0,
                            data: {
                                file: require("./Assets/images/trial.png"),
                                name: "A best Avatar Caption gfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                                caption: "A file caption ",
                            },
                            type: "document",
                            time: 7,
                            read: 3, // read
                        },
                    ],
                    lastSeen: Date.now(),
                    unread: 3,
                    hasPreviousChat: true,
                    chatType: "group",
                    newMessage: true,
                }, {
                    id: 2,
                    name: "Vishnu",
                    avatar: require("./Assets/images/Avatar.png"),
                    latestMessageTime: 30,
                    loadingMessages: true,
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
                    newMessage: false,
                },
            ],
            currentChatId: null,
        },
    };

    searchPerson = () => {
        this.setState({
            chat: {
                ...this.state.chat,
                loadingList: true
            }
        });
        setTimeout(() => {
            if (this.state.chat.more) {
                this.setState((prevState) => {
                    return {
                        chat: {
                            ...prevState.chat,
                            more: false,
                            loadingList: false,
                            list: [
                                ...prevState.chat.list,
                                {
                                    id: uuid.v4(),
                                    name: "Tony Stark",
                                    avatar: require("./Assets/images/Avatar.png"),
                                    messages: [],
                                    lastSeen: 2,
                                    unread: 0,
                                    hasPreviousChat: false,
                                    chatType: "individual",
                                    newMessage: false,
                                },
                            ],
                        }
                    }
                });
            }
        }, 3000);
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
        const currentChat = this.state.chat.list.find(listItem => listItem.id === id);

        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    list: prevState.chat.list.map(listItem => {
                        return {
                            ...listItem,
                            loadingMessages: true,
                        }
                    })
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
                                    loadingMessages: false,
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
        }, 3000);
    };

    updateMessage = (id, message) => {
        const {type, file} = message;
        let self = this;
        if (type === "text") {
            self.setState((prevState) => {
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
        } else {
            if (FileReader && file) {
                let fileReader = new FileReader();
                fileReader.onload = function () {
                    if (type === "image") {
                        message = {
                            ...message,
                            data: {
                                image: fileReader.result,
                                caption: message.data,
                            }
                        };
                    } else if (type === "video") {
                        message = {
                            ...message,
                            data: {
                                video: fileReader.result,
                                caption: message.data,
                            }
                        };
                    } else if (type === "document") {
                        message = {
                            ...message,
                            data: {
                                file: fileReader.result,
                                caption: message.data,
                            }
                        };
                    }
                    self.setState((prevState) => {
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
                };
                fileReader.readAsDataURL(file);
            }

            // Not supported
            else {
                // fallback -- perhaps submit the input to an iframe and temporarily store
                // them on the server until the user's session ends.
            }
        }

        // setTimeout(() => {
        //     this.setState((prevState) => {
        //         return {
        //             chat: {
        //                 ...prevState.chat,
        //                 list: prevState.chat.list.map(listItem => {
        //                     if (listItem.id === id) {
        //                         return {
        //                             ...listItem,
        //                             messages: listItem.messages.map(message => {
        //                                 if (message_id === message.id) {
        //                                     return {
        //                                         ...message,
        //                                         read: 1,
        //                                     }
        //                                 }
        //                                 return message;
        //                             }),
        //                         };
        //                     }
        //                     return listItem;
        //                 }),
        //             }
        //         };
        //     });
        // }, 2500)
    };

    markAsReadCurrentChat = (id) => {
        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    list: prevState.chat.list.map(listItem => {
                        if (listItem.id === id) {
                            return {
                                ...listItem,
                                messages: listItem.messages.map(message => {
                                    if (message.id) {
                                        if (message.sendSeen === false) {
                                            console.log("Message Seen Delivery");
                                            return {
                                                ...message,
                                                sendSeen: true,
                                            }
                                        }
                                        return message;
                                    }
                                    return message;
                                }),
                                newMessage: false,
                            };
                        }
                        return listItem;
                    }),
                }
            };
        });
    };

    noLoadingList = () => {
        this.setState((prevState) => {
            return {
                chat: {
                    ...prevState.chat,
                    loadingList: false,
                }
            };
        });
    };

    render() {
        return (
            <FullScreenView>
                <div className="App">
                    <Chat
                        chat={this.state.chat}
                        updateCurrentChat={this.updateCurrentChat}
                        closeCurrentChat={this.closeCurrentChat}
                        updateMessage={this.updateMessage}
                        removeUnreadPointer={this.removeUnreadPointer}
                        loadPreviousChat={this.loadPreviousChat}
                        markAsReadCurrentChat={this.markAsReadCurrentChat}
                        searchPerson={this.searchPerson}
                        noLoadingList={this.noLoadingList}
                    />
                    {/*<URLMetadata url="https://www.whatsapp.com"/>*/}
                </div>
            </FullScreenView>
        );
    }
}

export default App;