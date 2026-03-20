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
export interface IEvent<T> {
    on(handler: { (data?: T): void; }): void;
    off(handler?: { (data?: T): void; }): void;
}
export declare class EventHandler<T> implements IEvent<T> {
    private handlers;
    on(handler: { (data?: T): void; }): void;
    off(handler?: { (data?: T): void; }): void;
    trigger(data?: T): void;
}
export declare function guid(): string;
