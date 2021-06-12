import { ast } from "./index";

interface Context {}

abstract class Opcode {
    interpret(ctx: Context): void
}