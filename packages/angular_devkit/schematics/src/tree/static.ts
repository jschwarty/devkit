/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FilteredTree} from './filtered';
import {FilePredicate, MergeStrategy, Tree} from './interface';
import {VirtualTree} from './virtual';


export function empty() { return new VirtualTree(); }

export function branch(tree: Tree) {
  return VirtualTree.branch(tree);
}

export function merge(tree: Tree, other: Tree, strategy: MergeStrategy = MergeStrategy.Default) {
  return VirtualTree.merge(tree, other, strategy);
}

export function partition(tree: Tree, predicate: FilePredicate<boolean>): [Tree, Tree] {
  return [
    new FilteredTree(tree, predicate),
    new FilteredTree(tree, (path, entry) => !predicate(path, entry)),
  ];
}

export function optimize(tree: Tree) {
  return VirtualTree.optimize(tree);
}
