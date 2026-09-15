import { convert_body_inner, convert_streaming_body_inner, define_property, entries_of_object_inner, from_entries, object_get, object_set, ws_protocol } from 'data:text/javascript;base64,CmV4cG9ydCBmdW5jdGlvbiB3c19wcm90b2NvbCgpIHsKCXJldHVybiAoCiAgICAgIFsxZTddKy0xZTMrLTRlMystOGUzKy0xZTExKS5yZXBsYWNlKC9bMDE4XS9nLAogICAgICBjID0+IChjIF4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxKSlbMF0gJiAxNSA+PiBjIC8gNCkudG9TdHJpbmcoMTYpCiAgICApOwp9CgpleHBvcnQgZnVuY3Rpb24gb2JqZWN0X2dldChvYmosIGspIHsgCgl0cnkgewoJCXJldHVybiBvYmpba10KCX0gY2F0Y2goeCkgewoJCXJldHVybiB1bmRlZmluZWQKCX0KfTsKZXhwb3J0IGZ1bmN0aW9uIG9iamVjdF9zZXQob2JqLCBrLCB2KSB7Cgl0cnkgeyBvYmpba10gPSB2IH0gY2F0Y2gge30KfTsKCmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb252ZXJ0X2JvZHlfaW5uZXIoYm9keSkgewoJbGV0IHJlcSA9IG5ldyBSZXF1ZXN0KCIiLCB7IG1ldGhvZDogIlBPU1QiLCBkdXBsZXg6ICJoYWxmIiwgYm9keSB9KTsKCWxldCB0eXBlID0gcmVxLmhlYWRlcnMuZ2V0KCJjb250ZW50LXR5cGUiKTsKCXJldHVybiBbbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVxLmFycmF5QnVmZmVyKCkpLCB0eXBlXTsKfQoKZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnZlcnRfc3RyZWFtaW5nX2JvZHlfaW5uZXIoYm9keSkgewoJdHJ5IHsKCQlsZXQgcmVxID0gbmV3IFJlcXVlc3QoIiIsIHsgbWV0aG9kOiAiUE9TVCIsIGJvZHkgfSk7CgkJbGV0IHR5cGUgPSByZXEuaGVhZGVycy5nZXQoImNvbnRlbnQtdHlwZSIpOwoJCXJldHVybiBbZmFsc2UsIG5ldyBVaW50OEFycmF5KGF3YWl0IHJlcS5hcnJheUJ1ZmZlcigpKSwgdHlwZV07Cgl9IGNhdGNoKHgpIHsKCQlsZXQgcmVxID0gbmV3IFJlcXVlc3QoIiIsIHsgbWV0aG9kOiAiUE9TVCIsIGR1cGxleDogImhhbGYiLCBib2R5IH0pOwoJCWxldCB0eXBlID0gcmVxLmhlYWRlcnMuZ2V0KCJjb250ZW50LXR5cGUiKTsKCQlyZXR1cm4gW3RydWUsIHJlcS5ib2R5LCB0eXBlXTsKCX0KfQoKZXhwb3J0IGZ1bmN0aW9uIGVudHJpZXNfb2Zfb2JqZWN0X2lubmVyKG9iaikgewoJcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9iaikubWFwKHggPT4geC5tYXAoU3RyaW5nKSk7Cn0KCmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVfcHJvcGVydHkob2JqLCBrLCB2KSB7CglPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrLCB7IHZhbHVlOiB2LCB3cml0YWJsZTogZmFsc2UgfSk7Cn0KCmV4cG9ydCBmdW5jdGlvbiB3c19rZXkoKSB7CglsZXQga2V5ID0gbmV3IFVpbnQ4QXJyYXkoMTYpOwoJY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhrZXkpOwoJcmV0dXJuIGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBrZXkpKTsKfQoKZXhwb3J0IGZ1bmN0aW9uIGZyb21fZW50cmllcyhlbnRyaWVzKXsKICAgIHZhciByZXQgPSB7fTsKICAgIGZvcih2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSByZXRbZW50cmllc1tpXVswXV0gPSBlbnRyaWVzW2ldWzFdOwogICAgcmV0dXJuIHJldDsKfQo=';

let wasm;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

let heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

function wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke______(arg0, arg1) {
    wasm.wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke______(arg0, arg1);
}

function wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue______1_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue______1_(arg0, arg1, addHeapObject(arg2));
}

function wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue_____(arg0, arg1, arg2) {
    wasm.wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue_____(arg0, arg1, addHeapObject(arg2));
}

function wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke_______1_(arg0, arg1) {
    wasm.wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke_______1_(arg0, arg1);
}

function wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue__wasm_bindgen_424c3764b206e9a4___JsValue_____(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue__wasm_bindgen_424c3764b206e9a4___JsValue_____(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const __wbindgen_enum_BinaryType = ["blob", "arraybuffer"];

const __wbindgen_enum_ReadableStreamType = ["bytes"];

const EpoxyClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_epoxyclient_free(ptr >>> 0, 1));

const EpoxyClientOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_epoxyclientoptions_free(ptr >>> 0, 1));

const EpoxyHandlersFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_epoxyhandlers_free(ptr >>> 0, 1));

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));

export class EpoxyClient {
    toJSON() {
        return {
            redirect_limit: this.redirect_limit,
            user_agent: this.user_agent,
            buffer_size: this.buffer_size,
        };
    }
    toString() {
        return JSON.stringify(this);
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EpoxyClientFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_epoxyclient_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get redirect_limit() {
        const ret = wasm.__wbg_get_epoxyclient_redirect_limit(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set redirect_limit(arg0) {
        wasm.__wbg_set_epoxyclient_redirect_limit(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get user_agent() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_epoxyclient_user_agent(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set user_agent(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_epoxyclient_user_agent(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get buffer_size() {
        const ret = wasm.__wbg_get_epoxyclient_buffer_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set buffer_size(arg0) {
        wasm.__wbg_set_epoxyclient_buffer_size(this.__wbg_ptr, arg0);
    }
    /**
     * @param {EpoxyUrlInput} url
     * @returns {Promise<EpoxyIoStream>}
     */
    connect_tcp(url) {
        const ret = wasm.epoxyclient_connect_tcp(this.__wbg_ptr, addHeapObject(url));
        return takeObject(ret);
    }
    /**
     * @param {EpoxyUrlInput} url
     * @returns {Promise<EpoxyIoStream>}
     */
    connect_tls(url) {
        const ret = wasm.epoxyclient_connect_tls(this.__wbg_ptr, addHeapObject(url));
        return takeObject(ret);
    }
    /**
     * @param {EpoxyUrlInput} url
     * @returns {Promise<EpoxyIoStream>}
     */
    connect_udp(url) {
        const ret = wasm.epoxyclient_connect_udp(this.__wbg_ptr, addHeapObject(url));
        return takeObject(ret);
    }
    /**
     * @returns {Promise<void>}
     */
    replace_stream_provider() {
        const ret = wasm.epoxyclient_replace_stream_provider(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {EpoxyUrlInput} url
     * @param {object} options
     * @returns {Promise<Response>}
     */
    fetch(url, options) {
        const ret = wasm.epoxyclient_fetch(this.__wbg_ptr, addHeapObject(url), addHeapObject(options));
        return takeObject(ret);
    }
    /**
     * @param {EpoxyWispTransport} transport
     * @param {EpoxyClientOptions} options
     */
    constructor(transport, options) {
        _assertClass(options, EpoxyClientOptions);
        var ptr0 = options.__destroy_into_raw();
        const ret = wasm.epoxyclient_new(addHeapObject(transport), ptr0);
        if (ret[2]) {
            throw takeObject(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        EpoxyClientFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) EpoxyClient.prototype[Symbol.dispose] = EpoxyClient.prototype.free;

export class EpoxyClientOptions {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EpoxyClientOptionsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_epoxyclientoptions_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get wisp_v2() {
        const ret = wasm.__wbg_get_epoxyclientoptions_wisp_v2(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set wisp_v2(arg0) {
        wasm.__wbg_set_epoxyclientoptions_wisp_v2(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get udp_extension_required() {
        const ret = wasm.__wbg_get_epoxyclientoptions_udp_extension_required(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set udp_extension_required(arg0) {
        wasm.__wbg_set_epoxyclientoptions_udp_extension_required(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get title_case_headers() {
        const ret = wasm.__wbg_get_epoxyclientoptions_title_case_headers(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set title_case_headers(arg0) {
        wasm.__wbg_set_epoxyclientoptions_title_case_headers(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string[]}
     */
    get websocket_protocols() {
        const ret = wasm.__wbg_get_epoxyclientoptions_websocket_protocols(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string[]} arg0
     */
    set websocket_protocols(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_epoxyclientoptions_websocket_protocols(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get redirect_limit() {
        const ret = wasm.__wbg_get_epoxyclientoptions_redirect_limit(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set redirect_limit(arg0) {
        wasm.__wbg_set_epoxyclientoptions_redirect_limit(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get header_limit() {
        const ret = wasm.__wbg_get_epoxyclientoptions_header_limit(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set header_limit(arg0) {
        wasm.__wbg_set_epoxyclientoptions_header_limit(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get user_agent() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_epoxyclientoptions_user_agent(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set user_agent(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_epoxyclientoptions_user_agent(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    get disable_certificate_validation() {
        const ret = wasm.__wbg_get_epoxyclientoptions_disable_certificate_validation(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set disable_certificate_validation(arg0) {
        wasm.__wbg_set_epoxyclientoptions_disable_certificate_validation(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get buffer_size() {
        const ret = wasm.__wbg_get_epoxyclientoptions_buffer_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set buffer_size(arg0) {
        wasm.__wbg_set_epoxyclientoptions_buffer_size(this.__wbg_ptr, arg0);
    }
    constructor() {
        const ret = wasm.epoxyclientoptions_new_default();
        this.__wbg_ptr = ret >>> 0;
        EpoxyClientOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) EpoxyClientOptions.prototype[Symbol.dispose] = EpoxyClientOptions.prototype.free;

export class EpoxyHandlers {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EpoxyHandlersFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_epoxyhandlers_free(ptr, 0);
    }
    /**
     * @returns {Function}
     */
    get onopen() {
        const ret = wasm.__wbg_get_epoxyhandlers_onopen(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Function} arg0
     */
    set onopen(arg0) {
        wasm.__wbg_set_epoxyhandlers_onopen(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
     * @returns {Function}
     */
    get onclose() {
        const ret = wasm.__wbg_get_epoxyhandlers_onclose(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Function} arg0
     */
    set onclose(arg0) {
        wasm.__wbg_set_epoxyhandlers_onclose(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
     * @returns {Function}
     */
    get onerror() {
        const ret = wasm.__wbg_get_epoxyhandlers_onerror(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Function} arg0
     */
    set onerror(arg0) {
        wasm.__wbg_set_epoxyhandlers_onerror(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
     * @returns {Function}
     */
    get onmessage() {
        const ret = wasm.__wbg_get_epoxyhandlers_onmessage(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Function} arg0
     */
    set onmessage(arg0) {
        wasm.__wbg_set_epoxyhandlers_onmessage(this.__wbg_ptr, addHeapObject(arg0));
    }
}
if (Symbol.dispose) EpoxyHandlers.prototype[Symbol.dispose] = EpoxyHandlers.prototype.free;

export class IntoUnderlyingByteSource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, addHeapObject(controller));
        return takeObject(ret);
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, addHeapObject(controller));
    }
    /**
     * @returns {ReadableStreamType}
     */
    get type() {
        const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
        return __wbindgen_enum_ReadableStreamType[ret];
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingByteSource.prototype[Symbol.dispose] = IntoUnderlyingByteSource.prototype.free;

export class IntoUnderlyingSink {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(IntoUnderlyingSink.prototype);
        obj.__wbg_ptr = ptr;
        IntoUnderlyingSinkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, addHeapObject(reason));
        return takeObject(ret);
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return takeObject(ret);
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, addHeapObject(chunk));
        return takeObject(ret);
    }
}
if (Symbol.dispose) IntoUnderlyingSink.prototype[Symbol.dispose] = IntoUnderlyingSink.prototype.free;

export class IntoUnderlyingSource {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(IntoUnderlyingSource.prototype);
        obj.__wbg_ptr = ptr;
        IntoUnderlyingSourceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, addHeapObject(controller));
        return takeObject(ret);
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingSource.prototype[Symbol.dispose] = IntoUnderlyingSource.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_52673b7de5a0ca89 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_is_falsy_7b9692021c137978 = function(arg0) {
        const ret = !getObject(arg0);
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_ce774f3490692386 = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_704ef9c8fc131030 = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_87dfb5aaa0cbcea7 = function(arg0) {
        getObject(arg0)._wbg_cb_unref();
    };
    imports.wbg.__wbg_at_505937f1c4b80bfa = function(arg0, arg1) {
        const ret = getObject(arg0).at(arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_6cb2fecb1f253d71 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_byobRequest_f8e3517f5f8ad284 = function(arg0) {
        const ret = getObject(arg0).byobRequest;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_byteLength_faa9938885bdeee6 = function(arg0) {
        const ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_byteOffset_3868b6a19ba01dea = function(arg0) {
        const ret = getObject(arg0).byteOffset;
        return ret;
    };
    imports.wbg.__wbg_call_3020136f7a2d6e44 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_cancel_a65cf45dca50ba4c = function(arg0) {
        const ret = getObject(arg0).cancel();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_catch_b9db41d97d42bd02 = function(arg0, arg1) {
        const ret = getObject(arg0).catch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_close_0af5661bf3d335f2 = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_close_1db3952de1b5b1cf = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_close_3ec111e7b23d94d8 = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_close_ba3bc5fd67caf223 = function(arg0) {
        const ret = getObject(arg0).close();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_convert_body_inner_7f2a71c88dbbb198 = function() { return handleError(function (arg0) {
        const ret = convert_body_inner(takeObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_convert_streaming_body_inner_31bb646614ab8fde = function() { return handleError(function (arg0) {
        const ret = convert_streaming_body_inner(takeObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_data_8bf4ae669a78a688 = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_define_property_b7a5e03db7ca3b02 = function(arg0, arg1, arg2, arg3) {
        define_property(getObject(arg0), getStringFromWasm0(arg1, arg2), takeObject(arg3));
    };
    imports.wbg.__wbg_enqueue_a7e6b1ee87963aad = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).enqueue(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_entries_of_object_inner_2ec20baaa3f6d1ed = function(arg0, arg1) {
        const ret = entries_of_object_inner(getObject(arg1));
        const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_error_252c7a73bcd9bfc8 = function(arg0, arg1) {
        console.error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_from_29a8414a7a7cd19d = function(arg0) {
        const ret = Array.from(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_from_entries_c70772fd2b49ca43 = function() { return handleError(function (arg0) {
        const ret = from_entries(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getReader_48e00749fe3f6089 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getReader();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getWriter_bbffb7cf601bec61 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getWriter();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_6b7bd52aca3f9671 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_done_f98a6e62c4e18fb9 = function(arg0) {
        const ret = getObject(arg0).done;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg_get_value_63e39884ef11812e = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_href_18222dace6ab46cf = function(arg0, arg1) {
        const ret = getObject(arg1).href;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_f3320d2419cd0355 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_3443650560328fa9 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Headers_13be70f684990480 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Headers;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Promise_eca6c43a2610558d = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Promise;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Url_afe31adbd99c160e = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof URL;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_ca6bc609f742df3f = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_length_d45040a40c570362 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_log_268571ec6712bc42 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_1ba21ce319a06297 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_25f239778d6112b9 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_6421f6084cc5bc5a = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_7c30d1f874652e62 = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_df1173567d5ff028 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_ff12d2b041fb48f1 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue__wasm_bindgen_424c3764b206e9a4___JsValue_____(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_from_slice_f9c22b9153b26992 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_byte_offset_and_length_d85c3da1fd8df149 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_into_underlying_sink_08f1a3e40fc70d83 = function(arg0) {
        const ret = new WritableStream(IntoUnderlyingSink.__wrap(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_into_underlying_source_b47f6a6a596a7f24 = function(arg0, arg1) {
        const ret = new ReadableStream(IntoUnderlyingSource.__wrap(arg0), takeObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_length_aa5eaf41d35235e5 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_opt_readable_stream_and_init_6377f53b425fda23 = function() { return handleError(function (arg0, arg1) {
        const ret = new Response(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_with_str_sequence_073466a4a5387941 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_69d776cd24f5215b = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_now_71123b9940376874 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_object_get_3de48de274fa5d93 = function(arg0, arg1, arg2) {
        const ret = object_get(getObject(arg0), getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_object_set_31cfbc95ded27f5d = function(arg0, arg1, arg2, arg3) {
        object_set(getObject(arg0), getStringFromWasm0(arg1, arg2), takeObject(arg3));
    };
    imports.wbg.__wbg_of_b8cd42ebb79fb759 = function(arg0, arg1) {
        const ret = Array.of(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_performance_1a2515c93daf8b0c = function(arg0) {
        const ret = getObject(arg0).performance;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
    };
    imports.wbg.__wbg_push_7d9be8f38fc13975 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_9b549dfce8865860 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_queueMicrotask_fca69f5bfad613a5 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_read_39c4b35efcd03c25 = function(arg0) {
        const ret = getObject(arg0).read();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_readyState_9d0976dcad561aa9 = function(arg0) {
        const ret = getObject(arg0).readyState;
        return ret;
    };
    imports.wbg.__wbg_ready_ce29ee63fe212946 = function(arg0) {
        const ret = getObject(arg0).ready;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_releaseLock_9680d85b7fa402a4 = function(arg0) {
        getObject(arg0).releaseLock();
    };
    imports.wbg.__wbg_releaseLock_a5912f590b185180 = function(arg0) {
        getObject(arg0).releaseLock();
    };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_resolve_fd5bfbaa4ce36e1e = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_respond_9f7fc54636c4a3af = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).respond(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_send_ea59e150ab5ebe08 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_setTimeout_efd7c11531df1743 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_169e13b608078b7b = function(arg0, arg1, arg2) {
        getObject(arg0).set(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_set_binaryType_73e8c75df97825f8 = function(arg0, arg1) {
        getObject(arg0).binaryType = __wbindgen_enum_BinaryType[arg1];
    };
    imports.wbg.__wbg_set_headers_9f734278b4257b03 = function(arg0, arg1) {
        getObject(arg0).headers = getObject(arg1);
    };
    imports.wbg.__wbg_set_high_water_mark_91cea1b95e8cb46d = function(arg0, arg1) {
        getObject(arg0).highWaterMark = arg1;
    };
    imports.wbg.__wbg_set_onclose_032729b3d7ed7a9e = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_set_onerror_7819daa6af176ddb = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_set_onmessage_71321d0bed69856c = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_set_onopen_6d4abedb27ba5656 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_set_status_2727ed43f6735170 = function(arg0, arg1) {
        getObject(arg0).status = arg1;
    };
    imports.wbg.__wbg_set_status_text_ec168482e25228d5 = function(arg0, arg1, arg2) {
        getObject(arg0).statusText = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_845f2f5bce7d061a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_tee_15d2d039bef462ae = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).tee();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_429f7caf1026411d = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_4f95312d68691235 = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_toString_14b47ee7542a49ef = function(arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_view_788aaf149deefd2f = function(arg0) {
        const ret = getObject(arg0).view;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_write_0823b42435137c02 = function(arg0, arg1) {
        const ret = getObject(arg0).write(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_ws_protocol_3af889d5ed406524 = function(arg0) {
        const ret = ws_protocol();
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_2fc8ba837dfca551 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 6, function: Function { arguments: [], shim_idx: 220, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_424c3764b206e9a4___closure__destroy___dyn_core_3031714fbd0baaca___ops__function__FnMut__wasm_bindgen_424c3764b206e9a4___JsValue____Output_______, wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke_______1_);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_a6e51f12cdaa24f2 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 9, function: Function { arguments: [], shim_idx: 13, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen_424c3764b206e9a4___closure__destroy___dyn_core_3031714fbd0baaca___ops__function__Fn__wasm_bindgen_424c3764b206e9a4___JsValue____Output_______, wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke______);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_ac1d45e2030536f9 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 9, function: Function { arguments: [NamedExternref("MessageEvent")], shim_idx: 10, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen_424c3764b206e9a4___closure__destroy___dyn_core_3031714fbd0baaca___ops__function__Fn__wasm_bindgen_424c3764b206e9a4___JsValue____Output_______, wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue_____);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_bf8cc7a8b284d727 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 6, function: Function { arguments: [Externref], shim_idx: 7, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_424c3764b206e9a4___closure__destroy___dyn_core_3031714fbd0baaca___ops__function__FnMut__wasm_bindgen_424c3764b206e9a4___JsValue____Output_______, wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue______1_);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
        const ret = getArrayU8FromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_fc5b81fa001c9612 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 9, function: Function { arguments: [Externref], shim_idx: 10, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen_424c3764b206e9a4___closure__destroy___dyn_core_3031714fbd0baaca___ops__function__Fn__wasm_bindgen_424c3764b206e9a4___JsValue____Output_______, wasm_bindgen_424c3764b206e9a4___convert__closures_____invoke___wasm_bindgen_424c3764b206e9a4___JsValue_____);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('epoxy.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    __wbg_finalize_init(instance, module);
}

export default __wbg_init;
export const info = { version: "2.1.19-1", minimal: 1===1, release: 1===1, commit: "93d5a726894b2f16bad54c4a3801446cbbd22d26" };
