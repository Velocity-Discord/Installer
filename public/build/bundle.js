
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Loader.svelte generated by Svelte v3.49.0 */

    const file$a = "src/components/Loader.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "tag", "path");
    			attr_dev(path, "d", "M 11.5,18.788687 C 9.2628645,14.634721 4.7885936,9.4422626 3.670026,9.4422626 c 3.3557031,-4.1539661 0,0 3.3557031,-4.1539661 0,3.1154747 2.2371354,4.1539661 4.4742709,7.2694405 2.237135,-3.1154744 4.474271,-4.1539658 4.474271,-7.2694405 3.355703,4.1539661 0,0 3.355703,4.1539661 -1.118568,0 -5.592839,5.1924584 -7.829974,9.3464244 m 0,-9.3464244 c 1.118568,-1.0384914 2.237135,-2.076983 3.355703,-5.1924577 L 13.737135,3.2113134 C 12.618568,6.326788 11.5,6.326788 11.5,7.3652796 11.5,6.326788 10.381432,6.326788 9.2628645,3.2113134 L 8.1442968,4.2498049 C 9.2628645,7.3652796 10.381432,8.4037712 11.5,9.4422626 Z");
    			attr_dev(path, "class", "svelte-1bmk0vs");
    			add_location(path, file$a, 13, 8, 391);
    			attr_dev(svg, "tag", "svg");
    			attr_dev(svg, "viewBox", "0 0 22 22");
    			attr_dev(svg, "width", "430");
    			attr_dev(svg, "class", "hero-logo svelte-1bmk0vs");
    			attr_dev(svg, "height", "430");
    			add_location(svg, file$a, 12, 4, 304);
    			attr_dev(div, "id", "Loader");
    			attr_dev(div, "class", "svelte-1bmk0vs");
    			add_location(div, file$a, 11, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	const { fade, slide } = require("svelte/transition");

    	setTimeout(
    		() => {
    			const Loader = document.getElementById("Loader");
    			Loader.classList.add("out");

    			setTimeout(
    				() => {
    					Loader.remove();
    				},
    				1000
    			);
    		},
    		3250
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade, slide });
    	return [];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/TitleBar.svelte generated by Svelte v3.49.0 */

    const file$9 = "src/components/TitleBar.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Velocity Installer";
    			attr_dev(h1, "class", "svelte-3xq216");
    			add_location(h1, file$9, 1, 4, 24);
    			attr_dev(div, "id", "titlebar");
    			attr_dev(div, "class", "svelte-3xq216");
    			add_location(div, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TitleBar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TitleBar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TitleBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TitleBar",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1, Object: Object_1, console: console_1$1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location$1 = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location: location$1,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const forward = writable(false);
    const backward = writable(false);
    const location = writable("/1");
    const next = writable("/2");
    const state = { direction: 1 };
    const action = writable("Next");

    /* src/components/Footer.svelte generated by Svelte v3.49.0 */
    const file$8 = "src/components/Footer.svelte";

    // (23:0) {#if $action == "Exit"}
    function create_if_block$2(ctx) {
    	let style;

    	const block = {
    		c: function create() {
    			style = element("style");
    			style.textContent = ".lookFill.small {\n            background: #c74545;\n        }";
    			add_location(style, file$8, 23, 4, 731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, style, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(style);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(23:0) {#if $action == \\\"Exit\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let footer;
    	let button0;
    	let t0;
    	let button0_disabled_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_disabled_value;
    	let t3;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*$action*/ ctx[2] == "Exit" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			button0 = element("button");
    			t0 = text("Back");
    			t1 = space();
    			button1 = element("button");
    			t2 = text(/*$action*/ ctx[2]);
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button0, "class", "lookVibrant small");
    			attr_dev(button0, "id", "backPage");
    			button0.disabled = button0_disabled_value = !/*$backward*/ ctx[0];
    			add_location(button0, file$8, 18, 4, 486);
    			attr_dev(button1, "class", "lookFill small");
    			attr_dev(button1, "id", "nextPage");
    			button1.disabled = button1_disabled_value = !/*$forward*/ ctx[1];
    			add_location(button1, file$8, 19, 1, 589);
    			attr_dev(footer, "class", "footer");
    			add_location(footer, file$8, 17, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, button0);
    			append_dev(button0, t0);
    			append_dev(footer, t1);
    			append_dev(footer, button1);
    			append_dev(button1, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*goBack*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*goNext*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$backward*/ 1 && button0_disabled_value !== (button0_disabled_value = !/*$backward*/ ctx[0])) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (dirty & /*$action*/ 4) set_data_dev(t2, /*$action*/ ctx[2]);

    			if (dirty & /*$forward*/ 2 && button1_disabled_value !== (button1_disabled_value = !/*$forward*/ ctx[1])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (/*$action*/ ctx[2] == "Exit") {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $next;
    	let $backward;
    	let $forward;
    	let $action;
    	validate_store(next, 'next');
    	component_subscribe($$self, next, $$value => $$invalidate(6, $next = $$value));
    	validate_store(backward, 'backward');
    	component_subscribe($$self, backward, $$value => $$invalidate(0, $backward = $$value));
    	validate_store(forward, 'forward');
    	component_subscribe($$self, forward, $$value => $$invalidate(1, $forward = $$value));
    	validate_store(action, 'action');
    	component_subscribe($$self, action, $$value => $$invalidate(2, $action = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const electron = require("electron");

    	async function goNext() {
    		state.direction = 1;
    		if ($next) push($next); else electron.ipcRenderer.invoke("kill");
    	}

    	function goBack() {
    		state.direction = -1;
    		pop();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		electron,
    		push,
    		pop,
    		location: location$1,
    		onMount,
    		state,
    		forward,
    		backward,
    		next,
    		action,
    		goNext,
    		goBack,
    		$next,
    		$backward,
    		$forward,
    		$action
    	});

    	return [$backward, $forward, $action, goNext, goBack];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const fileLogs = writable([]);
    const installLogs = writable([]);

    function logNewLine(type, entry) {
        type.update((a) => {
            a.push(entry);
            return a;
        });
    }

    function clearAllLogs(type) {
        type.set([]);
    }

    let abc = writable(false);

    const { ipcRenderer } = require("electron");
    const fs$1 = require("fs");
    const path$2 = require("path");

    let appPath;

    async function getPath({ sprops }) {
        const d = await ipcRenderer.invoke("getpath");
        if (d.canceled || !d.filePaths[0]) return;

        let proposedPath = d.filePaths[0];
        const selected = path$2.basename(proposedPath);
        let channelName;
        if (proposedPath.toLowerCase().includes("canary")) channelName = "Discord Canary";
        else if (proposedPath.toLowerCase().includes("ptb")) channelName = "Discord PTB";
        else channelName = "Discord";

        if (process.platform == "win32") {
            const isBaseDir = selected === channelName;
            if (isBaseDir) {
                const version = fs$1
                    .readdirSync(proposedPath)
                    .filter((f) => fs$1.lstatSync(path$2.join(proposedPath, f)).isDirectory() && f.split(".").length > 1)
                    .sort()
                    .reverse()[0];
                if (!version) return "";
                appPath = path$2.join(proposedPath, version, "resources");
            } else if (selected.startsWith("app-") && selected.split(".").length > 2) appPath = path$2.join(proposedPath, "resources");
            else if (selected === "resources") appPath = proposedPath;
            else appPath = proposedPath;
        }

        if (process.platform == "darwin") {
            if (selected === `${channelName}.app`) appPath = path$2.join(proposedPath, "Contents", "Resources");
            else if (selected === "Contents") appPath = path$2.join(proposedPath, "Resources");
            else if (selected === "Resources") appPath = proposedPath;
            else appPath = proposedPath;
        } else appPath = proposedPath;

        window.appPath = appPath;

        return appPath;
    }

    async function openDialog() {
        const d = await ipcRenderer.invoke("getpath");
        if (d.canceled || !d.filePaths[0]) return;

        return d.filePaths[0];
    }

    function quartInOut(t) {
        return t < 0.5
            ? +8.0 * Math.pow(t, 4.0)
            : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
    }

    // Directly from the betterdiscord installer
    function page(node, { delay = 0, duration = 300, easing = quartInOut, x = 550, out = false }) {
        const style = getComputedStyle(node);
        const transform = style.transform === "none" ? "" : style.transform;

        const direction = out ? -1 : 1;
        x = direction * x;
        x = state.direction * x;

        return {
            delay,
            duration,
            easing,
            css: (t) => {
                return `transform: ${transform} translateX(${(1 - t) * x}px);`;
            },
        };
    }

    /* src/components/StatusLabel.svelte generated by Svelte v3.49.0 */

    const file$7 = "src/components/StatusLabel.svelte";

    function create_fragment$a(ctx) {
    	let p;
    	let p_status_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "status", p_status_value = /*statusProps*/ ctx[0].status);
    			attr_dev(p, "id", "status");
    			attr_dev(p, "class", "svelte-1u54w56");
    			add_location(p, file$7, 27, 0, 3478);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*statusProps*/ 1 && p_status_value !== (p_status_value = /*statusProps*/ ctx[0].status)) {
    				attr_dev(p, "status", p_status_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StatusLabel', slots, []);
    	let { statusProps } = $$props;
    	const writable_props = ['statusProps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StatusLabel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('statusProps' in $$props) $$invalidate(0, statusProps = $$props.statusProps);
    	};

    	$$self.$capture_state = () => ({ statusProps });

    	$$self.$inject_state = $$props => {
    		if ('statusProps' in $$props) $$invalidate(0, statusProps = $$props.statusProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*statusProps*/ 1) {
    			{
    				const statusEle = document.getElementById("status");

    				if (statusProps.status == "ok") {
    					statusEle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6ZM8.35355 5.10355C8.54882 4.90829 8.54882 4.59171 8.35355 4.39645C8.15829 4.20118 7.84171 4.20118 7.64645 4.39645L5.5 6.54289L4.35355 5.39645C4.15829 5.20118 3.84171 5.20118 3.64645 5.39645C3.45118 5.59171 3.45118 5.90829 3.64645 6.10355L5.14645 7.60355C5.34171 7.79882 5.65829 7.79882 5.85355 7.60355L8.35355 5.10355Z" fill="currentColor"/></svg>Everything looks fine!`;
    					statusEle.classList.remove("bad");
    					statusEle.classList.remove("questionable");
    					statusEle.classList.add("ok");
    				} else if (statusProps.status == "questionable") {
    					statusEle.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM6.5 8.5C6.5 8.77614 6.27614 9 6 9C5.72386 9 5.5 8.77614 5.5 8.5C5.5 8.22386 5.72386 8 6 8C6.27614 8 6.5 8.22386 6.5 8.5ZM5 4.75254C5 5.02868 4.77614 5.25254 4.5 5.25254C4.22386 5.25254 4 5.02868 4 4.75254C4 4.16437 4.27218 3.70654 4.67045 3.41047C5.05437 3.12507 5.53998 2.99812 5.99992 2.99805C6.45986 2.99797 6.94547 3.12477 7.32941 3.40998C7.72772 3.70586 8 4.16354 8 4.75158C8 5.18051 7.86473 5.50713 7.63277 5.75804C7.44992 5.95583 7.21523 6.09063 7.05355 6.18349L7.0017 6.2134C6.81473 6.32233 6.70614 6.39758 6.63123 6.49533C6.56831 6.57743 6.5 6.71532 6.5 6.99941C6.5 7.27555 6.27614 7.49941 6 7.49941C5.72386 7.49941 5.5 7.27555 5.5 6.99941C5.5 6.53379 5.61919 6.1719 5.83752 5.88703C6.04386 5.61781 6.31027 5.45889 6.4983 5.34935L6.52577 5.33335C6.72277 5.21865 6.82413 5.15964 6.89848 5.07921C6.94777 5.02589 7 4.94686 7 4.75158C7 4.50385 6.89728 4.3347 6.73309 4.21273C6.55453 4.08009 6.29014 3.998 6.00008 3.99805C5.71002 3.99809 5.44563 4.08026 5.26705 4.21301C5.10282 4.3351 5 4.50446 5 4.75254Z" fill="currentColor"/></svg>We can't tell if that path is a Discord path...`;

    					statusEle.classList.remove("ok");
    					statusEle.classList.remove("bad");
    					statusEle.classList.add("questionable");
    				} else if (statusProps.status == "bad") {
    					statusEle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11ZM7.85355 4.14645C8.04882 4.34171 8.04882 4.65829 7.85355 4.85355L6.70711 6L7.85355 7.14645C8.04882 7.34171 8.04882 7.65829 7.85355 7.85355C7.65829 8.04882 7.34171 8.04882 7.14645 7.85355L6 6.70711L4.85355 7.85355C4.65829 8.04882 4.34171 8.04882 4.14645 7.85355C3.95118 7.65829 3.95118 7.34171 4.14645 7.14645L5.29289 6L4.14645 4.85355C3.95118 4.65829 3.95118 4.34171 4.14645 4.14645C4.34171 3.95118 4.65829 3.95118 4.85355 4.14645L6 5.29289L7.14645 4.14645C7.34171 3.95118 7.65829 3.95118 7.85355 4.14645Z" fill="currentColor"/></svg>This doesn't seem like a Discord path.`;
    					statusEle.classList.remove("ok");
    					statusEle.classList.remove("questionable");
    					statusEle.classList.add("bad");
    				}
    			}
    		}
    	};

    	return [statusProps];
    }

    class StatusLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { statusProps: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatusLabel",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*statusProps*/ ctx[0] === undefined && !('statusProps' in props)) {
    			console.warn("<StatusLabel> was created without expected prop 'statusProps'");
    		}
    	}

    	get statusProps() {
    		throw new Error("<StatusLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set statusProps(value) {
    		throw new Error("<StatusLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PathSelector.svelte generated by Svelte v3.49.0 */
    const file$6 = "src/components/PathSelector.svelte";

    function create_fragment$9(ctx) {
    	let div4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = (/*$pathStore*/ ctx[5] || "No Selected Path") + "";
    	let t3;
    	let t4;
    	let statuslabel;
    	let t5;
    	let button;
    	let t6;
    	let div4_id_value;
    	let current;
    	let mounted;
    	let dispose;

    	statuslabel = new StatusLabel({
    			props: { statusProps: /*statusProps*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(/*Title*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(statuslabel.$$.fragment);
    			t5 = space();
    			button = element("button");
    			t6 = text(/*ButtonLabel*/ ctx[1]);
    			attr_dev(img, "class", "image svelte-1hl0t35");
    			if (!src_url_equal(img.src, img_src_value = "../assets/Velocity.ico")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Icon");
    			add_location(img, file$6, 25, 8, 860);
    			attr_dev(div0, "class", "title svelte-1hl0t35");
    			add_location(div0, file$6, 27, 12, 962);
    			attr_dev(div1, "class", "path svelte-1hl0t35");
    			add_location(div1, file$6, 28, 12, 1007);
    			attr_dev(div2, "class", "details svelte-1hl0t35");
    			add_location(div2, file$6, 26, 8, 928);
    			attr_dev(div3, "class", "info svelte-1hl0t35");
    			add_location(div3, file$6, 24, 4, 833);
    			attr_dev(button, "id", "browseBtn");
    			add_location(button, file$6, 32, 4, 1137);
    			attr_dev(div4, "id", div4_id_value = /*Title*/ ctx[0].toLowerCase().replace(" ", "-"));
    			attr_dev(div4, "class", "pathSelector svelte-1hl0t35");
    			add_location(div4, file$6, 23, 0, 759);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			mount_component(statuslabel, div2, null);
    			append_dev(div4, t5);
    			append_dev(div4, button);
    			append_dev(button, t6);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*handleClick*/ ctx[2])) /*handleClick*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*Title*/ 1) set_data_dev(t1, /*Title*/ ctx[0]);
    			if ((!current || dirty & /*$pathStore*/ 32) && t3_value !== (t3_value = (/*$pathStore*/ ctx[5] || "No Selected Path") + "")) set_data_dev(t3, t3_value);
    			const statuslabel_changes = {};
    			if (dirty & /*statusProps*/ 8) statuslabel_changes.statusProps = /*statusProps*/ ctx[3];
    			statuslabel.$set(statuslabel_changes);
    			if (!current || dirty & /*ButtonLabel*/ 2) set_data_dev(t6, /*ButtonLabel*/ ctx[1]);

    			if (!current || dirty & /*Title*/ 1 && div4_id_value !== (div4_id_value = /*Title*/ ctx[0].toLowerCase().replace(" ", "-"))) {
    				attr_dev(div4, "id", div4_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statuslabel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statuslabel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(statuslabel);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $pathStore,
    		$$unsubscribe_pathStore = noop,
    		$$subscribe_pathStore = () => ($$unsubscribe_pathStore(), $$unsubscribe_pathStore = subscribe(pathStore, $$value => $$invalidate(5, $pathStore = $$value)), pathStore);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_pathStore());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PathSelector', slots, []);
    	const electron = require("electron");
    	let { Title } = $$props;
    	let { ButtonLabel } = $$props;
    	let { handleClick } = $$props;
    	let { statusProps } = $$props;
    	let { pathStore } = $$props;
    	validate_store(pathStore, 'pathStore');
    	$$subscribe_pathStore();

    	onMount(() => {
    		pathStore.subscribe(async path => {
    			let icon = await electron.ipcRenderer.invoke("getIcon", path);
    			const current = document.querySelector(`#${Title.toLowerCase().replace(" ", "-")}`);
    			if (typeof icon == "string") return current.querySelector(".image").setAttribute("src", icon);
    			icon = icon.toDataURL();
    			current.querySelector(".image").setAttribute("src", icon);
    		});
    	});

    	const writable_props = ['Title', 'ButtonLabel', 'handleClick', 'statusProps', 'pathStore'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PathSelector> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('Title' in $$props) $$invalidate(0, Title = $$props.Title);
    		if ('ButtonLabel' in $$props) $$invalidate(1, ButtonLabel = $$props.ButtonLabel);
    		if ('handleClick' in $$props) $$invalidate(2, handleClick = $$props.handleClick);
    		if ('statusProps' in $$props) $$invalidate(3, statusProps = $$props.statusProps);
    		if ('pathStore' in $$props) $$subscribe_pathStore($$invalidate(4, pathStore = $$props.pathStore));
    	};

    	$$self.$capture_state = () => ({
    		electron,
    		onMount,
    		StatusLabel,
    		Title,
    		ButtonLabel,
    		handleClick,
    		statusProps,
    		pathStore,
    		$pathStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('Title' in $$props) $$invalidate(0, Title = $$props.Title);
    		if ('ButtonLabel' in $$props) $$invalidate(1, ButtonLabel = $$props.ButtonLabel);
    		if ('handleClick' in $$props) $$invalidate(2, handleClick = $$props.handleClick);
    		if ('statusProps' in $$props) $$invalidate(3, statusProps = $$props.statusProps);
    		if ('pathStore' in $$props) $$subscribe_pathStore($$invalidate(4, pathStore = $$props.pathStore));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Title, ButtonLabel, handleClick, statusProps, pathStore, $pathStore];
    }

    class PathSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			Title: 0,
    			ButtonLabel: 1,
    			handleClick: 2,
    			statusProps: 3,
    			pathStore: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PathSelector",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*Title*/ ctx[0] === undefined && !('Title' in props)) {
    			console.warn("<PathSelector> was created without expected prop 'Title'");
    		}

    		if (/*ButtonLabel*/ ctx[1] === undefined && !('ButtonLabel' in props)) {
    			console.warn("<PathSelector> was created without expected prop 'ButtonLabel'");
    		}

    		if (/*handleClick*/ ctx[2] === undefined && !('handleClick' in props)) {
    			console.warn("<PathSelector> was created without expected prop 'handleClick'");
    		}

    		if (/*statusProps*/ ctx[3] === undefined && !('statusProps' in props)) {
    			console.warn("<PathSelector> was created without expected prop 'statusProps'");
    		}

    		if (/*pathStore*/ ctx[4] === undefined && !('pathStore' in props)) {
    			console.warn("<PathSelector> was created without expected prop 'pathStore'");
    		}
    	}

    	get Title() {
    		throw new Error("<PathSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Title(value) {
    		throw new Error("<PathSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ButtonLabel() {
    		throw new Error("<PathSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ButtonLabel(value) {
    		throw new Error("<PathSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClick() {
    		throw new Error("<PathSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClick(value) {
    		throw new Error("<PathSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get statusProps() {
    		throw new Error("<PathSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set statusProps(value) {
    		throw new Error("<PathSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pathStore() {
    		throw new Error("<PathSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pathStore(value) {
    		throw new Error("<PathSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const path$1 = require("path");
    const electron$1 = require("electron");

    const savedPath = writable();
    const velocityPath = writable();
    const finished = writable(false);
    const installing = writable(false);

    (async () => {
        velocityPath.set(path$1.join(await electron$1.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
    })();

    /* src/pages/1.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$5 = "src/pages/1.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let pathselector0;
    	let t2;
    	let pathselector1;
    	let main_intro;
    	let main_outro;
    	let current;

    	pathselector0 = new PathSelector({
    			props: {
    				pathStore: savedPath,
    				Title: "Discord",
    				handleClick: /*handleClick*/ ctx[2],
    				statusProps: /*statusProps*/ ctx[0],
    				ButtonLabel: "Browse"
    			},
    			$$inline: true
    		});

    	pathselector1 = new PathSelector({
    			props: {
    				pathStore: velocityPath,
    				Title: "Velocity Folder",
    				handleClick: /*handleClick1*/ ctx[3],
    				statusProps: /*statusPropsDir*/ ctx[1],
    				ButtonLabel: "Browse"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Install Velocity";
    			t1 = space();
    			create_component(pathselector0.$$.fragment);
    			t2 = space();
    			create_component(pathselector1.$$.fragment);
    			add_location(h1, file$5, 67, 1, 1827);
    			add_location(main, file$5, 66, 0, 1776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(pathselector0, main, null);
    			append_dev(main, t2);
    			mount_component(pathselector1, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pathselector0_changes = {};
    			if (dirty & /*statusProps*/ 1) pathselector0_changes.statusProps = /*statusProps*/ ctx[0];
    			pathselector0.$set(pathselector0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pathselector0.$$.fragment, local);
    			transition_in(pathselector1.$$.fragment, local);

    			add_render_callback(() => {
    				if (main_outro) main_outro.end(1);
    				main_intro = create_in_transition(main, page, {});
    				main_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pathselector0.$$.fragment, local);
    			transition_out(pathselector1.$$.fragment, local);
    			if (main_intro) main_intro.invalidate();
    			main_outro = create_out_transition(main, page, { out: true });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(pathselector0);
    			destroy_component(pathselector1);
    			if (detaching && main_outro) main_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $velocityPath;
    	let $savedPath;
    	validate_store(velocityPath, 'velocityPath');
    	component_subscribe($$self, velocityPath, $$value => $$invalidate(6, $velocityPath = $$value));
    	validate_store(savedPath, 'savedPath');
    	component_subscribe($$self, savedPath, $$value => $$invalidate(7, $savedPath = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('_1', slots, []);
    	const electron = require("electron");
    	const path = require("path");
    	let appPath;
    	let velocityDirPath;
    	let statusProps = { status: "" };
    	let statusPropsDir = { status: "" };

    	onMount(async () => {
    		forward.set(false);
    		backward.set(false);
    		location.set("/1");
    		action.set("Next");
    		next.set("/2");
    		appPath = $savedPath;
    		velocityDirPath = $velocityPath;

    		if ($savedPath && $velocityPath) {
    			forward.set(true);
    		}
    	});

    	async function handleClick() {
    		appPath = await getPath({ sprops: statusProps });
    		if (!appPath) return;
    		if (appPath.includes("Discord") && appPath.toLowerCase().includes("resources")) $$invalidate(0, statusProps.status = "ok", statusProps); else if (appPath.includes("Discord") || appPath.toLowerCase().includes("resources")) $$invalidate(0, statusProps.status = "questionable", statusProps); else $$invalidate(0, statusProps.status = "bad", statusProps);
    		savedPath.set(appPath);
    		if ($velocityPath) forward.set(true);
    		clearAllLogs(fileLogs);
    		logNewLine(fileLogs, path.join(appPath, "app/"));
    		logNewLine(fileLogs, path.join(appPath, "app/index.js"));
    		logNewLine(fileLogs, path.join(appPath, "app/package.json"));
    	}

    	async function handleClick1() {
    		velocityDirPath = await openDialog();
    		if (!velocityDirPath) return;
    		console.log("Eee");
    		velocityPath.set(velocityDirPath);
    		if (appPath) forward.set(true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<_1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		electron,
    		path,
    		fileLogs,
    		logNewLine,
    		clearAllLogs,
    		getPath,
    		openDialog,
    		pageSlide: page,
    		StatusLabel,
    		PathSelector,
    		onMount,
    		forward,
    		backward,
    		next,
    		location,
    		action,
    		savedPath,
    		velocityPath,
    		appPath,
    		velocityDirPath,
    		statusProps,
    		statusPropsDir,
    		handleClick,
    		handleClick1,
    		$velocityPath,
    		$savedPath
    	});

    	$$self.$inject_state = $$props => {
    		if ('appPath' in $$props) appPath = $$props.appPath;
    		if ('velocityDirPath' in $$props) velocityDirPath = $$props.velocityDirPath;
    		if ('statusProps' in $$props) $$invalidate(0, statusProps = $$props.statusProps);
    		if ('statusPropsDir' in $$props) $$invalidate(1, statusPropsDir = $$props.statusPropsDir);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [statusProps, statusPropsDir, handleClick, handleClick1];
    }

    class _1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_1",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/pages/2.svelte generated by Svelte v3.49.0 */
    const file$4 = "src/pages/2.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let p0;
    	let t1;
    	let section;
    	let p1;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let br4;
    	let t7;
    	let br5;
    	let t8;
    	let br6;
    	let t9;
    	let br7;
    	let t10;
    	let br8;
    	let t11;
    	let br9;
    	let t12;
    	let label1;
    	let div;
    	let input;
    	let t13;
    	let svg;
    	let path;
    	let t14;
    	let label0;
    	let main_intro;
    	let main_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p0 = element("p");
    			p0.textContent = "License";
    			t1 = space();
    			section = element("section");
    			p1 = element("p");
    			t2 = text("MIT License ");
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n\n\t\t\tCopyright (c) 2022 ");
    			br2 = element("br");
    			t5 = space();
    			br3 = element("br");
    			t6 = text("\n\n\t\t\tPermission is hereby granted, free of charge, to any person obtaining a copy\n\t\t\tof this software and associated documentation files (the \"Software\"), to deal\n\t\t\tin the Software without restriction, including without limitation the rights\n\t\t\tto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n\t\t\tcopies of the Software, and to permit persons to whom the Software is\n\t\t\tfurnished to do so, subject to the following conditions:  ");
    			br4 = element("br");
    			t7 = space();
    			br5 = element("br");
    			t8 = text("\n\n\t\t\tThe above copyright notice and this permission notice shall be included in all\n\t\t\tcopies or substantial portions of the Software.  ");
    			br6 = element("br");
    			t9 = space();
    			br7 = element("br");
    			t10 = text("\n\n\t\t\tTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\t\t\tIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\t\t\tFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\t\t\tAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\t\t\tLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\t\t\tOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n\t\t\tSOFTWARE.  ");
    			br8 = element("br");
    			t11 = space();
    			br9 = element("br");
    			t12 = space();
    			label1 = element("label");
    			div = element("div");
    			input = element("input");
    			t13 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t14 = space();
    			label0 = element("label");
    			label0.textContent = "I Accept the License";
    			attr_dev(p0, "class", "head svelte-3ham2m");
    			add_location(p0, file$4, 30, 1, 709);
    			attr_dev(br0, "class", "svelte-3ham2m");
    			add_location(br0, file$4, 34, 15, 770);
    			attr_dev(br1, "class", "svelte-3ham2m");
    			add_location(br1, file$4, 34, 20, 775);
    			attr_dev(br2, "class", "svelte-3ham2m");
    			add_location(br2, file$4, 36, 22, 803);
    			attr_dev(br3, "class", "svelte-3ham2m");
    			add_location(br3, file$4, 36, 27, 808);
    			attr_dev(br4, "class", "svelte-3ham2m");
    			add_location(br4, file$4, 43, 61, 1266);
    			attr_dev(br5, "class", "svelte-3ham2m");
    			add_location(br5, file$4, 43, 66, 1271);
    			attr_dev(br6, "class", "svelte-3ham2m");
    			add_location(br6, file$4, 46, 52, 1411);
    			attr_dev(br7, "class", "svelte-3ham2m");
    			add_location(br7, file$4, 46, 57, 1416);
    			attr_dev(br8, "class", "svelte-3ham2m");
    			add_location(br8, file$4, 54, 14, 1905);
    			attr_dev(br9, "class", "svelte-3ham2m");
    			add_location(br9, file$4, 54, 19, 1910);
    			attr_dev(p1, "class", "svelte-3ham2m");
    			add_location(p1, file$4, 33, 2, 751);
    			attr_dev(section, "class", "svelte-3ham2m");
    			add_location(section, file$4, 32, 1, 739);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", "license");
    			attr_dev(input, "id", "license-check");
    			attr_dev(input, "class", "svelte-3ham2m");
    			add_location(input, file$4, 62, 3, 2109);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M 0 2 C -1 1 1 -1 2 0 L 12 10 C 13 11 11 13 10 12 M 2 12 C 1 13 -1 11 0 10 L 10 0 C 11 -1 13 1 12 2");
    			attr_dev(path, "class", "svelte-3ham2m");
    			add_location(path, file$4, 64, 4, 2317);
    			attr_dev(svg, "viewBox", "-1 -1 13 13");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "10");
    			attr_dev(svg, "height", "10");
    			attr_dev(svg, "class", "svelte-3ham2m");
    			add_location(svg, file$4, 63, 3, 2227);
    			attr_dev(div, "class", "accept-inner svelte-3ham2m");
    			add_location(div, file$4, 61, 2, 2079);
    			attr_dev(label0, "for", "license");
    			attr_dev(label0, "class", "svelte-3ham2m");
    			add_location(label0, file$4, 67, 2, 2476);
    			attr_dev(label1, "class", "accept-container svelte-3ham2m");
    			add_location(label1, file$4, 60, 1, 2027);
    			attr_dev(main, "class", "svelte-3ham2m");
    			add_location(main, file$4, 29, 0, 658);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p0);
    			append_dev(main, t1);
    			append_dev(main, section);
    			append_dev(section, p1);
    			append_dev(p1, t2);
    			append_dev(p1, br0);
    			append_dev(p1, t3);
    			append_dev(p1, br1);
    			append_dev(p1, t4);
    			append_dev(p1, br2);
    			append_dev(p1, t5);
    			append_dev(p1, br3);
    			append_dev(p1, t6);
    			append_dev(p1, br4);
    			append_dev(p1, t7);
    			append_dev(p1, br5);
    			append_dev(p1, t8);
    			append_dev(p1, br6);
    			append_dev(p1, t9);
    			append_dev(p1, br7);
    			append_dev(p1, t10);
    			append_dev(p1, br8);
    			append_dev(p1, t11);
    			append_dev(p1, br9);
    			append_dev(main, t12);
    			append_dev(main, label1);
    			append_dev(label1, div);
    			append_dev(div, input);
    			input.checked = /*checked*/ ctx[1];
    			/*input_binding*/ ctx[5](input);
    			append_dev(div, t13);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(label1, t14);
    			append_dev(label1, label0);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[4]),
    					listen_dev(input, "change", /*accept*/ ctx[3], false, false, false),
    					listen_dev(label1, "click", /*check*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 2) {
    				input.checked = /*checked*/ ctx[1];
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (main_outro) main_outro.end(1);
    				main_intro = create_in_transition(main, page, {});
    				main_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (main_intro) main_intro.invalidate();
    			main_outro = create_out_transition(main, page, { out: true });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*input_binding*/ ctx[5](null);
    			if (detaching && main_outro) main_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('_2', slots, []);
    	let checkboxEle;
    	let checked = false;

    	onMount(() => {
    		forward.set(false);
    		backward.set(true);
    		action.set("Next");
    		location.set("/2");
    		next.set("/3");
    	});

    	function check(event) {
    		$$invalidate(0, checkboxEle.checked = !checkboxEle.checked, checkboxEle);
    		const changeEvent = new Event("change");
    		checkboxEle.dispatchEvent(changeEvent);
    	}

    	function accept(event) {
    		if (event.target.checked) return forward.set(true);
    		forward.set(false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<_2> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(1, checked);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			checkboxEle = $$value;
    			$$invalidate(0, checkboxEle);
    		});
    	}

    	$$self.$capture_state = () => ({
    		pageSlide: page,
    		onMount,
    		forward,
    		backward,
    		next,
    		location,
    		action,
    		savedPath,
    		checkboxEle,
    		checked,
    		check,
    		accept
    	});

    	$$self.$inject_state = $$props => {
    		if ('checkboxEle' in $$props) $$invalidate(0, checkboxEle = $$props.checkboxEle);
    		if ('checked' in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checkboxEle, checked, check, accept, input_change_handler, input_binding];
    }

    class _2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_2",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const progress = writable(0);
    const failed = writable(false);

    /* src/components/ProgressBar.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/components/ProgressBar.svelte";

    // (25:0) {#if $failed}
    function create_if_block$1(ctx) {
    	let style;

    	const block = {
    		c: function create() {
    			style = element("style");
    			style.textContent = ".progress-bar {\n            background: #eb7f7f !important;\n        }";
    			add_location(style, file$3, 25, 4, 536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, style, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(style);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(25:0) {#if $failed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let if_block = /*$failed*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_style(div, "width", /*$progress*/ ctx[0] + "%");
    			attr_dev(div, "class", "progress-bar svelte-51pzku");
    			add_location(div, file$3, 4, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progress*/ 1) {
    				set_style(div, "width", /*$progress*/ ctx[0] + "%");
    			}

    			if (/*$failed*/ ctx[1]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $progress;
    	let $failed;
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, $$value => $$invalidate(0, $progress = $$value));
    	validate_store(failed, 'failed');
    	component_subscribe($$self, failed, $$value => $$invalidate(1, $failed = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressBar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ progress, failed, $progress, $failed });
    	return [$progress, $failed];
    }

    class ProgressBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressBar",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/TextLogger.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/components/TextLogger.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (15:8) {#each $value as log}
    function create_each_block(ctx) {
    	let t0_value = /*log*/ ctx[5] + "";
    	let t0;
    	let t1;
    	let br0;
    	let br1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			br0 = element("br");
    			br1 = element("br");
    			attr_dev(br0, "class", "svelte-1ij5xf");
    			add_location(br0, file$2, 16, 12, 349);
    			attr_dev(br1, "class", "svelte-1ij5xf");
    			add_location(br1, file$2, 16, 16, 353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$value*/ 8 && t0_value !== (t0_value = /*log*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(15:8) {#each $value as log}",
    		ctx
    	});

    	return block;
    }

    // (54:0) {#if full}
    function create_if_block(ctx) {
    	let style;

    	const block = {
    		c: function create() {
    			style = element("style");
    			style.textContent = "section {\n        height: 290px !important;\n    }";
    			attr_dev(style, "class", "svelte-1ij5xf");
    			add_location(style, file$2, 54, 0, 1020);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, style, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(style);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(54:0) {#if full}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let p;
    	let t0;
    	let t1;
    	let br0;
    	let br1;
    	let t2;
    	let t3;
    	let div;
    	let t4;
    	let progressbar;
    	let t5;
    	let if_block_anchor;
    	let current;
    	let each_value = /*$value*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	progressbar = new ProgressBar({ $$inline: true });
    	let if_block = /*full*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div = element("div");
    			t4 = space();
    			create_component(progressbar.$$.fragment);
    			t5 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(br0, "class", "svelte-1ij5xf");
    			add_location(br0, file$2, 13, 8, 280);
    			attr_dev(br1, "class", "svelte-1ij5xf");
    			add_location(br1, file$2, 13, 12, 284);
    			attr_dev(p, "class", "svelte-1ij5xf");
    			add_location(p, file$2, 11, 4, 252);
    			attr_dev(div, "class", "spacer svelte-1ij5xf");
    			add_location(div, file$2, 18, 8, 382);
    			attr_dev(section, "class", "svelte-1ij5xf");
    			add_location(section, file$2, 10, 0, 238);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, br0);
    			append_dev(p, br1);
    			append_dev(p, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}

    			append_dev(p, t3);
    			append_dev(section, div);
    			append_dev(section, t4);
    			mount_component(progressbar, section, null);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*$value*/ 8) {
    				each_value = /*$value*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*full*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			destroy_component(progressbar);
    			if (detaching) detach_dev(t5);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $value,
    		$$unsubscribe_value = noop,
    		$$subscribe_value = () => ($$unsubscribe_value(), $$unsubscribe_value = subscribe(value, $$value => $$invalidate(3, $value = $$value)), value);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_value());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextLogger', slots, []);
    	const path = require("path");
    	let { value } = $$props;
    	validate_store(value, 'value');
    	$$subscribe_value();
    	let { title } = $$props;
    	let { full } = $$props;
    	const writable_props = ['value', 'title', 'full'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextLogger> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$subscribe_value($$invalidate(0, value = $$props.value));
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('full' in $$props) $$invalidate(2, full = $$props.full);
    	};

    	$$self.$capture_state = () => ({
    		path,
    		fileLogs,
    		installLogs,
    		logNewLine,
    		ProgressBar,
    		value,
    		title,
    		full,
    		$value
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$subscribe_value($$invalidate(0, value = $$props.value));
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('full' in $$props) $$invalidate(2, full = $$props.full);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, title, full, $value];
    }

    class TextLogger extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0, title: 1, full: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextLogger",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<TextLogger> was created without expected prop 'value'");
    		}

    		if (/*title*/ ctx[1] === undefined && !('title' in props)) {
    			console.warn("<TextLogger> was created without expected prop 'title'");
    		}

    		if (/*full*/ ctx[2] === undefined && !('full' in props)) {
    			console.warn("<TextLogger> was created without expected prop 'full'");
    		}
    	}

    	get value() {
    		throw new Error("<TextLogger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextLogger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<TextLogger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<TextLogger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get full() {
    		throw new Error("<TextLogger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set full(value) {
    		throw new Error("<TextLogger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FileDisplay.svelte generated by Svelte v3.49.0 */

    function create_fragment$4(ctx) {
    	let textlogger;
    	let current;

    	textlogger = new TextLogger({
    			props: {
    				value: fileLogs,
    				title: /*$fileLogs*/ ctx[0].length + " Locations will be Created/Affected"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(textlogger.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(textlogger, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const textlogger_changes = {};
    			if (dirty & /*$fileLogs*/ 1) textlogger_changes.title = /*$fileLogs*/ ctx[0].length + " Locations will be Created/Affected";
    			textlogger.$set(textlogger_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textlogger.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textlogger.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textlogger, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $velocityPath;
    	let $abc;
    	let $fileLogs;
    	validate_store(velocityPath, 'velocityPath');
    	component_subscribe($$self, velocityPath, $$value => $$invalidate(1, $velocityPath = $$value));
    	validate_store(abc, 'abc');
    	component_subscribe($$self, abc, $$value => $$invalidate(2, $abc = $$value));
    	validate_store(fileLogs, 'fileLogs');
    	component_subscribe($$self, fileLogs, $$value => $$invalidate(0, $fileLogs = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileDisplay', slots, []);
    	const path = require("path");

    	onMount(() => {
    		if ($abc) return;
    		abc.set(true);
    		logNewLine(fileLogs, path.join($velocityPath));
    		logNewLine(fileLogs, path.join($velocityPath, "/dist/velocity.asar"));
    		logNewLine(fileLogs, path.join($velocityPath, "/package.json"));
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		path,
    		onMount,
    		TextLogger,
    		fileLogs,
    		installLogs,
    		logNewLine,
    		abc,
    		velocityPath,
    		$velocityPath,
    		$abc,
    		$fileLogs
    	});

    	return [$fileLogs];
    }

    class FileDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileDisplay",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/3.svelte generated by Svelte v3.49.0 */
    const file$1 = "src/pages/3.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let p;
    	let t1;
    	let filedisplay;
    	let main_intro;
    	let main_outro;
    	let current;
    	filedisplay = new FileDisplay({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			p.textContent = "Are you sure you want to Install Velocity?";
    			t1 = space();
    			create_component(filedisplay.$$.fragment);
    			attr_dev(p, "class", "head svelte-xcnuy1");
    			add_location(p, file$1, 17, 1, 467);
    			add_location(main, file$1, 16, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(main, t1);
    			mount_component(filedisplay, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filedisplay.$$.fragment, local);

    			add_render_callback(() => {
    				if (main_outro) main_outro.end(1);
    				main_intro = create_in_transition(main, page, {});
    				main_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filedisplay.$$.fragment, local);
    			if (main_intro) main_intro.invalidate();
    			main_outro = create_out_transition(main, page, { out: true });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(filedisplay);
    			if (detaching && main_outro) main_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('_3', slots, []);

    	onMount(() => {
    		forward.set(true);
    		backward.set(true);
    		action.set("Install");
    		location.set("/3");
    		next.set("/4");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<_3> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		FileDisplay,
    		pageSlide: page,
    		onMount,
    		forward,
    		backward,
    		next,
    		location,
    		action,
    		savedPath
    	});

    	return [];
    }

    class _3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_3",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/InstallDisplay.svelte generated by Svelte v3.49.0 */

    function create_fragment$2(ctx) {
    	let textlogger;
    	let current;

    	textlogger = new TextLogger({
    			props: {
    				value: installLogs,
    				full: true,
    				title: "Installing Velocity"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(textlogger.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(textlogger, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textlogger.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textlogger.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textlogger, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InstallDisplay', slots, []);
    	const path = require("path");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InstallDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		path,
    		TextLogger,
    		finished,
    		fileLogs,
    		installLogs,
    		logNewLine,
    		onMount
    	});

    	return [];
    }

    class InstallDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstallDisplay",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const fs = require("fs");
    const fsPromises = require("fs/promises");
    const originalFs = require("original-fs").promises;
    const path = require("path");
    const https = require("https");
    const electron = require("electron");

    const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

    async function waitUntil(condition) {
        let item;
        while (!(item = condition())) await sleep(1);
        return item;
    }

    const getAsarData = async () => {
        return new Promise((resolve, reject) => {
            let url = "https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/dist/velocity.asar";
            let body = [];

            https.get(url, (res) => {
                res.on("data", (d) => {
                    body.push(d);
                });

                res.on("end", () => {
                    const data = Buffer.concat(body);
                    resolve(data);
                });

                res.on("error", (err) => {
                    reject(err);
                });
            });
        });
    };

    const getPackageData = async () => {
        return new Promise((resolve, reject) => {
            let url = "https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/package.json";
            let body;

            https.get(url, (res) => {
                let rawData = "";

                res.on("data", (chunk) => {
                    rawData += chunk;
                });

                res.on("end", () => {
                    body = rawData;

                    resolve(body);
                });

                res.on("error", (err) => {
                    reject(err);
                });
            });
        });
    };

    async function startInstall() {
        function killInstall(err) {
            failed.set(true);
            forward.set(true);
            action.set("Exit");
            logNewLine(installLogs, `❌ INSTALL FAILED: ${err}`);
        }

        function finishInstall() {
            logNewLine(installLogs, "✅ Velocity successfully installed");
            forward.set(true);
            progress.set(100);
            action.set("Exit");
        }

        await waitUntil(() => window.appPath);

        logNewLine(installLogs, `\n\n Starting Install`);

        let oldInstall = fs.existsSync(path.join(window.appPath, "app"));
        if (oldInstall) {
            try {
                logNewLine(installLogs, `Old Client Modification detected ${window.appPath}/app`);
                logNewLine(installLogs, "Proceeding to replace...");
                progress.set(10);

                await fsPromises.unlink(path.join(window.appPath, "app/index.js"));
                await fsPromises.unlink(path.join(window.appPath, "app/package.json"));
                await fsPromises.rmdir(path.join(window.appPath, "app"));

                logNewLine(installLogs, "✅ Old Client Modification successfully removed");
                logNewLine(installLogs, "Fetching latest remote package.json...");

                const packageToWrite = await getPackageData();

                logNewLine(installLogs, "✅ Remote package.json successfully fetched");
                progress.set(20);
                logNewLine(installLogs, "Fetching latest remote asar...");

                logNewLine(installLogs, "✅ Remote package.json successfully fetched");
                progress.set(25);
                logNewLine(installLogs, "Writing package.json to disk");

                if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"))) {
                    await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
                }
                if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"))) {
                    await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"));
                }
                await fsPromises.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"), packageToWrite);

                logNewLine(installLogs, "✅ package.json successfully written to disk");
                progress.set(35);
                logNewLine(installLogs, "Writing asar to disk");

                await originalFs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"), await getAsarData());

                logNewLine(installLogs, "✅ asar successfully written to disk");
                progress.set(45);

                const VelocityDiscordPath = path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord");

                logNewLine(installLogs, "Creating files in Discord folder...");

                await fsPromises.mkdir(path.join(window.appPath, "app"));
                progress.set(50);
                await fsPromises.writeFile(path.join(window.appPath, "app/index.js"), `require("${VelocityDiscordPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}");`);
                progress.set(55);
                await fsPromises.writeFile(path.join(window.appPath, "app/package.json"), `{"name":"velocity", "main":"./index.js"}`);
                progress.set(60);

                finishInstall();
            } catch (err) {
                killInstall(err);
            }
        } else {
            try {
                progress.set(10);

                logNewLine(installLogs, "Fetching latest remote package.json...");

                const packageToWrite = await getPackageData();

                logNewLine(installLogs, "✅ Remote package.json successfully fetched");
                progress.set(20);
                logNewLine(installLogs, "Fetching latest remote asar...");

                const asarToWrite = await getAsarData();

                logNewLine(installLogs, "✅ Remote package.json successfully fetched");
                progress.set(25);
                logNewLine(installLogs, "Writing package.json to disk");

                if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"))) {
                    await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
                }
                if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"))) {
                    await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"));
                }
                await fsPromises.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"), packageToWrite);

                logNewLine(installLogs, "✅ package.json successfully written to disk");
                progress.set(35);
                logNewLine(installLogs, "Writing asar to disk");

                await originalFs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"), asarToWrite, { encoding: "binary" });

                logNewLine(installLogs, "✅ asar successfully written to disk");
                progress.set(45);

                const VelocityDiscordPath = path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord");

                logNewLine(installLogs, "Creating files in Discord folder...");

                await fsPromises.mkdir(path.join(window.appPath, "app"));
                progress.set(50);
                await fsPromises.writeFile(path.join(window.appPath, "app/index.js"), `require("${VelocityDiscordPath}")`);
                progress.set(55);
                await fsPromises.writeFile(path.join(window.appPath, "app/package.json"), `{"name":"velocity", "main":"./index.js"}`);
                progress.set(60);

                logNewLine(installLogs, "✅ files successfully created");
                progress.set(80);

                finishInstall();
            } catch (err) {
                killInstall(err);
            }
        }
    }

    /* src/pages/4.svelte generated by Svelte v3.49.0 */
    const file = "src/pages/4.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let installdisplay;
    	let main_intro;
    	let main_outro;
    	let current;
    	installdisplay = new InstallDisplay({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(installdisplay.$$.fragment);
    			add_location(main, file, 35, 0, 819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(installdisplay, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(installdisplay.$$.fragment, local);

    			add_render_callback(() => {
    				if (main_outro) main_outro.end(1);
    				main_intro = create_in_transition(main, page, {});
    				main_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(installdisplay.$$.fragment, local);
    			if (main_intro) main_intro.invalidate();
    			main_outro = create_out_transition(main, page, { out: true });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(installdisplay);
    			if (detaching && main_outro) main_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('_4', slots, []);

    	onMount(() => {
    		forward.set(false);
    		backward.set(false);
    		action.set("Installing...");
    		location.set("/4");
    		next.set();
    		installing.set(true);
    	});

    	const us = installing.subscribe(value => {
    		if (value == true) {
    			setTimeout(
    				() => {
    					startInstall();
    				},
    				500
    			);
    		}
    	});

    	const unsubscribe = finished.subscribe(value => {
    		if (value == true) {
    			forward.set(true);
    			action.set("Done");
    		}
    	});

    	onDestroy(unsubscribe);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<_4> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		InstallDisplay,
    		pageSlide: page,
    		onMount,
    		onDestroy,
    		forward,
    		backward,
    		next,
    		location,
    		action,
    		savedPath,
    		finished,
    		installing,
    		startInstall,
    		us,
    		unsubscribe
    	});

    	return [];
    }

    class _4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_4",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */

    function create_fragment(ctx) {
    	let titlebar;
    	let t0;
    	let router;
    	let t1;
    	let footer;
    	let t2;
    	let loader;
    	let current;
    	titlebar = new TitleBar({ $$inline: true });

    	router = new Router({
    			props: {
    				routes: {
    					"/1": _1,
    					"/2": _2,
    					"/3": _3,
    					"/4": _4
    				}
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(titlebar.$$.fragment);
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			t2 = space();
    			create_component(loader.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(titlebar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(router, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(titlebar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	push("/1");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Loader,
    		TitleBar,
    		Footer,
    		Page1: _1,
    		Page2: _2,
    		Page3: _3,
    		Page4: _4,
    		Router,
    		push
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
