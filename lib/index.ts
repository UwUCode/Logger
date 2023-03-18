import {
    createLogger,
    format,
    transports,
    type Logger as ILogger,
    type transport
} from "winston";
import "winston-daily-rotate-file";

export enum RawColors {
    Reset = "\u001B[0m",
    Bright = "\u001B[1m",
    Dim = "\u001B[2m",
    Underscore = "\u001B[4m",
    Blink = "\u001B[5m",
    Reverse = "\u001B[7m",
    Hidden = "\u001B[8m",

    FgBlack = "\u001B[30m",
    FgRed = "\u001B[31m",
    FgGreen = "\u001B[32m",
    FgYellow = "\u001B[33m",
    FgBlue = "\u001B[34m",
    FgMagenta = "\u001B[35m",
    FgCyan = "\u001B[36m",
    FgWhite = "\u001B[37m",

    BgBlack = "\u001B[40m",
    BgRed = "\u001B[41m",
    BgGreen = "\u001B[42m",
    BgYellow = "\u001B[43m",
    BgBlue = "\u001B[44m",
    BgMagenta = "\u001B[45m",
    BgCyan = "\u001B[46m",
    BgWhite = "\u001B[47m",
}

const DefaultColors = {
    error: RawColors.FgRed,
    warn:  RawColors.FgYellow,
    info:  RawColors.FgGreen,
    debug: RawColors.FgCyan
};

export default class Logger {
    private static _colors: Record<string, string> = DefaultColors;
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
            format.printf(({ level, message, name }) => `${colors ? (this._colors[level as "debug"] || "") : ""}${this._getTimestamp()} [${level.toUpperCase()}]${typeof name === "string" ? `[${name}]` : ""} ${String(message)}${colors ? RawColors.Reset : ""}`)
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

    static _setColors(colors: Record<string, string>) {
        this._colors = colors;
        return this;
    }

    static _setLevels(levels: Record<string, number>) {
        this._log.levels = levels;
        return this;
    }

    static getLogger(name: string) {
        return this._log.child({ name });
    }
}

Logger.getLogger("test").info("Hello", "world!");
