Array.prototype.lastFind = function (predicate) {
    for (let i = this.length - 1; i >= 0; --i) {
        const x = this[i];
        if (predicate(x)) {
            return x;
        }
    }
};

export function deepCompare() {
    let i, l, leftChain, rightChain;

    function compare2Objects(x, y) {
        let p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {

        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }

    return true;
}


const SECOND_MILLIS = 1000;
const MINUTE_MILLIS = 60 * SECOND_MILLIS;
const HOUR_MILLIS = 60 * MINUTE_MILLIS;
const DAY_MILLIS = 24 * HOUR_MILLIS;

export function getTimeAgo(time) {
    let now = Date.now();
    if (time > now || time <= 0) {
        return null;
    }


    let diff = now - time;
    if (diff < 2500) {
        return "online";
    } else if (diff < MINUTE_MILLIS) {
        return "last seen recently";
    } else if (diff < 2 * MINUTE_MILLIS) {
        return "a minute ago";
    } else if (diff < 50 * MINUTE_MILLIS) {
        return `${Math.floor(diff / MINUTE_MILLIS)} minutes ago`;
    } else if (diff < 90 * MINUTE_MILLIS) {
        return "an hour ago";
    } else if (diff < 24 * HOUR_MILLIS) {
        return `${Math.floor(diff / HOUR_MILLIS)} hours ago`;
    } else if (diff < 48 * HOUR_MILLIS) {
        return "yesterday";
    } else if (diff < 10 * DAY_MILLIS) {
        return `${Math.floor(diff / DAY_MILLIS)} days ago`;
    } else {
        let currentTime = new Date(time);
        return `${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}`;
    }
}

export function getFormattedDate(time) {
    let now = Date.now();
    if (time > now || time <= 0) {
        return null;
    }

    time = new Date(time);
    time = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    time = time.getTime();

    let diff = now - time;
    if (diff < 24 * HOUR_MILLIS) {
        return `Today`;
    } else if (diff < 48 * HOUR_MILLIS) {
        return "Yesterday";
    } else {
        let currentTime = new Date(time);
        return `${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}`;
    }
}

export function getFormattedTime(time) {
    let currentTime = new Date(time);

    return `${currentTime.getHours()}:${currentTime.getMinutes()}`;
}

export const linkRegex = /(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))?/;
export const onlySpacesRegex = /^(\s*)$/;
export function linksSplitter(text) {
    return text.split(/(\s+)/).map((word) => {
        if (word.match(linkRegex)) {
            return {
                word,
                type: "link",
            }
        }
        return {
            word,
            type: "text",
        };
    });
}