import { abort, ast, Node } from "./index";

abstract class VMValue {
    abstract string(): string
    abstract clone(): VMValue
    abstract toBytes(): Buffer
    abstract eq(other: VMValue): boolean
}

interface Context {
    regs: Map<symbol, VMValue>
    locals: Map<symbol, VMValue>
}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract string(): string
}

// class Meme extends Opcode {

// }

const out: Opcode[] = []

function writeOp(o: Node, tgd: symbol = null) {
    if (o.name == 'RootStmt') {
        writeOp(o.children.stmt)
        writeOp(o.children.next)
        return
    }
    if (o.name == 'Let') {
        let s = Symbol('init(' + o.params.name)
    }

    abort('Unknown op ' + o.name)
}

writeOp(ast)