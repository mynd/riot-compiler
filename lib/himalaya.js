'use strict'

const himalaya = require('himalaya')

const visitNode = (ctx, parent, node) => {
  ctx.visitNode(parent, node)
  traverseChildren(ctx, node, node.children)
}

const traverseChildren = (ctx, parent, children) => {
  children = children ?? []
  children.forEach((child) => {
    visitNode(ctx, parent, child)
  })
}

const traverse = (ctx, nodes) => {
  traverseChildren(ctx, null, nodes)
}

const parseInternal = (json) => {
  let id = 0
  const nodes = []
  const ctxId = {
    visitNode: (parent, node) => {
      node.parent = parent?.id
      node.id = id++
      nodes.push(node)
    },
  }
  traverse(ctxId, json)
  return {
    nodes,
    json,
  }
}

const parse = (fragmentString) => {
  const json = himalaya.parse(fragmentString)
  parseInternal(json)
  return json
}

const stringify = (dom) => {
  return himalaya.stringify(dom)
}

module.exports = {
  parse,
  stringify,
}
