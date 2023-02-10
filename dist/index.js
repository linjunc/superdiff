"use strict";

var r = {
  ADDED: "added",
  EQUAL: "equal",
  MOVED: "moved",
  DELETED: "deleted",
  UPDATED: "updated",
};
function d(e, t, n = { ignoreArrayOrder: !1 }) {
  return typeof e != typeof t
    ? !1
    : Array.isArray(e)
    ? e.length !== t.length
      ? !1
      : n.ignoreArrayOrder
      ? e.every((i) => t.some((s) => JSON.stringify(s) === JSON.stringify(i)))
      : e.every((i, s) => JSON.stringify(i) === JSON.stringify(t[s]))
    : typeof e == "object"
    ? JSON.stringify(e) === JSON.stringify(t)
    : e === t;
}
function p(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function A(e) {
  return e.some((t) => t.status !== r.EQUAL) ? r.UPDATED : r.EQUAL;
}
function E(e, t) {
  if (!e) return { type: "object", status: r.isEqual, diff: [] };
  let n = [];
  return (
    Object.entries(e).forEach(([i, s]) => {
      if (p(s)) {
        let f = [];
        return (
          Object.entries(s).forEach(([u, o]) => {
            f.push({
              name: u,
              previousValue: t === r.ADDED ? void 0 : o,
              currentValue: t === r.ADDED ? o : void 0,
              status: t,
            });
          }),
          n.push({
            property: i,
            previousValue: t === r.ADDED ? void 0 : e[i],
            currentValue: t === r.ADDED ? s : void 0,
            status: t,
            subPropertiesDiff: f,
          })
        );
      }
      return n.push({
        property: i,
        previousValue: t === r.ADDED ? void 0 : e[i],
        currentValue: t === r.ADDED ? s : void 0,
        status: t,
      });
    }),
    { type: "object", status: t, diff: n }
  );
}
function S(e, t, n) {
  if (!e) return;
  let i = Object.entries(e).find(([s]) => d(s, t, n));
  return i ? i[1] : void 0;
}
function l(e, t, n) {
  return d(e, t, n) ? r.EQUAL : r.UPDATED;
}
function j(e) {
  return e.some((t) => t.status !== r.EQUAL) ? r.UPDATED : r.EQUAL;
}
function y(e, t) {
  if (!e) return;
  let n = Object.keys(e),
    i = Object.keys(t),
    s = n.filter((f) => !i.includes(f));
  if (s.length > 0) return s.map((f) => ({ property: f, value: e[f] }));
}
function b(e, t, n) {
  let i = [],
    s,
    f = y(e, t);
  return (
    f &&
      f.forEach((u) => {
        i.push({
          name: u.property,
          previousValue: u.value,
          currentValue: void 0,
          status: r.DELETED,
        });
      }),
    Object.entries(t).forEach(([u, o]) => {
      let D = S(e, u, n);
      if (!D)
        return i.push({
          name: u,
          previousValue: D,
          currentValue: o,
          status: !e || !(u in e) ? r.ADDED : D === o ? r.EQUAL : r.UPDATED,
        });
      if (p(o)) {
        let a = b(D, o, n);
        a && a.length > 0 && (s = a);
      }
      D &&
        i.push({
          name: u,
          previousValue: D,
          currentValue: o,
          status: l(D, o, n),
          ...(!!s && { subDiff: s }),
        });
    }),
    i
  );
}
function g(e, t, n) {
  if (!e && !t) return { type: "object", status: r.EQUAL, diff: [] };
  if (!e) return E(t, r.ADDED);
  if (!t) return E(e, r.DELETED);
  let i = [];
  Object.entries(t).forEach(([f, u]) => {
    let o = e[f];
    if (!o)
      return i.push({
        property: f,
        previousValue: o,
        currentValue: u,
        status: f in e ? (o === u ? r.EQUAL : r.UPDATED) : r.ADDED,
      });
    if (p(u)) {
      let D = b(o, u, n),
        a = j(D);
      return i.push({
        property: f,
        previousValue: o,
        currentValue: u,
        status: a,
        ...(a !== r.EQUAL && { subPropertiesDiff: D }),
      });
    }
    return i.push({
      property: f,
      previousValue: o,
      currentValue: u,
      status: l(o, u, n),
    });
  });
  let s = y(e, t);
  return (
    s &&
      s.forEach((f) => {
        i.push({
          property: f.property,
          previousValue: f.value,
          currentValue: void 0,
          status: r.DELETED,
        });
      }),
    { type: "object", status: A(i), diff: i }
  );
}
function O(e, t) {
  return {
    type: "list",
    status: t,
    diff: e.map((n, i) => ({
      value: n,
      prevIndex: t === r.ADDED ? null : i,
      newIndex: t === r.ADDED ? i : null,
      indexDiff: null,
      status: t,
    })),
  };
}
function L(e) {
  return e.some((t) => t.status !== r.EQUAL) ? r.UPDATED : r.EQUAL;
}
var m = (e, t) => {
  if (!e && !t) return { type: "list", status: r.EQUAL, diff: [] };
  if (!e) return O(t, r.ADDED);
  if (!t) return O(e, r.DELETED);
  let n = [],
    i = [];
  return (
    t.forEach((s, f) => {
      let u = e.findIndex((D, a) => d(D, s) && !i.includes(a));
      u > -1 && i.push(u);
      let o = u === -1 ? null : f - u;
      return o === 0
        ? n.push({
            value: s,
            prevIndex: u,
            newIndex: f,
            indexDiff: o,
            status: r.EQUAL,
          })
        : u === -1
        ? n.push({
            value: s,
            prevIndex: null,
            newIndex: f,
            indexDiff: o,
            status: r.ADDED,
          })
        : n.push({
            value: s,
            prevIndex: u,
            newIndex: f,
            indexDiff: o,
            status: r.MOVED,
          });
    }),
    e.forEach((s, f) => {
      if (!i.includes(f))
        return n.splice(f, 0, {
          value: s,
          prevIndex: f,
          newIndex: null,
          indexDiff: null,
          status: r.DELETED,
        });
    }),
    { type: "list", status: L(n), diff: n }
  );
};

exports.getListDiff = m;
exports.getObjectDiff = g;
exports.isEqual = d;
exports.isObject = p;
