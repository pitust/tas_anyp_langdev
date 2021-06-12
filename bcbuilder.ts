import { abort, ast, Node } from "./index";

type V

interface Context {
    regs: Map<symbol, VMValue>
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
        
    }

    abort('Unknown op ' + o.name)
}

writeOp(ast)