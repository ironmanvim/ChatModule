import React from "react";
import ReactPlayer from 'react-player';
import * as PropTypes from 'prop-types';

import "./Assets/css/full-screen.css";

export default class FullScreenView extends React.Component {
    state = {
        content: null,
        type: null,
        isFullScreen: false,
    };

    static childContextTypes = {
        showFullScreen: PropTypes.func,
    };

    showFullScreen = (content, type) => {
        this.setState({
            content,
            type,
            isFullScreen: true,
        });
    };

    hideFullScreen = () => {
        this.setState({
            content: null,
            type: null,
            isFullScreen: false,
        });
    };

    getChildContext() {
        return {
            showFullScreen: this.showFullScreen,
        }
    }

    render() {
        const {children} = this.props;
        let view = null;
        if (this.state.isFullScreen) {
            if (this.state.type === "image") {
                view = (
                    <div className="image-view">
                        <img src={this.state.content} alt="view"/>
                    </div>
                );
            } else if (this.state.type === "video") {
                view = (
                    <div className="image-view">
                        <ReactPlayer
                            url={this.state.content}
                            controls
                            playing
                            width='100%'
                            height='100%'
                        />
                    </div>
                );
            }
        }

        return (
            <div>
                {children}
                {
                    this.state.isFullScreen ?
                        <div className="full-screen">
                            <div
                                className="exit"
                                onClick={this.hideFullScreen}
                            >
                                &times;
                            </div>
                            <div className="content centered">
                                {view}
                            </div>
                        </div> : null
                }
            </div>
        );
    }
}