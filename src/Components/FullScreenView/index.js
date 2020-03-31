import React, {useState} from "react";
import ReactPlayer from 'react-player';

import "./Assets/css/full-screen.css";

export const FullScreenContext = React.createContext({});

export default function FullScreenView({children}) {
    const [fullScreen, setFullScreen] = useState({
        content: null,
        type: null,
        isFullScreen: false,
    });

    const showFullScreen = (content, type) => {
        setFullScreen({
            content,
            type,
            isFullScreen: true,
        });
    };

    const hideFullScreen = () => {
        setFullScreen({
            content: null,
            type: null,
            isFullScreen: false,
        });
    };

    let view = null;
    if (fullScreen.isFullScreen) {
        if (fullScreen.type === "image") {
            view = (
                <div className="image-view">
                    <img src={fullScreen.content} alt="view"/>
                </div>
            );
        } else if (fullScreen.type === "video") {
            view = (
                <div className="image-view">
                    <ReactPlayer
                        url={fullScreen.content}
                        controls
                        playing
                        width='100%'
                        height='100%'
                    />
                </div>
            );
        } else if (fullScreen.type === "ReactElement") {
            view = (
                <div className="image-view">
                    {fullScreen.content}
                </div>
            );
        }
    }

    return (
        <FullScreenContext.Provider value={showFullScreen}>
            <div>
                {children}
                {
                    fullScreen.isFullScreen ?
                        <div className="full-screen">
                            <div
                                className="exit"
                                onClick={hideFullScreen}
                            >
                                &times;
                            </div>
                            <div className="content centered">
                                {view}
                            </div>
                        </div> : null
                }
            </div>
        </FullScreenContext.Provider>
    );
}