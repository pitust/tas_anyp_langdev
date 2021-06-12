import { ast, Node } from "./index";

interface Context {}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract string(): string
}

// class Meme extends Opcode {

// }

function writeOp(o: Node) {

}