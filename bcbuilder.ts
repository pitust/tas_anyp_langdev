import { ast } from "./index";

interface Context {}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract str
}