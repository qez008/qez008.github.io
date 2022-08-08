
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
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
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    const outroing = new Set();
    let outros;
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

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function quadInOut(t) {
        t /= 0.5;
        if (t < 1)
            return 0.5 * t * t;
        t--;
        return -0.5 * (t * (t - 2) - 1);
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    function writableSet(value = new Set()) {
      const store = writable(value);

      const wrap = (method) => {
        return (...args) => {
          let output;
          store.update((value) => {
            output = value[method](...args);
            return value;
          });
          return output;
        };
      };
      return {
        ...store,
        add: wrap('add'),
        delete: wrap('delete'),
      };
    }

    const contextKey = {};

    const clamp = (val, min, max) => {
      return val < min ? min : val > max ? max : val;
    };

    // fork of https://github.com/langbamit/svelte-scrollto
    let supportsPassive = false;
    try {
      let opts = Object.defineProperty({}, 'passive', {
        get: function () {
          supportsPassive = true;
        },
      });
      window.addEventListener('test', null, opts);
    } catch (e) {}

    var _ = {
      $(selector) {
        if (typeof selector === 'string') {
          return document.querySelector(selector);
        }
        return selector;
      },
      extend(...args) {
        return Object.assign(...args);
      },
      addListeners(element, events, handler, opts = { passive: false }) {
        if (!(events instanceof Array)) {
          events = [events];
        }
        for (let i = 0; i < events.length; i++) {
          element.addEventListener(
            events[i],
            handler,
            supportsPassive ? opts : false
          );
        }
      },
      removeListeners(element, events, handler) {
        if (!(events instanceof Array)) {
          events = [events];
        }
        for (let i = 0; i < events.length; i++) {
          element.removeEventListener(events[i], handler);
        }
      },
      cumulativeOffset(element) {
        let top = 0;
        let left = 0;

        do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);

        return {
          top: top,
          left: left,
        };
      },
      directScroll(element) {
        return element && element !== document && element !== document.body;
      },
      scrollTop(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollTop = value) : element.scrollTop;
        } else {
          return inSetter
            ? (document.documentElement.scrollTop = document.body.scrollTop = value)
            : window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;
        }
      },
      scrollLeft(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollLeft = value) : element.scrollLeft;
        } else {
          return inSetter
            ? (document.documentElement.scrollLeft = document.body.scrollLeft =
                value)
            : window.pageXOffset ||
                document.documentElement.scrollLeft ||
                document.body.scrollLeft ||
                0;
        }
      },
    };

    // fork of https://github.com/langbamit/svelte-scrollto

    const defaultOptions = {
      container: 'body',
      duration: 500,
      delay: 0,
      offset: 0,
      easing: cubicInOut,
      onStart: noop,
      onDone: noop,
      onAborting: noop,
      scrollX: false,
      scrollY: true,
    };

    const abortEvents = [
      'mousedown',
      'wheel',
      'DOMMouseScroll',
      'mousewheel',
      'keydown',
      'touchmove',
    ];

    const _scrollTo = (options) => {
      let {
        offset,
        duration,
        delay,
        easing,
        x = 0,
        y = 0,
        scrollX,
        scrollY,
        onStart,
        onDone,
        container,
        onAborting,
        element,
      } = options;

      if (typeof offset === 'function') {
        offset = offset();
      }

      const cumulativeOffsetContainer = _.cumulativeOffset(container);
      const cumulativeOffsetTarget = element
        ? _.cumulativeOffset(element)
        : { top: y, left: x };

      const initialX = _.scrollLeft(container);
      const initialY = _.scrollTop(container);

      const targetX =
        cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + offset;
      const targetY =
        cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + offset;

      const diffX = targetX - initialX;
      const diffY = targetY - initialY;

      let scrolling = true;
      let started = false;
      let start_time = now() + delay;
      let end_time = start_time + duration;

      function scrollToTopLeft(element, top, left) {
        if (scrollX) _.scrollLeft(element, left);
        if (scrollY) _.scrollTop(element, top);
      }

      function start(delayStart) {
        if (!delayStart) {
          started = true;
          onStart(element, { x, y });
        }
        _.addListeners(container, abortEvents, stop, { passive: true });
      }

      function tick(progress) {
        scrollToTopLeft(
          container,
          initialY + diffY * progress,
          initialX + diffX * progress
        );
      }

      function stop() {
        scrolling = false;
        _.removeListeners(container, abortEvents, stop);
      }

      loop((now) => {
        if (!started && now >= start_time) {
          start(false);
        }

        if (started && now >= end_time) {
          tick(1);
          stop();
          onDone(element, { x, y });
          return false;
        }

        if (!scrolling) {
          onAborting(element, { x, y });
          return false;
        }
        if (started) {
          const p = now - start_time;
          const t = 0 + 1 * easing(p / duration);
          tick(t);
        }

        return true;
      });

      start(delay);

      tick(0);

      return stop;
    };

    const proceedOptions = (options) => {
      let opts = _.extend({}, defaultOptions, options);
      opts.container = _.$(opts.container);
      opts.element = _.$(opts.element);
      return opts;
    };

    const scrollTo = (options) => {
      return _scrollTo(proceedOptions(options));
    };

    // focus - focusOptions - preventScroll polyfill
    (function() {
      if (
        typeof window === "undefined" ||
        typeof document === "undefined" ||
        typeof HTMLElement === "undefined"
      ) {
        return;
      }

      var supportsPreventScrollOption = false;
      try {
        var focusElem = document.createElement("div");
        focusElem.addEventListener(
          "focus",
          function(event) {
            event.preventDefault();
            event.stopPropagation();
          },
          true
        );
        focusElem.focus(
          Object.defineProperty({}, "preventScroll", {
            get: function() {
              // Edge v18 gives a false positive for supporting inputs
              if (
                navigator &&
                typeof navigator.userAgent !== 'undefined' &&
                navigator.userAgent &&
                navigator.userAgent.match(/Edge\/1[7-8]/)) {
                  return supportsPreventScrollOption = false
              }

              supportsPreventScrollOption = true;
            }
          })
        );
      } catch (e) {}

      if (
        HTMLElement.prototype.nativeFocus === undefined &&
        !supportsPreventScrollOption
      ) {
        HTMLElement.prototype.nativeFocus = HTMLElement.prototype.focus;

        var calcScrollableElements = function(element) {
          var parent = element.parentNode;
          var scrollableElements = [];
          var rootScrollingElement =
            document.scrollingElement || document.documentElement;

          while (parent && parent !== rootScrollingElement) {
            if (
              parent.offsetHeight < parent.scrollHeight ||
              parent.offsetWidth < parent.scrollWidth
            ) {
              scrollableElements.push([
                parent,
                parent.scrollTop,
                parent.scrollLeft
              ]);
            }
            parent = parent.parentNode;
          }
          parent = rootScrollingElement;
          scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);

          return scrollableElements;
        };

        var restoreScrollPosition = function(scrollableElements) {
          for (var i = 0; i < scrollableElements.length; i++) {
            scrollableElements[i][0].scrollTop = scrollableElements[i][1];
            scrollableElements[i][0].scrollLeft = scrollableElements[i][2];
          }
          scrollableElements = [];
        };

        var patchedFocus = function(args) {
          if (args && args.preventScroll) {
            var evScrollableElements = calcScrollableElements(this);
            if (typeof setTimeout === 'function') {
              var thisElem = this;
              setTimeout(function () {
                thisElem.nativeFocus();
                restoreScrollPosition(evScrollableElements);
              }, 0);
            } else {
              this.nativeFocus();
              restoreScrollPosition(evScrollableElements);
            }
          }
          else {
            this.nativeFocus();
          }
        };

        HTMLElement.prototype.focus = patchedFocus;
      }
    })();

    /* node_modules/svelte-parallax/src/Parallax.svelte generated by Svelte v3.49.0 */

    const { scrollTo: scrollTo_1, setTimeout: setTimeout_1, window: window_1 } = globals;
    const file$4 = "node_modules/svelte-parallax/src/Parallax.svelte";

    function create_fragment$4(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[26]);
    	add_render_callback(/*onwindowresize*/ ctx[27]);
    	const default_slot_template = /*#slots*/ ctx[24].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[23], null);

    	let div_levels = [
    		/*$$restProps*/ ctx[12],
    		{
    			class: div_class_value = "parallax-container " + (/*$$restProps*/ ctx[12].class
    			? /*$$restProps*/ ctx[12].class
    			: '')
    		},
    		{
    			style: div_style_value = "height: " + /*$height*/ ctx[1] * /*sections*/ ctx[0] + "px; " + (/*$$restProps*/ ctx[12].style
    			? /*$$restProps*/ ctx[12].style
    			: '') + ";"
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "svelte-15ph2c6", true);
    			add_location(div, file$4, 118, 0, 3603);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[28](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*resize_handler*/ ctx[25], false, false, false),
    					listen_dev(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout_1(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[26]();
    					}),
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[27])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$y*/ 16 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo_1(window_1.pageXOffset, /*$y*/ ctx[4]);
    				scrolling_timeout = setTimeout_1(clear_scrolling, 100);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[23],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[23])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[23], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12],
    				(!current || dirty & /*$$restProps*/ 4096 && div_class_value !== (div_class_value = "parallax-container " + (/*$$restProps*/ ctx[12].class
    				? /*$$restProps*/ ctx[12].class
    				: ''))) && { class: div_class_value },
    				(!current || dirty & /*$height, sections, $$restProps*/ 4099 && div_style_value !== (div_style_value = "height: " + /*$height*/ ctx[1] * /*sections*/ ctx[0] + "px; " + (/*$$restProps*/ ctx[12].style
    				? /*$$restProps*/ ctx[12].style
    				: '') + ";")) && { style: div_style_value }
    			]));

    			toggle_class(div, "svelte-15ph2c6", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[28](null);
    			mounted = false;
    			run_all(dispose);
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
    	const omit_props_names = [
    		"sections","sectionHeight","config","threshold","onProgress","onScroll","disabled","scrollTo"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $height;
    	let $top;
    	let $scrollTop;
    	let $layers;
    	let $progress;
    	let $y;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Parallax', slots, ['default']);
    	let container;

    	// bind:innerHeight
    	let innerHeight;

    	let { sections = 1 } = $$props;
    	let { sectionHeight = undefined } = $$props;
    	let { config = { stiffness: 0.017, damping: 0.26 } } = $$props;
    	let { threshold = { top: 1, bottom: 1 } } = $$props;
    	let { onProgress = undefined } = $$props;
    	let { onScroll = undefined } = $$props;
    	let { disabled = false } = $$props;

    	// bind:scrollY
    	const y = writable(0);

    	validate_store(y, 'y');
    	component_subscribe($$self, y, value => $$invalidate(4, $y = value));

    	// top coord of Parallax container
    	const top = writable(0);

    	validate_store(top, 'top');
    	component_subscribe($$self, top, value => $$invalidate(29, $top = value));

    	// height of a section
    	const height = writable(0);

    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(1, $height = value));

    	// spring store to hold scroll progress
    	const progress = spring(undefined, { ...config, precision: 0.001 });

    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(22, $progress = value));

    	// fake intersection observer
    	const scrollTop = derived([y, top, height], ([$y, $top, $height], set) => {
    		const dy = $y - $top;
    		const min = 0 - $height + $height * threshold.top;
    		const max = $height * sections - $height * threshold.bottom;
    		const step = clamp(dy, min, max);
    		set(step);
    	});

    	validate_store(scrollTop, 'scrollTop');
    	component_subscribe($$self, scrollTop, value => $$invalidate(20, $scrollTop = value));

    	const setProgress = (scrollTop, height) => {
    		if (height === 0) {
    			progress.set(0);
    			return;
    		}

    		const scrollHeight = height * sections - height;
    		progress.set(clamp(scrollTop / scrollHeight, 0, 1));
    	};

    	// eventually filled with ParallaxLayer objects
    	const layers = writableSet(new Set());

    	validate_store(layers, 'layers');
    	component_subscribe($$self, layers, value => $$invalidate(21, $layers = value));

    	setContext(contextKey, {
    		config,
    		addLayer: layer => {
    			layers.add(layer);
    		},
    		removeLayer: layer => {
    			layers.delete(layer);
    		}
    	});

    	onMount(() => {
    		setDimensions();
    	});

    	const setDimensions = () => {
    		height.set(sectionHeight ? sectionHeight : innerHeight);
    		top.set(container.getBoundingClientRect().top + window.pageYOffset);
    	};

    	function scrollTo$1(section, { selector = '', duration = 500, easing = quadInOut } = {}) {
    		const scrollTarget = $top + $height * (section - 1);

    		const focusTarget = () => {
    			document.querySelector(selector).focus({ preventScroll: true });
    		};

    		// don't animate scroll if disabled
    		if (disabled) {
    			window.scrollTo({ top: scrollTarget });
    			selector && focusTarget();
    			return;
    		}

    		scrollTo({
    			y: scrollTarget,
    			duration,
    			easing,
    			onDone: selector
    			? focusTarget
    			: () => {
    					
    				}
    		});
    	}

    	const resize_handler = () => setTimeout(setDimensions, 0);

    	function onwindowscroll() {
    		y.set($y = window_1.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(3, innerHeight = window_1.innerHeight);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('sections' in $$new_props) $$invalidate(0, sections = $$new_props.sections);
    		if ('sectionHeight' in $$new_props) $$invalidate(13, sectionHeight = $$new_props.sectionHeight);
    		if ('config' in $$new_props) $$invalidate(14, config = $$new_props.config);
    		if ('threshold' in $$new_props) $$invalidate(15, threshold = $$new_props.threshold);
    		if ('onProgress' in $$new_props) $$invalidate(16, onProgress = $$new_props.onProgress);
    		if ('onScroll' in $$new_props) $$invalidate(17, onScroll = $$new_props.onScroll);
    		if ('disabled' in $$new_props) $$invalidate(18, disabled = $$new_props.disabled);
    		if ('$$scope' in $$new_props) $$invalidate(23, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onMount,
    		spring,
    		writable,
    		derived,
    		quadInOut,
    		writableSet,
    		contextKey,
    		clamp,
    		svelteScrollTo: scrollTo,
    		container,
    		innerHeight,
    		sections,
    		sectionHeight,
    		config,
    		threshold,
    		onProgress,
    		onScroll,
    		disabled,
    		y,
    		top,
    		height,
    		progress,
    		scrollTop,
    		setProgress,
    		layers,
    		setDimensions,
    		scrollTo: scrollTo$1,
    		$height,
    		$top,
    		$scrollTop,
    		$layers,
    		$progress,
    		$y
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('container' in $$props) $$invalidate(2, container = $$new_props.container);
    		if ('innerHeight' in $$props) $$invalidate(3, innerHeight = $$new_props.innerHeight);
    		if ('sections' in $$props) $$invalidate(0, sections = $$new_props.sections);
    		if ('sectionHeight' in $$props) $$invalidate(13, sectionHeight = $$new_props.sectionHeight);
    		if ('config' in $$props) $$invalidate(14, config = $$new_props.config);
    		if ('threshold' in $$props) $$invalidate(15, threshold = $$new_props.threshold);
    		if ('onProgress' in $$props) $$invalidate(16, onProgress = $$new_props.onProgress);
    		if ('onScroll' in $$props) $$invalidate(17, onScroll = $$new_props.onScroll);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$new_props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*onScroll, $scrollTop*/ 1179648) {
    			if (onScroll) onScroll($scrollTop);
    		}

    		if ($$self.$$.dirty & /*onProgress, $scrollTop, $height*/ 1114114) {
    			if (onProgress) setProgress($scrollTop, $height);
    		}

    		if ($$self.$$.dirty & /*onProgress, $progress*/ 4259840) {
    			if (onProgress) onProgress($progress ?? 0);
    		}

    		if ($$self.$$.dirty & /*$layers, $height*/ 2097154) {
    			// update ParallaxLayers from parent
    			$layers.forEach(layer => {
    				layer.setHeight($height);
    			});
    		}

    		if ($$self.$$.dirty & /*$layers, $scrollTop, $height, disabled*/ 3407874) {
    			$layers.forEach(layer => {
    				layer.setPosition($scrollTop, $height, disabled);
    			});
    		}

    		if ($$self.$$.dirty & /*$height, sectionHeight*/ 8194) {
    			if ($height !== 0) (setDimensions());
    		}
    	};

    	return [
    		sections,
    		$height,
    		container,
    		innerHeight,
    		$y,
    		y,
    		top,
    		height,
    		progress,
    		scrollTop,
    		layers,
    		setDimensions,
    		$$restProps,
    		sectionHeight,
    		config,
    		threshold,
    		onProgress,
    		onScroll,
    		disabled,
    		scrollTo$1,
    		$scrollTop,
    		$layers,
    		$progress,
    		$$scope,
    		slots,
    		resize_handler,
    		onwindowscroll,
    		onwindowresize,
    		div_binding
    	];
    }

    class Parallax extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			sections: 0,
    			sectionHeight: 13,
    			config: 14,
    			threshold: 15,
    			onProgress: 16,
    			onScroll: 17,
    			disabled: 18,
    			scrollTo: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parallax",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get sections() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sections(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sectionHeight() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionHeight(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onProgress() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onProgress(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onScroll() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onScroll(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Parallax>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollTo() {
    		return this.$$.ctx[19];
    	}

    	set scrollTo(value) {
    		throw new Error("<Parallax>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-parallax/src/ParallaxLayer.svelte generated by Svelte v3.49.0 */
    const file$3 = "node_modules/svelte-parallax/src/ParallaxLayer.svelte";
    const get_default_slot_changes = dirty => ({ progress: dirty & /*$progress*/ 1 });
    const get_default_slot_context = ctx => ({ progress: /*$progress*/ ctx[0] });

    function create_fragment$3(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context);

    	let div_levels = [
    		/*$$restProps*/ ctx[5],
    		{
    			class: div_class_value = "parallax-layer " + (/*$$restProps*/ ctx[5].class
    			? /*$$restProps*/ ctx[5].class
    			: '')
    		},
    		{
    			style: div_style_value = "" + (/*$$restProps*/ ctx[5].style
    			? /*$$restProps*/ ctx[5].style
    			: '') + "; height: " + /*height*/ ctx[1] + "px; -ms-transform: " + /*translate*/ ctx[2] + "; -webkit-transform: " + /*translate*/ ctx[2] + "; transform: " + /*translate*/ ctx[2] + ";"
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "svelte-qcp0z5", true);
    			add_location(div, file$3, 68, 0, 2261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $progress*/ 2049)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5],
    				(!current || dirty & /*$$restProps*/ 32 && div_class_value !== (div_class_value = "parallax-layer " + (/*$$restProps*/ ctx[5].class
    				? /*$$restProps*/ ctx[5].class
    				: ''))) && { class: div_class_value },
    				(!current || dirty & /*$$restProps, height, translate*/ 38 && div_style_value !== (div_style_value = "" + (/*$$restProps*/ ctx[5].style
    				? /*$$restProps*/ ctx[5].style
    				: '') + "; height: " + /*height*/ ctx[1] + "px; -ms-transform: " + /*translate*/ ctx[2] + "; -webkit-transform: " + /*translate*/ ctx[2] + "; transform: " + /*translate*/ ctx[2] + ";")) && { style: div_style_value }
    			]));

    			toggle_class(div, "svelte-qcp0z5", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	let translate;
    	const omit_props_names = ["rate","offset","span","onProgress"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $progress;
    	let $coord;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ParallaxLayer', slots, ['default']);
    	let { rate = 0.5 } = $$props;
    	let { offset = 0 } = $$props;
    	let { span = 1 } = $$props;
    	let { onProgress = undefined } = $$props;

    	// get context from Parallax
    	const { config, addLayer, removeLayer } = getContext(contextKey);

    	// spring store to hold changing scroll coordinate
    	const coord = spring(undefined, config);

    	validate_store(coord, 'coord');
    	component_subscribe($$self, coord, value => $$invalidate(10, $coord = value));

    	// and one to hold intersecting progress
    	const progress = spring(undefined, { ...config, precision: 0.001 });

    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(0, $progress = value));

    	// layer height
    	let height;

    	const layer = {
    		setPosition: (scrollTop, sectionHeight, disabled) => {
    			if (disabled) {
    				coord.set(offset * sectionHeight, { hard: true });
    				return;
    			}

    			// amount to scroll before layer is at target position
    			const targetScroll = Math.floor(offset) * sectionHeight;

    			// distance to target position
    			const distance = offset * sectionHeight + targetScroll * rate;

    			coord.set(-(scrollTop * rate) + distance);
    			progress.set(getProgress(scrollTop, rate, distance, sectionHeight));
    		},
    		setHeight: sectionHeight => {
    			$$invalidate(1, height = span * sectionHeight);
    		}
    	};

    	const getProgress = (scrollTop, rate, distance, sectionHeight) => {
    		const apparentRate = rate + 1;
    		const halfWay = distance / apparentRate;
    		const direction = rate >= 0 ? 1 : -1;
    		const scrollDistance = sectionHeight / apparentRate * direction;
    		const start = halfWay - scrollDistance;
    		const end = halfWay + scrollDistance * span;
    		const progress = (scrollTop - start) / (end - start);
    		return clamp(progress, 0, 1);
    	};

    	onMount(() => {
    		// register layer with parent
    		addLayer(layer);

    		return () => {
    			// clean up
    			removeLayer(layer);
    		};
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('rate' in $$new_props) $$invalidate(6, rate = $$new_props.rate);
    		if ('offset' in $$new_props) $$invalidate(7, offset = $$new_props.offset);
    		if ('span' in $$new_props) $$invalidate(8, span = $$new_props.span);
    		if ('onProgress' in $$new_props) $$invalidate(9, onProgress = $$new_props.onProgress);
    		if ('$$scope' in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		spring,
    		contextKey,
    		clamp,
    		rate,
    		offset,
    		span,
    		onProgress,
    		config,
    		addLayer,
    		removeLayer,
    		coord,
    		progress,
    		height,
    		layer,
    		getProgress,
    		translate,
    		$progress,
    		$coord
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('rate' in $$props) $$invalidate(6, rate = $$new_props.rate);
    		if ('offset' in $$props) $$invalidate(7, offset = $$new_props.offset);
    		if ('span' in $$props) $$invalidate(8, span = $$new_props.span);
    		if ('onProgress' in $$props) $$invalidate(9, onProgress = $$new_props.onProgress);
    		if ('height' in $$props) $$invalidate(1, height = $$new_props.height);
    		if ('translate' in $$props) $$invalidate(2, translate = $$new_props.translate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$coord*/ 1024) {
    			// translate layer according to coordinate
    			$$invalidate(2, translate = `translate3d(0px, ${$coord}px, 0px);`);
    		}

    		if ($$self.$$.dirty & /*onProgress, $progress*/ 513) {
    			if (onProgress) onProgress($progress ?? 0);
    		}
    	};

    	return [
    		$progress,
    		height,
    		translate,
    		coord,
    		progress,
    		$$restProps,
    		rate,
    		offset,
    		span,
    		onProgress,
    		$coord,
    		$$scope,
    		slots
    	];
    }

    class ParallaxLayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			rate: 6,
    			offset: 7,
    			span: 8,
    			onProgress: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ParallaxLayer",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get rate() {
    		throw new Error("<ParallaxLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rate(value) {
    		throw new Error("<ParallaxLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<ParallaxLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<ParallaxLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get span() {
    		throw new Error("<ParallaxLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set span(value) {
    		throw new Error("<ParallaxLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onProgress() {
    		throw new Error("<ParallaxLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onProgress(value) {
    		throw new Error("<ParallaxLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Menu.svelte generated by Svelte v3.49.0 */

    const file$2 = "src/Menu.svelte";

    // (5:0) {#if showMenu}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "X";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "test";
    			add_location(p0, file$2, 7, 12, 132);
    			attr_dev(div0, "class", "sidebutton svelte-1ry3fqd");
    			add_location(div0, file$2, 6, 8, 95);
    			add_location(p1, file$2, 9, 8, 173);
    			attr_dev(div1, "class", "backdrop svelte-1ry3fqd");
    			add_location(div1, file$2, 5, 4, 64);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div1, t1);
    			append_dev(div1, p1);

    			if (!mounted) {
    				dispose = listen_dev(p0, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(5:0) {#if showMenu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*showMenu*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showMenu*/ ctx[0]) {
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots('Menu', slots, []);
    	let { showMenu } = $$props;
    	const writable_props = ['showMenu'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('showMenu' in $$props) $$invalidate(0, showMenu = $$props.showMenu);
    	};

    	$$self.$capture_state = () => ({ showMenu });

    	$$self.$inject_state = $$props => {
    		if ('showMenu' in $$props) $$invalidate(0, showMenu = $$props.showMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showMenu, click_handler];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { showMenu: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showMenu*/ ctx[0] === undefined && !('showMenu' in props)) {
    			console.warn("<Menu> was created without expected prop 'showMenu'");
    		}
    	}

    	get showMenu() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showMenu(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Filler.svelte generated by Svelte v3.49.0 */

    const file$1 = "src/Filler.svelte";

    function create_fragment$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "box svelte-nv3ky1");
    			set_style(div, "height", /*length*/ ctx[0] + "em");
    			set_style(div, "background", /*fill*/ ctx[1]);
    			add_location(div, file$1, 5, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*length*/ 1) {
    				set_style(div, "height", /*length*/ ctx[0] + "em");
    			}

    			if (dirty & /*fill*/ 2) {
    				set_style(div, "background", /*fill*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('Filler', slots, []);
    	let { length = 1 } = $$props;
    	let { fill = "black" } = $$props;
    	const writable_props = ['length', 'fill'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filler> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('length' in $$props) $$invalidate(0, length = $$props.length);
    		if ('fill' in $$props) $$invalidate(1, fill = $$props.fill);
    	};

    	$$self.$capture_state = () => ({ length, fill });

    	$$self.$inject_state = $$props => {
    		if ('length' in $$props) $$invalidate(0, length = $$props.length);
    		if ('fill' in $$props) $$invalidate(1, fill = $$props.fill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [length, fill];
    }

    class Filler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { length: 0, fill: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filler",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get length() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set length(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    // (15:3) <ParallaxLayer rate={0} offset={0}>
    function create_default_slot_4(ctx) {
    	let filler;
    	let t;
    	let img;
    	let img_src_value;
    	let current;

    	filler = new Filler({
    			props: { length: 10, fill: "white" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(filler.$$.fragment);
    			t = space();
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "assets/1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "One");
    			attr_dev(img, "class", "svelte-51a234");
    			add_location(img, file, 16, 4, 424);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filler, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filler.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filler.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filler, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(15:3) <ParallaxLayer rate={0} offset={0}>",
    		ctx
    	});

    	return block;
    }

    // (20:3) <ParallaxLayer rate={1.2} offset={0}>
    function create_default_slot_3(ctx) {
    	let filler0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let filler1;
    	let current;
    	filler0 = new Filler({ props: { length: 20 }, $$inline: true });
    	filler1 = new Filler({ props: { length: 100 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(filler0.$$.fragment);
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			create_component(filler1.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "assets/2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "One");
    			attr_dev(img, "class", "svelte-51a234");
    			add_location(img, file, 21, 4, 554);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filler0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(filler1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filler0.$$.fragment, local);
    			transition_in(filler1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filler0.$$.fragment, local);
    			transition_out(filler1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filler0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			destroy_component(filler1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(20:3) <ParallaxLayer rate={1.2} offset={0}>",
    		ctx
    	});

    	return block;
    }

    // (26:3) <ParallaxLayer rate={1}>
    function create_default_slot_2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Hello";
    			set_style(div0, "height", "10em");
    			add_location(div0, file, 27, 5, 708);
    			add_location(p, file, 28, 5, 746);
    			set_style(div1, "color", "white");
    			add_location(div1, file, 26, 4, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(26:3) <ParallaxLayer rate={1}>",
    		ctx
    	});

    	return block;
    }

    // (33:3) <ParallaxLayer rate={1.8}>
    function create_default_slot_1(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "World!";
    			set_style(div0, "height", "60em");
    			add_location(div0, file, 34, 5, 862);
    			add_location(p, file, 35, 5, 900);
    			set_style(div1, "color", "white");
    			add_location(div1, file, 33, 4, 828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(33:3) <ParallaxLayer rate={1.8}>",
    		ctx
    	});

    	return block;
    }

    // (13:2) <Parallax sections={1.5} config={{stiffness: 0.2, damping: 1.0}}>
    function create_default_slot(ctx) {
    	let parallaxlayer0;
    	let t0;
    	let parallaxlayer1;
    	let t1;
    	let parallaxlayer2;
    	let t2;
    	let parallaxlayer3;
    	let current;

    	parallaxlayer0 = new ParallaxLayer({
    			props: {
    				rate: 0,
    				offset: 0,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	parallaxlayer1 = new ParallaxLayer({
    			props: {
    				rate: 1.2,
    				offset: 0,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	parallaxlayer2 = new ParallaxLayer({
    			props: {
    				rate: 1,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	parallaxlayer3 = new ParallaxLayer({
    			props: {
    				rate: 1.8,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parallaxlayer0.$$.fragment);
    			t0 = space();
    			create_component(parallaxlayer1.$$.fragment);
    			t1 = space();
    			create_component(parallaxlayer2.$$.fragment);
    			t2 = space();
    			create_component(parallaxlayer3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(parallaxlayer0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(parallaxlayer1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(parallaxlayer2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(parallaxlayer3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const parallaxlayer0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				parallaxlayer0_changes.$$scope = { dirty, ctx };
    			}

    			parallaxlayer0.$set(parallaxlayer0_changes);
    			const parallaxlayer1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				parallaxlayer1_changes.$$scope = { dirty, ctx };
    			}

    			parallaxlayer1.$set(parallaxlayer1_changes);
    			const parallaxlayer2_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				parallaxlayer2_changes.$$scope = { dirty, ctx };
    			}

    			parallaxlayer2.$set(parallaxlayer2_changes);
    			const parallaxlayer3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				parallaxlayer3_changes.$$scope = { dirty, ctx };
    			}

    			parallaxlayer3.$set(parallaxlayer3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parallaxlayer0.$$.fragment, local);
    			transition_in(parallaxlayer1.$$.fragment, local);
    			transition_in(parallaxlayer2.$$.fragment, local);
    			transition_in(parallaxlayer3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parallaxlayer0.$$.fragment, local);
    			transition_out(parallaxlayer1.$$.fragment, local);
    			transition_out(parallaxlayer2.$$.fragment, local);
    			transition_out(parallaxlayer3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parallaxlayer0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(parallaxlayer1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(parallaxlayer2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(parallaxlayer3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:2) <Parallax sections={1.5} config={{stiffness: 0.2, damping: 1.0}}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let main;
    	let parallax;
    	let current;

    	parallax = new Parallax({
    			props: {
    				sections: 1.5,
    				config: { stiffness: 0.2, damping: 1.0 },
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			main = element("main");
    			create_component(parallax.$$.fragment);
    			attr_dev(main, "class", "svelte-51a234");
    			add_location(main, file, 11, 1, 262);
    			set_style(div, "background", "#2A2A2A");
    			add_location(div, file, 10, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, main);
    			mount_component(parallax, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const parallax_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				parallax_changes.$$scope = { dirty, ctx };
    			}

    			parallax.$set(parallax_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parallax.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parallax.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(parallax);
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
    	let showMenu = false;
    	const toggleMenu = () => showMenu = !showMenu;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Parallax,
    		ParallaxLayer,
    		Menu,
    		Filler,
    		showMenu,
    		toggleMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ('showMenu' in $$props) showMenu = $$props.showMenu;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

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
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
