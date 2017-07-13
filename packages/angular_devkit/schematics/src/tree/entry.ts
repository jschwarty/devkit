/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SchematicPath} from '../utility/path';
import {FileEntry} from './interface';


export class SimpleFileEntry implements FileEntry {
  constructor(private _path: SchematicPath, private _content: Buffer) {}

  get path() { return this._path; }
  get content() { return this._content; }
}


export class LazyFileEntry implements FileEntry {
  private _content: Buffer | null = null;

  constructor(private _path: SchematicPath, private _load: (path?: SchematicPath) => Buffer) {}

  get path() { return this._path; }
  get content() { return this._content || (this._content = this._load(this._path)); }
}
