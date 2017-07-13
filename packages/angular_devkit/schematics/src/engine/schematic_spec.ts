/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';
import {MergeStrategy, Tree} from '../tree/interface';
import {branch, empty} from '../tree/static';
import {CollectionDescription, Engine, Rule, SchematicDescription} from './interface';
import {SchematicImpl} from './schematic';


type CollectionT = {
  description: string;
};
type SchematicT = {
  collection: CollectionT;
  description: string;
  path: string;
  factory: <T>(options: T) => Rule;
};

const engine = {
  transformOptions: (_: {}, options: {}) => options,
  defaultMergeStrategy: MergeStrategy.Default,
} as Engine<CollectionT, SchematicT>;
const collection = {
  name: 'collection',
  description: 'description',
} as CollectionDescription<CollectionT>;


describe('Schematic', () => {
  it('works with a rule', done => {
    let inner: Tree | null = null;
    const desc: SchematicDescription<CollectionT, SchematicT> = {
      collection,
      name: 'test',
      description: '',
      path: 'a/b/c',
      factory: () => (tree: Tree) => {
        inner = branch(tree);
        tree.create('a/b/c', 'some content');

        return tree;
      },
    };

    const schematic = new SchematicImpl(desc, desc.factory, null !, engine);
    schematic.call({}, Observable.of(empty()))
      .toPromise()
      .then(x => {
        expect(inner !.files).toEqual([]);
        expect(x.files).toEqual(['/a/b/c']);
      })
      .then(done, done.fail);
  });

  it('works with a rule that returns an observable', done => {
    let inner: Tree | null = null;
    const desc: SchematicDescription<CollectionT, SchematicT> = {
      collection,
      name: 'test',
      description: '',
      path: 'a/b/c',
      factory: () => (fem: Tree) => {
        inner = fem;

        return Observable.of(empty());
      },
    };


    const schematic = new SchematicImpl(desc, desc.factory, null !, engine);
    schematic.call({}, Observable.of(empty()))
      .toPromise()
      .then(x => {
        expect(inner !.files).toEqual([]);
        expect(x.files).toEqual([]);
        expect(inner).not.toBe(x);
      })
      .then(done, done.fail);
  });

});
