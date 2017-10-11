'use strict';

const button = (val) => {
    switch (val) {
        case 0:
            return 'left';
        case 1:
            return 'middle';
        case 2:
            return 'right';
    }
};

module.exports = {
    button
};
