/**
 * nativescript-mqtt5
 * Copyright (c) 2025 Antonio Perri <perrianton@gmail.com>
 * Copyright (c) 2015-2019 Eduardo Speroni
 * 
 * Licensed under the Apache License, Version 2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

import { Message } from './paho-mqtt';
export { Message };
export class EventHandler {
    constructor() {
        this.handlers = [];
    }
    on(handler) {
        this.handlers.push(handler);
    }
    off(handler) {
        this.handlers = handler ? this.handlers.filter(h => h !== handler) : [];
    }
    trigger(data) {
        this.handlers.slice(0).forEach(h => h(data));
    }
}
export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
;
