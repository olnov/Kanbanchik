module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/apps/frontend/src/lib/user-context.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStoredUserId",
    ()=>getStoredUserId,
    "setStoredUserId",
    ()=>setStoredUserId
]);
const USER_KEY = 'kanbanchik_user_id';
function getStoredUserId() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function setStoredUserId(id) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
}),
"[project]/apps/frontend/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$user$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/user-context.ts [app-ssr] (ecmascript)");
;
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
let usersRequestPromise = null;
let usersCache = null;
class ApiError extends Error {
    status;
    path;
    responseText;
    constructor(status, path, responseText){
        const message = getErrorMessage(responseText);
        super(`API error ${status}: ${path}${message ? ` - ${message}` : ''}`), this.status = status, this.path = path, this.responseText = responseText;
    }
}
function getErrorMessage(responseText) {
    if (!responseText) {
        return '';
    }
    try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed.message)) {
            return parsed.message.join(', ');
        }
        if (typeof parsed.message === 'string') {
            return parsed.message;
        }
    } catch  {
    // Ignore invalid JSON and keep the raw text fallback below.
    }
    return responseText;
}
function pickValidUserId(users) {
    const storedUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$user$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStoredUserId"])();
    const validUserId = users.find((user)=>user.id === storedUserId)?.id ?? users[0]?.id ?? null;
    if (validUserId && validUserId !== storedUserId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$user$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(validUserId);
    }
    return validUserId;
}
async function fetchJson(path, init, userId) {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (userId && !headers.has('x-user-id')) {
        headers.set('x-user-id', userId);
    }
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers
    });
    if (!res.ok) {
        throw new ApiError(res.status, path, await res.text());
    }
    if (res.status === 204) return undefined;
    return res.json();
}
async function getPublicUsers(forceRefresh = false) {
    if (!forceRefresh && usersCache) {
        pickValidUserId(usersCache);
        return usersCache;
    }
    if (!forceRefresh && usersRequestPromise) {
        return usersRequestPromise;
    }
    usersRequestPromise = fetchJson('/users').then((users)=>{
        usersCache = users;
        pickValidUserId(users);
        return users;
    }).finally(()=>{
        usersRequestPromise = null;
    });
    return usersRequestPromise;
}
async function ensureUserId() {
    if ("TURBOPACK compile-time truthy", 1) {
        throw new Error('User bootstrap is only available in the browser');
    }
    const users = await getPublicUsers();
    const validUserId = pickValidUserId(users);
    if (!validUserId) {
        throw new Error('API returned no users for bootstrap');
    }
    return validUserId;
}
function isUserContextError(error) {
    if (!(error instanceof ApiError) || error.status !== 400) {
        return false;
    }
    const message = getErrorMessage(error.responseText);
    return /x-user-id|user .* not found/i.test(message);
}
async function request(path, init) {
    const userId = await ensureUserId();
    try {
        return await fetchJson(path, init, userId);
    } catch (error) {
        if (!isUserContextError(error)) {
            throw error;
        }
        usersCache = null;
        const refreshedUsers = await getPublicUsers(true);
        const refreshedUserId = pickValidUserId(refreshedUsers);
        if (!refreshedUserId) {
            throw error;
        }
        return fetchJson(path, init, refreshedUserId);
    }
}
const api = {
    getUsers: ()=>getPublicUsers(),
    getTeams: ()=>request('/teams'),
    getProjects: ()=>request('/projects'),
    createProject: (data)=>request('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    deleteProject: (id)=>request(`/projects/${id}`, {
            method: 'DELETE'
        }),
    getBoard: (projectId)=>request(`/projects/${projectId}/board`),
    createCard: (data)=>request('/cards', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    updateCard: (id, data)=>request(`/cards/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
    deleteCard: (id)=>request(`/cards/${id}`, {
            method: 'DELETE'
        }),
    moveCard: (id, stageId, order)=>request(`/cards/${id}/move`, {
            method: 'POST',
            body: JSON.stringify({
                stageId,
                order
            })
        }),
    importSpec: (text)=>request('/ai/import', {
            method: 'POST',
            body: JSON.stringify({
                text
            })
        }),
    confirmImport: (projectId, stageId, cards)=>request('/ai/confirm', {
            method: 'POST',
            body: JSON.stringify({
                projectId,
                stageId,
                cards
            })
        })
};
}),
"[project]/apps/frontend/src/components/layout/Sidebar.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "Sidebar-module__ZM0Xeq__active",
  "emptyHint": "Sidebar-module__ZM0Xeq__emptyHint",
  "errorHint": "Sidebar-module__ZM0Xeq__errorHint",
  "logo": "Sidebar-module__ZM0Xeq__logo",
  "logoLink": "Sidebar-module__ZM0Xeq__logoLink",
  "navItem": "Sidebar-module__ZM0Xeq__navItem",
  "section": "Sidebar-module__ZM0Xeq__section",
  "shell": "Sidebar-module__ZM0Xeq__shell",
  "shellCollapsed": "Sidebar-module__ZM0Xeq__shellCollapsed",
  "sidebar": "Sidebar-module__ZM0Xeq__sidebar",
  "spacer": "Sidebar-module__ZM0Xeq__spacer",
  "toggleButton": "Sidebar-module__ZM0Xeq__toggleButton",
  "topRow": "Sidebar-module__ZM0Xeq__topRow",
  "userLabel": "Sidebar-module__ZM0Xeq__userLabel",
  "userSection": "Sidebar-module__ZM0Xeq__userSection",
  "userSelect": "Sidebar-module__ZM0Xeq__userSelect",
});
}),
"[project]/apps/frontend/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sidebar",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$user$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/lib/user-context.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/layout/Sidebar.module.css [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
;
;
function Sidebar({ collapsed, onToggle }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [projects, setProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let isMounted = true;
        const loadSidebar = async ()=>{
            try {
                const nextUsers = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getUsers();
                const nextUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$user$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStoredUserId"])();
                const nextProjects = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getProjects();
                if (!isMounted) {
                    return;
                }
                setUsers(nextUsers);
                setProjects(nextProjects);
                setUserId(nextUserId);
                setLoadError(null);
            } catch (err) {
                if (isMounted) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load sidebar data');
                }
            }
        };
        loadSidebar();
        return ()=>{
            isMounted = false;
        };
    }, []);
    const handleUserChange = (e)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$lib$2f$user$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setStoredUserId"])(e.target.value);
        setUserId(e.target.value);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].shell} ${collapsed ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].shellCollapsed : ''}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebar,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].topRow,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/projects",
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logoLink,
                            "aria-label": "Kanbanchik home",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                src: "/boar.svg",
                                alt: "Kanbanchik",
                                width: 60,
                                height: 60,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logo
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].toggleButton,
                            onClick: onToggle,
                            children: "Hide"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].section,
                    children: "Projects"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                projects.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: `/projects/${p.id}/board`,
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navItem} ${pathname === `/projects/${p.id}/board` ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                        children: p.name
                    }, p.id, false, {
                        fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/projects",
                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navItem} ${pathname === '/projects' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                    children: "All Projects"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this),
                projects.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyHint,
                    children: "No projects yet. Create one on the Projects page."
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 95,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].section,
                    children: "Workspace"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/teams",
                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navItem} ${pathname === '/teams' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                    children: "Teams"
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].spacer
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].userSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].userLabel,
                            children: "Active User"
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].userSelect,
                            value: userId ?? '',
                            onChange: handleUserChange,
                            disabled: users.length === 0,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    disabled: true,
                                    children: users.length === 0 ? 'No users available' : 'Choose a user'
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, this),
                                users.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: u.id,
                                        children: [
                                            u.name,
                                            " (",
                                            u.role,
                                            ")"
                                        ]
                                    }, u.id, true, {
                                        fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                                        lineNumber: 120,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this),
                        users.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyHint,
                            children: "No users found in the current workspace."
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                            lineNumber: 126,
                            columnNumber: 13
                        }, this),
                        loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorHint,
                            children: loadError
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                            lineNumber: 128,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/src/components/layout/Sidebar.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/frontend/src/components/layout/AppShell.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "main": "AppShell-module__bKDqda__main",
  "revealButton": "AppShell-module__bKDqda__revealButton",
  "revealLogo": "AppShell-module__bKDqda__revealLogo",
  "shell": "AppShell-module__bKDqda__shell",
});
}),
"[project]/apps/frontend/src/components/layout/AppShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppShell",
    ()=>AppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.4_@babel+core@7.2_6119c53569fbedbf44ecc127098a4aaf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$AppShell$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/apps/frontend/src/components/layout/AppShell.module.css [app-ssr] (css module)");
'use client';
;
;
;
;
;
const SIDEBAR_STATE_KEY = 'kanbanchik_sidebar_collapsed';
function AppShell({ children }) {
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const storedValue = window.localStorage.getItem(SIDEBAR_STATE_KEY);
        if (storedValue === 'true') {
            setCollapsed(true);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        window.localStorage.setItem(SIDEBAR_STATE_KEY, collapsed ? 'true' : 'false');
    }, [
        collapsed
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$AppShell$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].shell,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Sidebar"], {
                collapsed: collapsed,
                onToggle: ()=>setCollapsed((value)=>!value)
            }, void 0, false, {
                fileName: "[project]/apps/frontend/src/components/layout/AppShell.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$AppShell$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].main,
                children: [
                    collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$AppShell$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].revealButton,
                        onClick: ()=>setCollapsed(false),
                        "aria-label": "Open menu",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$4_$40$babel$2b$core$40$7$2e$2_6119c53569fbedbf44ecc127098a4aaf$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            src: "/boar.svg",
                            alt: "Kanbanchik",
                            width: 60,
                            height: 60,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$src$2f$components$2f$layout$2f$AppShell$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].revealLogo
                        }, void 0, false, {
                            fileName: "[project]/apps/frontend/src/components/layout/AppShell.tsx",
                            lineNumber: 35,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/src/components/layout/AppShell.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this),
                    children
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/src/components/layout/AppShell.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/src/components/layout/AppShell.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10qb~jo._.js.map