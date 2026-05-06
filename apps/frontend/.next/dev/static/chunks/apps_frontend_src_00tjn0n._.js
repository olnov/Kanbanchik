(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/frontend/src/components/board/Board.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "addCard": "Board-module__F_mqwa__addCard",
  "board": "Board-module__F_mqwa__board",
});
}),
"[project]/apps/frontend/src/components/board/Column.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "cards": "Column-module__bUP_Nq__cards",
  "column": "Column-module__bUP_Nq__column",
  "count": "Column-module__bUP_Nq__count",
  "header": "Column-module__bUP_Nq__header",
  "title": "Column-module__bUP_Nq__title",
});
}),
"[project]/apps/frontend/src/components/board/Card.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "assignee": "Card-module__luDDoW__assignee",
  "badges": "Card-module__luDDoW__badges",
  "card": "Card-module__luDDoW__card",
  "footer": "Card-module__luDDoW__footer",
  "summary": "Card-module__luDDoW__summary",
});
}),
"[project]/apps/frontend/src/components/ui/Badge.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "badge": "Badge-module__801H-a__badge",
  "bug": "Badge-module__801H-a__bug",
  "high": "Badge-module__801H-a__high",
  "low": "Badge-module__801H-a__low",
  "medium": "Badge-module__801H-a__medium",
  "story": "Badge-module__801H-a__story",
  "task": "Badge-module__801H-a__task",
});
}),
"[project]/apps/frontend/src/components/ui/Badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Badge.module.css [app-client] (css module)");
;
;
function Badge({ value, variant = 'type' }) {
    const cls = variant === 'priority' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][value.toLowerCase()] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][value.toLowerCase()];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badge} ${cls ?? ''}`,
        children: value
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/ui/Badge.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/board/Card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hello$2d$pangea$2b$dnd$40$18$2e$0$2e$1_$40$t_50e1c0038277742193395ecb284f31a1$2f$node_modules$2f40$hello$2d$pangea$2f$dnd$2f$dist$2f$dnd$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@hello-pangea+dnd@18.0.1_@t_50e1c0038277742193395ecb284f31a1/node_modules/@hello-pangea/dnd/dist/dnd.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Card.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Badge.tsx [app-client] (ecmascript)");
;
;
;
;
function Card({ card, index, assignee, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hello$2d$pangea$2b$dnd$40$18$2e$0$2e$1_$40$t_50e1c0038277742193395ecb284f31a1$2f$node_modules$2f40$hello$2d$pangea$2f$dnd$2f$dist$2f$dnd$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Draggable"], {
        draggableId: card.id,
        index: index,
        children: (provided, snapshot)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: provided.innerRef,
                ...provided.draggableProps,
                ...provided.dragHandleProps,
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].card,
                style: {
                    ...provided.draggableProps.style,
                    opacity: snapshot.isDragging ? 0.85 : 1,
                    zIndex: snapshot.isDragging ? 1000 : 'auto'
                },
                onClick: ()=>onClick(card),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].summary,
                        children: card.summary
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].footer,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].badges,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        value: card.priority,
                                        variant: "priority"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                                        lineNumber: 32,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        value: card.type,
                                        variant: "type"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                                        lineNumber: 33,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                                lineNumber: 31,
                                columnNumber: 13
                            }, this),
                            assignee && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].assignee,
                                title: assignee.name,
                                children: assignee.name.slice(0, 2).toUpperCase()
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                                lineNumber: 36,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
                lineNumber: 17,
                columnNumber: 9
            }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/board/Card.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = Card;
var _c;
__turbopack_context__.k.register(_c, "Card");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/board/AddCardButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AddCardButton",
    ()=>AddCardButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Board$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Board.module.css [app-client] (css module)");
;
;
function AddCardButton({ onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Board$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].addCard,
        onClick: onClick,
        children: "+ Add card"
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/board/AddCardButton.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = AddCardButton;
var _c;
__turbopack_context__.k.register(_c, "AddCardButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/board/Column.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Column",
    ()=>Column
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hello$2d$pangea$2b$dnd$40$18$2e$0$2e$1_$40$t_50e1c0038277742193395ecb284f31a1$2f$node_modules$2f40$hello$2d$pangea$2f$dnd$2f$dist$2f$dnd$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@hello-pangea+dnd@18.0.1_@t_50e1c0038277742193395ecb284f31a1/node_modules/@hello-pangea/dnd/dist/dnd.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Column.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AddCardButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/AddCardButton.tsx [app-client] (ecmascript)");
;
;
;
;
;
const COLUMN_COLORS = {
    0: {
        bg: 'rgb(248 249 255 / 82%)',
        color: 'var(--color-indigo)'
    },
    1: {
        bg: 'rgb(255 247 237 / 82%)',
        color: 'var(--color-amber)'
    },
    2: {
        bg: 'rgb(253 244 255 / 82%)',
        color: 'var(--color-purple)'
    },
    3: {
        bg: 'rgb(240 253 244 / 82%)',
        color: 'var(--color-green)'
    }
};
function Column({ stage, stageIndex, cards, users, onCardClick, onAddCard }) {
    const colors = COLUMN_COLORS[stageIndex % 4];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].column,
        style: {
            background: colors.bg
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].title,
                        style: {
                            color: colors.color
                        },
                        children: stage.name
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].count,
                        children: cards.length
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hello$2d$pangea$2b$dnd$40$18$2e$0$2e$1_$40$t_50e1c0038277742193395ecb284f31a1$2f$node_modules$2f40$hello$2d$pangea$2f$dnd$2f$dist$2f$dnd$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Droppable"], {
                droppableId: stage.id,
                children: (provided)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: provided.innerRef,
                        ...provided.droppableProps,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cards,
                        children: [
                            cards.map((card, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    card: card,
                                    index: i,
                                    assignee: users.find((u)=>u.id === card.assigneeId),
                                    onClick: onCardClick
                                }, card.id, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                                    lineNumber: 40,
                                    columnNumber: 15
                                }, this)),
                            provided.placeholder
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AddCardButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddCardButton"], {
                onClick: ()=>onAddCard(stage.id)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/board/Column.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c = Column;
var _c;
__turbopack_context__.k.register(_c, "Column");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/board/Board.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Board",
    ()=>Board
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hello$2d$pangea$2b$dnd$40$18$2e$0$2e$1_$40$t_50e1c0038277742193395ecb284f31a1$2f$node_modules$2f40$hello$2d$pangea$2f$dnd$2f$dist$2f$dnd$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@hello-pangea+dnd@18.0.1_@t_50e1c0038277742193395ecb284f31a1/node_modules/@hello-pangea/dnd/dist/dnd.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Board$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Board.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Column.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function Board({ data: initialData, users, onCardClick, onAddCard }) {
    _s();
    const [cards, setCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData.cards);
    const { stages } = initialData;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Board.useEffect": ()=>{
            setCards(initialData.cards);
        }
    }["Board.useEffect"], [
        initialData.cards
    ]);
    const onDragEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Board.useCallback[onDragEnd]": async (result)=>{
            const { source, destination, draggableId } = result;
            if (!destination) return;
            if (source.droppableId === destination.droppableId && source.index === destination.index) return;
            setCards({
                "Board.useCallback[onDragEnd]": (prev)=>{
                    const updated = prev.filter({
                        "Board.useCallback[onDragEnd].updated": (c)=>c.id !== draggableId
                    }["Board.useCallback[onDragEnd].updated"]);
                    const moved = {
                        ...prev.find({
                            "Board.useCallback[onDragEnd]": (c)=>c.id === draggableId
                        }["Board.useCallback[onDragEnd]"]),
                        stageId: destination.droppableId
                    };
                    const targetCards = updated.filter({
                        "Board.useCallback[onDragEnd].targetCards": (c)=>c.stageId === destination.droppableId
                    }["Board.useCallback[onDragEnd].targetCards"]);
                    targetCards.splice(destination.index, 0, moved);
                    const otherCards = updated.filter({
                        "Board.useCallback[onDragEnd].otherCards": (c)=>c.stageId !== destination.droppableId
                    }["Board.useCallback[onDragEnd].otherCards"]);
                    return [
                        ...otherCards,
                        ...targetCards.map({
                            "Board.useCallback[onDragEnd]": (c, i)=>({
                                    ...c,
                                    order: i * 100
                                })
                        }["Board.useCallback[onDragEnd]"])
                    ];
                }
            }["Board.useCallback[onDragEnd]"]);
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].moveCard(draggableId, destination.droppableId, destination.index);
            } catch  {
                setCards(initialData.cards);
            }
        }
    }["Board.useCallback[onDragEnd]"], [
        initialData.cards
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hello$2d$pangea$2b$dnd$40$18$2e$0$2e$1_$40$t_50e1c0038277742193395ecb284f31a1$2f$node_modules$2f40$hello$2d$pangea$2f$dnd$2f$dist$2f$dnd$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DragDropContext"], {
        onDragEnd: onDragEnd,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Board$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].board,
            children: stages.map((stage, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Column$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Column"], {
                    stage: stage,
                    stageIndex: i,
                    cards: cards.filter((c)=>c.stageId === stage.id).sort((a, b)=>a.order - b.order),
                    users: users,
                    onCardClick: onCardClick,
                    onAddCard: onAddCard
                }, stage.id, false, {
                    fileName: "[project]/apps/frontend/src/components/board/Board.tsx",
                    lineNumber: 53,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/frontend/src/components/board/Board.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/board/Board.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(Board, "WfJNm+bgp1URHlMzTTAghlHY5Ds=");
_c = Board;
var _c;
__turbopack_context__.k.register(_c, "Board");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/ui/Modal.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "close": "Modal-module__aCH_9W__close",
  "header": "Modal-module__aCH_9W__header",
  "modal": "Modal-module__aCH_9W__modal",
  "overlay": "Modal-module__aCH_9W__overlay",
  "title": "Modal-module__aCH_9W__title",
});
}),
"[project]/apps/frontend/src/components/ui/Modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>Modal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Modal.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Modal({ title, onClose, children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            const handler = {
                "Modal.useEffect.handler": (e)=>{
                    if (e.key === 'Escape') onClose();
                }
            }["Modal.useEffect.handler"];
            document.addEventListener('keydown', handler);
            return ({
                "Modal.useEffect": ()=>document.removeEventListener('keydown', handler)
            })["Modal.useEffect"];
        }
    }["Modal.useEffect"], [
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].overlay,
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modal,
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].title,
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/ui/Modal.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].close,
                            onClick: onClose,
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/ui/Modal.tsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/ui/Modal.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/ui/Modal.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/ui/Modal.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_s(Modal, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Modal;
var _c;
__turbopack_context__.k.register(_c, "Modal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/ui/Button.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "button": "Button-module__FnIB6G__button",
  "danger": "Button-module__FnIB6G__danger",
  "ghost": "Button-module__FnIB6G__ghost",
  "primary": "Button-module__FnIB6G__primary",
});
}),
"[project]/apps/frontend/src/components/ui/Button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Button.module.css [app-client] (css module)");
;
;
function Button({ variant = 'primary', className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].button} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][variant]} ${className ?? ''}`,
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/ui/Button.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = Button;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/board/CardModal.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "field": "CardModal-module__BSwb9a__field",
  "footer": "CardModal-module__BSwb9a__footer",
  "form": "CardModal-module__BSwb9a__form",
  "input": "CardModal-module__BSwb9a__input",
  "label": "CardModal-module__BSwb9a__label",
  "row": "CardModal-module__BSwb9a__row",
  "select": "CardModal-module__BSwb9a__select",
  "textarea": "CardModal-module__BSwb9a__textarea",
});
}),
"[project]/apps/frontend/src/components/board/CardModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CardModal",
    ()=>CardModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/CardModal.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function CardModal({ card, stageId, projectId, users, onClose, onSave, onDelete }) {
    _s();
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(card?.summary ?? '');
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(card?.description ?? '');
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(card?.type ?? 'task');
    const [priority, setPriority] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(card?.priority ?? 'medium');
    const [assigneeId, setAssigneeId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(card?.assigneeId ?? '');
    const [dueDate, setDueDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(card?.dueDate ?? '');
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSave = async ()=>{
        setSaving(true);
        await onSave({
            ...card ?? {},
            id: card?.id,
            summary,
            description: description || null,
            type,
            priority,
            assigneeId: assigneeId || null,
            dueDate: dueDate || null,
            stageId: card?.stageId ?? stageId,
            projectId: card?.projectId ?? projectId
        });
        setSaving(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        title: card ? 'Edit Card' : 'New Card',
        onClose: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].form,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].field,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                            children: "Summary"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                            value: summary,
                            onChange: (e)=>setSummary(e.target.value),
                            placeholder: "What needs to be done?",
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].field,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                            children: "Description"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 60,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textarea,
                            value: description ?? '',
                            onChange: (e)=>setDescription(e.target.value),
                            placeholder: "Add more details…"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].row,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].field,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                    children: "Type"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].select,
                                    value: type,
                                    onChange: (e)=>setType(e.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "task",
                                            children: "Task"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 73,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "story",
                                            children: "Story"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 74,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "bug",
                                            children: "Bug"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 75,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].field,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                    children: "Priority"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].select,
                                    value: priority,
                                    onChange: (e)=>setPriority(e.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "high",
                                            children: "High"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 81,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "medium",
                                            children: "Medium"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 82,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "low",
                                            children: "Low"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].row,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].field,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                    children: "Assignee"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].select,
                                    value: assigneeId,
                                    onChange: (e)=>setAssigneeId(e.target.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Unassigned"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this),
                                        users.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: u.id,
                                                children: u.name
                                            }, u.id, false, {
                                                fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                                lineNumber: 94,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].field,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                    children: "Due Date"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                    value: dueDate ?? '',
                                    onChange: (e)=>setDueDate(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].footer,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: card && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "danger",
                                onClick: ()=>onDelete(card.id),
                                children: "Delete"
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 8
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: onClose,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: handleSave,
                                    disabled: !summary.trim() || saving,
                                    children: saving ? 'Saving…' : 'Save'
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/board/CardModal.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(CardModal, "MmcWuwTlVOOuJEYaQ1csgBqlsDI=");
_c = CardModal;
var _c;
__turbopack_context__.k.register(_c, "CardModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/components/board/AiImportModal.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "draft": "AiImportModal-module__AccWDq__draft",
  "draftContent": "AiImportModal-module__AccWDq__draftContent",
  "draftDesc": "AiImportModal-module__AccWDq__draftDesc",
  "draftSummary": "AiImportModal-module__AccWDq__draftSummary",
  "drafts": "AiImportModal-module__AccWDq__drafts",
  "footer": "AiImportModal-module__AccWDq__footer",
  "remove": "AiImportModal-module__AccWDq__remove",
  "stageSelect": "AiImportModal-module__AccWDq__stageSelect",
  "textarea": "AiImportModal-module__AccWDq__textarea",
});
}),
"[project]/apps/frontend/src/components/board/AiImportModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AiImportModal",
    ()=>AiImportModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/AiImportModal.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function AiImportModal({ projectId, stages, onClose, onConfirm }) {
    _s();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [drafts, setDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [targetStageId, setTargetStageId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(stages[0]?.id ?? '');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleImport = async ()=>{
        setLoading(true);
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].importSpec(text);
        setDrafts(result);
        setLoading(false);
    };
    const handleRemove = (index)=>{
        setDrafts((prev)=>prev?.filter((_, i)=>i !== index) ?? null);
    };
    const handleConfirm = async ()=>{
        if (!drafts) return;
        setLoading(true);
        await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].confirmImport(projectId, targetStageId, drafts);
        await onConfirm();
        setLoading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        title: "Import from Spec",
        onClose: onClose,
        children: !drafts ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                        marginBottom: 12
                    },
                    children: "Paste your project specification or requirements below. The AI will generate cards from it."
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 47,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textarea,
                    value: text,
                    onChange: (e)=>setText(e.target.value),
                    placeholder: "Paste spec text here…"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 50,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].footer,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            onClick: onClose,
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleImport,
                            disabled: text.length < 10 || loading,
                            children: loading ? 'Generating…' : 'Generate Cards'
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 56,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                        marginBottom: 8
                    },
                    children: "Review the generated cards. Remove any you don't need, then confirm to add them to the board."
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 65,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                color: 'var(--color-text-muted)',
                                display: 'block',
                                marginBottom: 6
                            },
                            children: "Add to stage"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stageSelect,
                            value: targetStageId,
                            onChange: (e)=>setTargetStageId(e.target.value),
                            children: stages.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s.id,
                                    children: s.name
                                }, s.id, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                    lineNumber: 73,
                                    columnNumber: 34
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].drafts,
                    children: drafts.map((draft, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].draft,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].draftContent,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].draftSummary,
                                            children: draft.summary
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                            lineNumber: 80,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].draftDesc,
                                            children: draft.description
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                            lineNumber: 81,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 6,
                                                marginTop: 6
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    value: draft.priority,
                                                    variant: "priority"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    value: draft.type,
                                                    variant: "type"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                                    lineNumber: 84,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                            lineNumber: 82,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                    lineNumber: 79,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].remove,
                                    onClick: ()=>handleRemove(i),
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                                    lineNumber: 87,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 78,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 76,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].footer,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            onClick: ()=>setDrafts(null),
                            children: "Back"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleConfirm,
                            disabled: drafts.length === 0 || loading,
                            children: loading ? 'Creating…' : `Add ${drafts.length} card${drafts.length !== 1 ? 's' : ''}`
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
                    lineNumber: 91,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/board/AiImportModal.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_s(AiImportModal, "j19dXh+jeP02OZXkgpG9/t1Jd6g=");
