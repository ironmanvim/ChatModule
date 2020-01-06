import React from "react";
import urlMetadata from 'url-metadata';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';

import './Assets/css/metadata.css';

export default class URLMetadata extends React.Component {
    static propTypes = {
        url: PropTypes.string,
    };

    state = {
        loading: false,
        metadata: null,
        error: null,
    };

    componentDidMount() {
        this.setState({
            loading: true,
        });
        urlMetadata(`https://cors-anywhere.herokuapp.com/${this.props.url}`).then(
            (metadata) => {
                this.setState({
                    loading: false,
                    metadata,
                });
                console.log(metadata);
            },
            function (error) {
                this.setState({
                    loading: false,
                    error,
                });
                console.log(error);
            });
        setTimeout(() => {
            if(this.state.loading) {
                this.setState({
                    loading: false,
                    error: true,
                });
            }
        }, 10000);

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if(this.props.url !== prevProps.url) {
        //     console.log(this.props.url);
        //     this.setState({
        //         loading: true,
        //     });
        //     urlMetadata(`https://cors-anywhere.herokuapp.com/${this.props.url}`).then(
        //         (metadata) => {
        //             this.setState({
        //                 loading: false,
        //                 metadata,
        //             });
        //             console.log(metadata);
        //         },
        //         function (error) {
        //             this.setState({
        //                 loading: false,
        //                 error,
        //             });
        //             console.log(error);
        //         })
        // }
    }

    render() {
        return (
            <div className="metadata">
                {
                    this.state.loading ? (
                        <div className="metadata-loading">
                            <ReactLoading type={"bars"} width={50} color={"#43425D"}/>
                        </div>
                    ) : (
                        !this.state.error && this.state.metadata ? (
                            <div className="metadata-data">
                                <div className="metadata-favicon">
                                    <img src={`${this.state.metadata.image}`} alt=""/>
                                </div>
                                <div className="metadata-info">
                                    <div className="metadata-title">
                                        <a href={this.props.url} target="_blank" rel="noopener noreferrer">
                                            {this.state.metadata.title}
                                        </a>
                                    </div>
                                    <div className="metadata-desc">
                                        {this.state.metadata.description}
                                    </div>
                                </div>
                            </div>
                        ) : null)
                }
            </div>
        );
    }
}