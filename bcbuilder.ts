import { abort, ast, Node } from './index'
import { SmartBuffer } from 'smart-buffer'

abstract class VMValue {
    abstract string(): string
    abstract clone(): VMValue
    abstract toBytes(): Buffer
    abstract eq(other: VMValue): boolean
}
class StringVMValue extends VMValue {
    constructor(public str: string) {
        super()
    }
    string(): string {
        throw new Error('Method not implemented.')
    }
    clone(): VMValue {
        throw new Error('Method not implemented.')
    }
    toBytes(): Buffer {
        const b = new SmartBuffer()
        b.
    }
    eq(other: VMValue): boolean {
        if (other instanceof StringVMValue) return other.str == this.str
        return false
    }
}

interface Context {
    regs: Map<symbol, VMValue>
    locals: Map<symbol, VMValue>
}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract string(): string
}

const idpool = new Map<symbol, number>()
const idsrc = (
    i => () =>
        i++
)(1)
function id(s: symbol): string {
    return (
        'r' +
        idpool
            .set(s, idpool.get(s) ?? idsrc())
            .get(s)
            .toString()
    )
}

class CreateStringOpcode extends Opcode {
    interpret(ctx: Context): void {
        ctx.regs.set(this.reg, new StringVMValue(this.str))
    }
    string(): string {
        return this.strrepr
    }
    strrepr: string
    constructor(public reg: symbol, public str: string) {
        super()
        this.strrepr = `lds ${id(reg)}, ${JSON.stringify(str)}`
    }
}
class AxeTempOpcode extends Opcode {
    interpret(ctx: Context): void {
        ctx.locals.delete(this.reg)
    }
    string(): string {
        return this.str
    }
    str: string
    constructor(public reg: symbol) {
        super()
        this.str = `axe ${id(reg)}`
    }
}
class StoreOpcode extends Opcode {
    to: symbol
    str: string
    constructor(public reg: symbol, to: string) {
        super()
        this.to = Symbol.for(to)
        this.str = `str ${to}, ${id(reg)}`
    }
    interpret(ctx: Context): void {
        ctx.locals.set(this.to, ctx.regs.get(this.reg))
    }
    string(): string {
        return this.str
    }
}

const out: Opcode[] = []

function writeOp(o: Node, tgd: symbol = null) {
    if (o.name == 'RootStmt') {
        writeOp(o.children.stmt)
        writeOp(o.children.next)
        return
    }
    if (o.name == 'Let') {
        let s = Symbol('init$' + o.params.name)
        writeOp(o.children.init, s)
        out.push(new StoreOpcode(s, o.params.name))
        out.push(new AxeTempOpcode(s))
        return
    }
    if (o.name == 'StringAtom') {
        out.push(new CreateStringOpcode())
    }

    abort('Unknown op ' + o.name)
}

writeOp(ast)
