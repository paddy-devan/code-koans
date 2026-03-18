"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
function json(data, init) {
    return new Response(JSON.stringify(data), __assign(__assign({}, init), { headers: __assign({ "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }, init === null || init === void 0 ? void 0 : init.headers) }));
}
function buildProgressSnapshot(db) {
    return __awaiter(this, void 0, void 0, function () {
        var completedRows, attemptRows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db
                        .prepare("SELECT koan_id FROM progress WHERE completed = 1 ORDER BY koan_id ASC")
                        .all()];
                case 1:
                    completedRows = _a.sent();
                    return [4 /*yield*/, db
                            .prepare("SELECT koan_id, COUNT(*) AS attempt_count FROM submission_attempts GROUP BY koan_id ORDER BY koan_id ASC")
                            .all()];
                case 2:
                    attemptRows = _a.sent();
                    return [2 /*return*/, {
                            completedKoanIds: completedRows.results.map(function (row) { return row.koan_id; }),
                            attemptCounts: Object.fromEntries(attemptRows.results.map(function (row) { return [row.koan_id, Number(row.attempt_count)]; })),
                        }];
            }
        });
    });
}
exports.default = {
    fetch: function (request, env) {
        return __awaiter(this, void 0, void 0, function () {
            var url, _a, payload, timestamp, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = new URL(request.url);
                        if (request.method === "OPTIONS") {
                            return [2 /*return*/, json(null, { status: 204 })];
                        }
                        if (!(request.method === "GET" && url.pathname === "/api/progress")) return [3 /*break*/, 2];
                        _a = json;
                        return [4 /*yield*/, buildProgressSnapshot(env.DB)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_c.sent()])];
                    case 2:
                        if (!(request.method === "POST" && url.pathname === "/api/submissions")) return [3 /*break*/, 6];
                        return [4 /*yield*/, request.json()];
                    case 3:
                        payload = (_c.sent());
                        if (typeof payload.koanId !== "string" || typeof payload.passed !== "boolean") {
                            return [2 /*return*/, json({ error: "Invalid submission payload." }, { status: 400 })];
                        }
                        timestamp = new Date().toISOString();
                        return [4 /*yield*/, env.DB.batch(__spreadArray([
                                env.DB
                                    .prepare("INSERT INTO submission_attempts (koan_id, passed, created_at) VALUES (?1, ?2, ?3)")
                                    .bind(payload.koanId, payload.passed ? 1 : 0, timestamp)
                            ], (payload.passed
                                ? [
                                    env.DB
                                        .prepare("INSERT INTO progress (koan_id, completed, completed_at) VALUES (?1, 1, ?2) ON CONFLICT(koan_id) DO UPDATE SET completed = 1, completed_at = excluded.completed_at")
                                        .bind(payload.koanId, timestamp),
                                ]
                                : []), true))];
                    case 4:
                        _c.sent();
                        _b = json;
                        return [4 /*yield*/, buildProgressSnapshot(env.DB)];
                    case 5: return [2 /*return*/, _b.apply(void 0, [_c.sent()])];
                    case 6: return [2 /*return*/, json({ error: "Not found." }, { status: 404 })];
                }
            });
        });
    },
};
