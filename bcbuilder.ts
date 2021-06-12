import { abort, ast, Node } from "./index";

interface Context {}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract string(): string
}

// class Meme extends Opcode {

// }

const out: Opcode[] = []

function writeOp(o: Node) {
    if (o.name == 'RootStmt') {
        writeOp(o.children.stmt)
    }

    abort('Unknown op ' + o.name)
}

writeOp(ast)