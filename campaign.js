/* EDA Quest — reglas puras de acceso a la campaña.
 * La ruta se calcula a partir del progreso; ningún candado es solo visual.
 * Los logros previos se conservan aunque ahora falten misiones anteriores.
 */
(function (root) {
  'use strict';

  const order = Object.freeze(['variables', 'autobuses', 'esperas', 'graficos', 'auditoria', 'codigo']);
  const coreLength = 5;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const known = id => typeof id === 'string' && order.includes(id);

  function isComplete(id, completed) {
    if (!known(id) || !completed || typeof completed !== 'object' || Array.isArray(completed) || !own(completed, id)) return false;
    const record = completed[id];
    return !!record && typeof record === 'object' && !Array.isArray(record) && own(record, 'stars') && Number.isInteger(record.stars) && record.stars >= 1 && record.stars <= 3;
  }

  function prerequisites(id) {
    const index = order.indexOf(id);
    return index < 0 ? [] : order.slice(0, index);
  }

  function missing(id, completed) {
    return prerequisites(id).filter(previous => !isComplete(previous, completed));
  }

  function unlocked(id, completed) {
    return known(id) && missing(id, completed).length === 0;
  }

  function next(completed) {
    return order.find(id => !isComplete(id, completed) && unlocked(id, completed)) || 'auditoria';
  }

  function accessible(completed) {
    return order.filter(id => unlocked(id, completed));
  }

  function completedCount(completed, includeExtra = false) {
    return order.slice(0, includeExtra ? order.length : coreLength).filter(id => isComplete(id, completed)).length;
  }

  function routeStatus(id, completed) {
    if (!unlocked(id, completed)) return 'locked';
    if (isComplete(id, completed)) return 'completed';
    return id === next(completed) ? 'current' : 'available';
  }

  function canResume(session, completed) {
    if (!session || typeof session !== 'object' || !['mission', 'quick', 'review'].includes(session.mode)) return false;
    if (!Array.isArray(session.queue) || session.queue.length === 0) return false;
    if (session.mode === 'mission') {
      if (!unlocked(session.id, completed)) return false;
      if (!session.queue.every(item => item && item.origin === session.id)) return false;
    } else if (session.id !== session.mode) return false;
    return session.queue.every(item => item && typeof item === 'object' && unlocked(item.origin, completed));
  }

  root.EDA_CAMPAIGN = Object.freeze({order, prerequisites, unlocked, missing, next, accessible, completedCount, canResume, routeStatus, isComplete});
})(typeof window !== 'undefined' ? window : globalThis);
