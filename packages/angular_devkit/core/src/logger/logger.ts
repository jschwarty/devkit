/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {JsonObject} from '../json/interface';

import {Observable} from 'rxjs/Observable';
import {PartialObserver} from 'rxjs/Observer';
import {Operator} from 'rxjs/Operator';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';


export interface LoggerMetadata extends JsonObject {
  name: string;
  path: string[];
}
export interface LogEntry extends LoggerMetadata {
  level: LogLevel;
  message: string;
  timestamp: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';


export class Logger extends Observable<LogEntry> {
  protected readonly _subject: Subject<LogEntry> = new Subject<LogEntry>();
  protected _metadata: LoggerMetadata;

  private _obs: Observable<LogEntry>;
  private _subscription: Subscription | null;

  protected get _observable() { return this._obs; }
  protected set _observable(v: Observable<LogEntry>) {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._obs = v;
    if (this.parent) {
      this._subscription = this.subscribe((value: LogEntry) => {
        if (this.parent) {
          this.parent._subject.next(value);
        }
      }, (error: Error) => {
        if (this.parent) {
          this.parent._subject.error(error);
        }
      }, () => {
        if (this._subscription) {
          this._subscription.unsubscribe();
        }
        this._subscription = null;
      });
    }
  }

  constructor(public readonly name: string, public readonly parent: Logger | null = null) {
    super();

    const path: string[] = [];
    let p = parent;
    while (p) {
      path.push(p.name);
      p = p.parent;
    }
    this._metadata = { name, path };
    this._observable = this._subject.asObservable();
    if (this.parent) {
      // When the parent completes, complete us as well.
      this.parent._subject.subscribe(undefined, undefined, () => this.complete());
    }
  }

  complete() {
    this._subject.complete();
  }

  log(level: LogLevel, message: string, metadata: JsonObject = {}): void {
    const entry: LogEntry = Object.assign({}, this._metadata, metadata, {
      level, message, timestamp: +Date.now(),
    });
    this._subject.next(entry);
  }

  debug(message: string, metadata: JsonObject = {}) {
    return this.log('debug', message, metadata);
  }
  info(message: string, metadata: JsonObject = {}) {
    return this.log('info', message, metadata);
  }
  warn(message: string, metadata: JsonObject = {}) {
    return this.log('warn', message, metadata);
  }
  error(message: string, metadata: JsonObject = {}) {
    return this.log('error', message, metadata);
  }
  fatal(message: string, metadata: JsonObject = {}) {
    return this.log('fatal', message, metadata);
  }

  toString() {
    return `<Logger(${this.name})>`;
  }

  lift(operator: Operator<LogEntry, LogEntry>): Observable<LogEntry> {
    return this._observable.lift(operator);
  }

  subscribe(): Subscription;
  subscribe(observer: PartialObserver<LogEntry>): Subscription;
  subscribe(next?: (value: LogEntry) => void, error?: (error: Error) => void,
            complete?: () => void): Subscription;
  subscribe(_observerOrNext?: PartialObserver<LogEntry> | ((value: LogEntry) => void),
            _error?: (error: Error) => void,
            _complete?: () => void): Subscription {
    return this._observable.subscribe.apply(this._observable, arguments);
  }
  forEach(next: (value: LogEntry) => void, PromiseCtor?: typeof Promise): Promise<void> {
    return this._observable.forEach(next, PromiseCtor);
  }
}
