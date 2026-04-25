import Dexie from 'dexie';

export const db = new Dexie('GiuseppeDB');
db.version(1).stores({
  customers: '++id, name, city, address, phone',
  auditLog: '++id, timestamp, action'
});

export const addLog = async (action) => {
  await db.auditLog.add({
    timestamp: new Date().toISOString(),
    action
  });
};
