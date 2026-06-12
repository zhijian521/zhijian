/*!
 * Zhijian Analytics — 站点监控嵌入脚本
 *
 * 用法：<script async src="/script.js" data-site-id="YOUR_SITE_ID"></script>
 *
 * 采集数据：
 * - 页面浏览 (PV) / 独立访客 (UV) / 会话追踪
 * - 页面停留时长（visibilitychange）
 * - SPA 路由变化（pushState / replaceState / popstate）
 * - 设备信息（屏幕尺寸、语言）
 *
 * 上报：sendBeacon(text/plain) 优先，fetch keepalive 降级
 */
(function () {
  'use strict';

  /*-- 配置 --*/
  var BATCH_INTERVAL = 5000;
  var VISITOR_COOKIE = '_zj_vid';
  var SESSION_KEY = '_zj_sid';
  var VISITOR_TTL = 365;

  /*-- 从 <script> 标签读取 siteId 和上报地址 --*/
  var scriptEl = document.currentScript;
  var siteId = scriptEl ? scriptEl.getAttribute('data-site-id') : '';
  if (!siteId) return;

  // 上报地址：优先 data-collect-url 属性，否则从 src 推断
  var COLLECT_URL = scriptEl.getAttribute('data-collect-url') || '';
  if (!COLLECT_URL) {
    var src = (scriptEl.getAttribute('src') || '').match(/^(https?:\/\/[^/]+)/);
    COLLECT_URL = src ? src[1] + '/api/collect' : '/api/collect';
  }

  /*-- 状态 --*/
  var queue = [];
  var flushing = false;
  var leftPage = false;
  var timer = null;
  var enterTime = 0;
  var lastPageviewUrl = '';
  var lastPageviewTs = 0;
  var sessionVisited = {};  // session 内已访问过的路径去重

  /*-- 工具函数 --*/

  function randomId() {
    return Math.random().toString(16).slice(2, 10);
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  /* B6 修复：改用 localStorage 存储访客 ID，第三方嵌入场景下 cookie SameSite=Lax 无法写入 */
  var VISITOR_KEY = '_zj_vid';

  function getVisitorId() {
    try {
      var vid = localStorage.getItem(VISITOR_KEY);
      if (!vid) {
        vid = randomId() + randomId();
        localStorage.setItem(VISITOR_KEY, vid);
      }
      return vid;
    } catch (e) {
      // localStorage 不可用时降级到 cookie
      var vid = getCookie(VISITOR_COOKIE);
      if (!vid) {
        vid = randomId() + randomId();
        setCookie(VISITOR_COOKIE, vid, VISITOR_TTL);
      }
      return vid;
    }
  }

  function getSessionId() {
    var sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = randomId() + randomId();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  function isNewVisitor() {
    try {
      return !localStorage.getItem(VISITOR_KEY);
    } catch (e) {
      return !getCookie(VISITOR_COOKIE);
    }
  }

  function isSessionStart() {
    var key = '_zj_ss';
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  }

  function truncate(s, max) {
    if (!s) return '';
    return s.length > max ? s.slice(0, max) : s;
  }

  function getPath() {
    return truncate(location.pathname + location.search, 500);
  }

  /*-- 事件构建 --*/

  function buildEvent(type) {
    var evt = {
      type: type,
      url: getPath(),
      referrer: truncate(document.referrer, 500),
      title: truncate(document.title, 500),
      screen: screen.width + 'x' + screen.height,
      lang: truncate(navigator.language, 10),
      ua: truncate(navigator.userAgent, 500),  // #12 新增：采集 UA
      isNew: isNewVisitor() ? 1 : 0,
      isSessionStart: isSessionStart() ? 1 : 0,
      ts: Date.now()
    };
    if (type === 'leave' && enterTime > 0) {
      evt.duration = Math.round((Date.now() - enterTime) / 1000);
    }
    return evt;
  }

  /*-- 上报 --*/

  function flush() {
    if (queue.length === 0 || flushing) return;
    flushing = true;

    var items = queue.splice(0);
    var visitorId = getVisitorId();
    var sessionId = getSessionId();

    var payload = {
      siteId: siteId,
      visitorId: visitorId,
      sessionId: sessionId,
      events: items
    };

    var body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: 'text/plain' });
      var sent = navigator.sendBeacon(COLLECT_URL, blob);
      if (sent) { flushing = false; return; }
    }

    if (typeof fetch === 'function') {
      try {
        fetch(COLLECT_URL, {
          method: 'POST',
          body: body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          credentials: 'omit'
        }).catch(function () {}).finally(function () { flushing = false; });
        return;
      } catch (e) { /* 静默 */ }
    }

    flushing = false;
  }

  function scheduleFlush() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      flush();
    }, BATCH_INTERVAL);
  }

  /*-- 事件追踪 --*/

  function trackPageview() {
    var url = getPath();

    // 短防抖：同 URL + title 500ms 内不重复触发（防止 SPA 路由事件重复触发）
    var title = truncate(document.title, 500);
    var key = url + '\t' + title;
    if (key === lastPageviewUrl && Date.now() - lastPageviewTs < 500) return;
    lastPageviewUrl = key;
    lastPageviewTs = Date.now();

    // session 内去重：同一路径只记录第一次访问，避免用户来回切换页面产生大量重复
    if (sessionVisited[url]) return;
    sessionVisited[url] = true;

    queue.push(buildEvent('pageview'));
    enterTime = Date.now();
    leftPage = false;

    scheduleFlush();
  }

  function trackLeave() {
    if (leftPage) return;
    leftPage = true;

    // 不重置 lastPageviewUrl/Ts：保留防抖状态，避免用户切标签页再切回时产生重复 pageview

    queue.push(buildEvent('leave'));

    // 清掉定时器，立即把 pageview + leave 一起上报
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    flush();
  }

  /*-- SPA 路由变化 --*/

  function patchHistoryMethod(method) {
    var original = history[method];
    if (!original) return;
    history[method] = function () {
      var result = original.apply(this, arguments);
      var event = new Event('zj:' + method);
      window.dispatchEvent(event);
      return result;
    };
  }

  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');

  /*-- 事件监听 --*/

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageview);
  } else {
    trackPageview();
  }

  window.addEventListener('zj:pushState', trackPageview);
  window.addEventListener('zj:replaceState', trackPageview);
  window.addEventListener('popstate', trackPageview);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      trackLeave();
    }
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      trackPageview();
    }
  });
})();
