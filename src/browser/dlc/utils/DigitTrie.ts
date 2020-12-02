export interface DigitTrie<T> {
  readonly root: Node<T>
}

export interface Leaf<T> {
  readonly data: T
}

export interface Edge<T> {
  readonly node: Node<T> | Leaf<T>
  readonly prefix: number[]
}

function isLeaf<T>(node: Node<T> | Leaf<T>): node is Leaf<T> {
  return 'data' in node
}

export interface Node<T> {
  readonly edges: Edge<T>[]
}

export function trieInsert<T>(
  trie: DigitTrie<T>,
  path: number[],
  data: T
): void {
  insert(trie.root, path, data)
}

export function trieLookUp<T>(
  trie: DigitTrie<T>,
  path: number[]
): { value: T; path: number[] } {
  return lookUp<T>(trie.root, path)
}

export function* trieExplore<T>(
  trie: DigitTrie<T>
): Generator<{ path: number[]; data: T }> {
  yield* explore(trie.root, [])
}

function* explore<T>(
  node: Node<T> | Leaf<T>,
  prefix: number[]
): Generator<{ path: number[]; data: T }> {
  if (isLeaf(node)) {
    yield { path: prefix, data: node.data }
  } else {
    for (const edge of node.edges) {
      if (edge === undefined) {
        continue
      }
      yield* explore(edge.node, prefix.concat(edge.prefix))
    }
  }
}

function insert<T>(node: Node<T>, path: number[], data: T): void {
  const prefix = path[0]
  const edge = node.edges[prefix]
  if (edge === undefined) {
    const leaf = {
      data,
    }
    node.edges[prefix] = {
      node: leaf,
      prefix: path,
    }
  } else if (valuesEqual(edge.prefix, path)) {
    if (isLeaf(edge.node)) {
      node.edges[prefix] = {
        prefix: path,
        node: {
          data,
        },
      }
    } else {
      // Given the context non leaf node cannot contain data.
      throw Error('Unreachable')
    }
  } else {
    const edgePath = edge.prefix
    const commonPrefix = getCommonPrefix(edgePath, path)
    const commonPrefixLen = commonPrefix.length
    if (valuesEqual(edgePath, commonPrefix)) {
      if (isLeaf(edge.node)) {
        // Given context cannot have data in mid tree
        throw Error('Unreachable')
      }
      insert(edge.node, path.slice(commonPrefixLen), data)
      return
    } else if (valuesEqual(path, commonPrefix)) {
      // Given context cannot have data in mid tree
      throw Error('Bad state')
    }
    const midNode: Node<T> = { edges: [] }
    const newEdge: Edge<T> = {
      prefix: commonPrefix,
      node: midNode,
    }
    midNode.edges[edgePath[commonPrefixLen]] = {
      node: edge.node,
      prefix: edgePath.slice(commonPrefixLen),
    }
    midNode.edges[path[commonPrefixLen]] = {
      node: {
        data,
      },
      prefix: path.slice(commonPrefixLen),
    }
    node.edges[prefix] = newEdge
  }
}

function lookUp<T>(
  node: Node<T>,
  path: number[]
): { value: T; path: number[] } {
  const prefix = path[0]
  const edge = node.edges[prefix]
  if (edge === undefined) {
    throw Error('Path not found')
  }

  if (isLeaf(edge.node)) {
    const commonPrefix = getCommonPrefix(edge.prefix, path)
    if (commonPrefix.length === edge.prefix.length) {
      return { value: edge.node.data, path: edge.prefix }
    }

    throw Error('Path not found')
  }

  if (!isPrefixOf(edge.prefix, path)) {
    throw Error('Path not found')
  }

  const edgePrefLen = edge.prefix.length
  const res = lookUp(edge.node, path.slice(edgePrefLen))
  return { value: res.value, path: path.slice(0, edgePrefLen).concat(res.path) }
}

function getCommonPrefix(a: number[], b: number[]): number[] {
  let i = 0
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) {
    i++
  }

  return a.slice(0, i)
}

function valuesEqual(a: number[], b: number[]): boolean {
  return (
    a.length === b.length &&
    a.map((x, i) => [x, b[i]]).every(y => y[0] === y[1])
  )
}

function isPrefixOf(prefix: number[], value: number[]): boolean {
  if (prefix.length > value.length) return false

  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] !== value[i]) return false
  }

  return true
}