_c = AiImportModal;
var _c;
__turbopack_context__.k.register(_c, "AiImportModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/frontend/src/app/projects/[id]/board/page.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actions": "page-module__qZv-5q__actions",
  "header": "page-module__qZv-5q__header",
  "heading": "page-module__qZv-5q__heading",
  "page": "page-module__qZv-5q__page",
  "status": "page-module__qZv-5q__status",
});
}),
"[project]/apps/frontend/src/app/projects/[id]/board/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BoardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Board$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/Board.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/CardModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/board/AiImportModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/app/projects/[id]/board/page.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function BoardPage({ params }) {
    _s();
    const { id } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["use"])(params);
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCard, setSelectedCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [addToStage, setAddToStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showAiImport, setShowAiImport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const loadBoard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "BoardPage.useCallback[loadBoard]": async ()=>{
            try {
                const [board, allUsers] = await Promise.all([
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getBoard(id),
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getUsers()
                ]);
                setData(board);
                setUsers(allUsers);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load board');
            }
        }
    }["BoardPage.useCallback[loadBoard]"], [
        id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BoardPage.useEffect": ()=>{
            loadBoard();
        }
    }["BoardPage.useEffect"], [
        loadBoard
    ]);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].status,
        children: error
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
        lineNumber: 39,
        columnNumber: 21
    }, this);
    if (!data) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].status,
        children: "Loading..."
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
        lineNumber: 40,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].page,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heading,
                        children: data.project.name
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$app$2f$projects$2f5b$id$5d2f$board$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actions,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            onClick: ()=>setShowAiImport(true),
                            children: "Import from spec"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$Board$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Board"], {
                data: data,
                users: users,
                onCardClick: setSelectedCard,
                onAddCard: setAddToStage
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            selectedCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardModal"], {
                card: selectedCard,
                users: users,
                onClose: ()=>setSelectedCard(null),
                onSave: async (updated)=>{
                    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateCard(updated.id, updated);
                    setSelectedCard(null);
                    loadBoard();
                },
                onDelete: async (cardId)=>{
                    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].deleteCard(cardId);
                    setSelectedCard(null);
                    loadBoard();
                }
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this),
            addToStage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$CardModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardModal"], {
                card: null,
                stageId: addToStage,
                projectId: id,
                users: users,
                onClose: ()=>setAddToStage(null),
                onSave: async (newCard)=>{
                    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].createCard(newCard);
                    setAddToStage(null);
                    loadBoard();
                },
                onDelete: async ()=>{
                    setAddToStage(null);
                }
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                lineNumber: 79,
                columnNumber: 9
            }, this),
            showAiImport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$board$2f$AiImportModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AiImportModal"], {
                projectId: id,
                stages: data.stages,
                onClose: ()=>setShowAiImport(false),
                onConfirm: async ()=>{
                    setShowAiImport(false);
                    loadBoard();
                }
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/app/projects/[id]/board/page.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(BoardPage, "W7vSlm/x+ny0E9InrdV4HWi8WgU=");
_c = BoardPage;
var _c;
__turbopack_context__.k.register(_c, "BoardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_frontend_src_00tjn0n._.js.map