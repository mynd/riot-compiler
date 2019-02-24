import {TAG_LOGIC_PROPERTY} from '../../constants'
import addLinesOffset from '../../utils/add-lines-offset'
import generateAST from '../../utils/generate-ast'
import getPreprocessorTypeByAttribute from '../../utils/get-preprocessor-type-by-attribute'
import isEmptySourcemap from '../../utils/is-empty-sourcemap'
import {isExportDefaultStatement} from '../../utils/ast-nodes-checks'
import preprocess from '../../utils/preprocess-node'
import sourcemapToJSON from '../../utils/sourcemap-as-json'
import {types} from '../../utils/build-types'

/**
 * Find the export default statement
 * @param   { Array } body - tree structure containing the program code
 * @returns { Object } node containing only the code of the export default statement
 */
function findExportDefaultStatement(body) {
  return body.find(isExportDefaultStatement)
}

/**
 * Find all the code in an ast program except for the export default statements
 * @param   { Array } body - tree structure containing the program code
 * @returns { Array } array containing all the program code except the export default expressions
 */
function filterNonExportDefaultStatements(body) {
  return body.filter(node => !isExportDefaultStatement(node))
}

/**
 * Get the body of the AST structure
 * @param   { Object } ast - ast object generated by recast
 * @returns { Array } array containing the program code
 */
function getProgramBody(ast) {
  return ast.body || ast.program.body
}

/**
 * Extend the AST adding the new tag method containing our tag sourcecode
 * @param   { Object } ast - current output ast
 * @param   { Object } exportDefaultNode - tag export default node
 * @returns { Object } the output ast having the "tag" key extended with the content of the export default
 */
function extendTagProperty(ast, exportDefaultNode) {
  types.visit(ast, {
    visitProperty(path) {
      if (path.value.key.value === TAG_LOGIC_PROPERTY) {
        path.value.value = exportDefaultNode.declaration
        return false
      }

      this.traverse(path)
    }
  })

  return ast
}

/**
 * Generate the component javascript logic
 * @param   { Object } sourceNode - node generated by the riot compiler
 * @param   { string } source - original component source code
 * @param   { Object } meta - compilation meta information
 * @param   { AST } ast - current AST output
 * @returns { AST } the AST generated
 */
export default function javascript(sourceNode, source, meta, ast) {
  const preprocessorName = getPreprocessorTypeByAttribute(sourceNode)
  const javascriptNode = addLinesOffset(sourceNode.text.text, source, sourceNode)
  const { options } = meta
  const preprocessorOutput = preprocess('javascript', preprocessorName, meta, source, {
    ...sourceNode,
    text: javascriptNode
  })
  const inputSourceMap = sourcemapToJSON(preprocessorOutput.map)
  const generatedAst = generateAST(preprocessorOutput.code, {
    sourceFileName: options.file,
    inputSourceMap: isEmptySourcemap(inputSourceMap) ? null : inputSourceMap
  })
  const generatedAstBody = getProgramBody(generatedAst)
  const bodyWithoutExportDefault = filterNonExportDefaultStatements(generatedAstBody)
  const exportDefaultNode = findExportDefaultStatement(generatedAstBody)
  const outputBody = getProgramBody(ast)

  // add to the ast the "private" javascript content of our tag script node
  outputBody.unshift(...bodyWithoutExportDefault)

  // convert the export default adding its content to the "tag" property exported
  if (exportDefaultNode) extendTagProperty(ast, exportDefaultNode)

  return ast
}