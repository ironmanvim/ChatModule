import React from "react";

class Notify extends React.Component {
    render() {
        let iconStyle = {
            fontSize: this.props.size + "pt",
            color: this.props.color,
        };
        let positionStyle = {
            position: "absolute",
        };
        switch (this.props.position) {
            case "top-left":
                positionStyle.top = 0;
                positionStyle.left = 0;
                break;
            case "top-right":
                positionStyle.top = 0;
                positionStyle.right = 0;
                break;
            case "bottom-left":
                positionStyle.bottom = 0;
                positionStyle.left = 0;
                break;
            case "bottom-right":
                positionStyle.bottom = 0;
                positionStyle.right = 0;
                break;
            default:
                break;
        }
        return (
            <span className={this.props.display ? "notify-icon" : "hide"} style={positionStyle}>
                <i className="fa fa-circle " style={iconStyle}> </i>
            </span>
        );
    }
}

export default Notify;