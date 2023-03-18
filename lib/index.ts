import {
    createLogger,
    format,
    transports,
    type Logger as ILogger,
    type transport
} from "winston";
import "winston-daily-rotate-file";
// eslint-disable-next-line unicorn/import-style
import chalk, { type ChalkInstance } from "chalk";

const DefaultColors = {
    error: chalk.redBright,
    warn:  chalk.yellowBright,
    info:  chalk.greenBright,
    debug: chalk.cyanBright
};
const noop = (str: string) => str;

export default class Logger {
    private static _colors: Record<string, ChalkInstance> = DefaultColors;
    private static _log: ILogger;
    static {
        this._log = createLogger({
            level:  "debug",
            levels: {
                error: 0,
                warn:  1,
                info:  2,
                debug: 3
            },
            transports: [
                new transports.Console({
                    format: this._getFormat()
                })
            ]
        });
    }

    static get debug() {
        return this._log.debug.bind(this._log);
    }

    static get error() {
        return this._log.error.bind(this._log);
    }

    static get info() {
        return this._log.info.bind(this._log);
    }

    static get warn() {
        return this._log.warn.bind(this._log);
    }

    private static _getFormat(colors = true) {
        return format.combine(
            format.splat(),
            format.errors({ stack: true }),
            format.printf(({ level, message, name, stack }) => {
                if (stack){
                    message = String(stack).split("\n")[0].split(":")[1].trim() === message ? String(stack) : `${String(message)}\n${String(stack)}`;
                }

                return (colors ? this._colors[level] ?? noop : noop)?.(`${this._getTimestamp()} [${level.toUpperCase()}]${Array.isArray(name) ? name.map(val => `[${String(val)}]`).join(",") : ""} ${String(message)}`);
            })
        );
    }

    private static _getTimestamp() {
        const d = new Date();
        return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
    }

    static _addTransport(transport: transport) {
        this._log.add(transport);
        return this;
    }

    static _removeTransport(transport: transport) {
        this._log.remove(transport);
    }

    static _saveToFile(file: string) {
        return this._addTransport(new transports.File({
            filename: file,
            format:   this._getFormat(false)
        }));
    }

    static _saveToRotatingFile(directory: string) {
        return this._addTransport(new transports.DailyRotateFile({
            dirname:       directory,
            filename:      "%DATE%.log",
            datePattern:   "MM-DD-YYYY",
            createSymlink: true,
            format:        this._getFormat(false)
        }));
    }

    static _setColors(colors: Record<string, ChalkInstance>) {
        this._colors = colors;
        return this;
    }

    static _setLevels(levels: Record<string, number>) {
        this._log.levels = levels;
        return this;
    }

    static getLogger(name: string, ...names: Array<string>) {
        return this._log.child({ name: [name, ...names] });
    }
}
