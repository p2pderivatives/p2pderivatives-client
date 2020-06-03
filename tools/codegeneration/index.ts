import {
  Project,
  Type,
  ts,
  createWrappedNode,
  InterfaceDeclaration,
  StructureKind,
} from 'ts-morph'
import util from 'util'

const project = new Project({
  tsConfigFilePath: '../../tsconfig.json',
})

function hasBaseType(
  currentType: Type<ts.Type>,
  targetType: Type<ts.Type>
): { has: boolean; closestParent: Type<ts.Type> | null } {
  const targetSymbolName = targetType.getSymbol().getName()
  let has = false
  let closestParent = null
  for (let baseType of currentType.getBaseTypes()) {
    if (baseType.getSymbol().getName() === targetSymbolName) {
      return { has: true, closestParent: baseType }
    }

    const result = hasBaseType(baseType, targetType)

    has = has || result.has
    closestParent = has ? baseType : closestParent
  }

  return { has: has, closestParent: closestParent }
}

function writeClassForContractInterface(
  interfaceDec: InterfaceDeclaration,
  parentType: Type<ts.Type>
) {
  const className = interfaceDec
    .getSymbol()
    .getName()
    .replace('Props', '')
  const file = project.createSourceFile('./test.ts')
  const classDec = file.addClass({
    name: className,
  })

  const interfaceProps = interfaceDec.getProperties()
  const constructor = classDec.addConstructor()
  interfaceProps.forEach(prop => {
    constructor.addParameter({
      name: prop.getName(),
      type: prop
        .getType()
        .getSymbol()
        .getName(),
      isReadonly: true,
    })
  })

  constructor.addParameter({
    name,
  })

  console.log(interfaceDec.getProperties())
}

const typeChecker = project.getProgram().getTypeChecker().compilerObject

const initialContract = project.getSourceFile('InitialContract.ts')
const initialNode = initialContract.getInterface('InitialContractProps')
  .compilerNode
const initialInterfaceDec = createWrappedNode(initialNode, {
  typeChecker: typeChecker,
})

const initialType = initialInterfaceDec.getType()

const contractSourceFiles = project.getSourceFile('AcceptedContract.ts')

const interfaceNode = contractSourceFiles.getInterfaces()[0].compilerNode

const interfaceDec = createWrappedNode(interfaceNode, {
  typeChecker: typeChecker,
}) as InterfaceDeclaration

console.log(interfaceDec.getSymbol().getName())

const secType = interfaceDec.getType()

let result = hasBaseType(secType, initialType)
console.log(result.closestParent.getSymbol().getName())

writeClassForContractInterface(interfaceDec, result.closestParent)
