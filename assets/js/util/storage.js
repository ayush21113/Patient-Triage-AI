function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function createMemoryAuditStore(records = []) {
  return {
    persistent: false,
    async all() {
      return structuredClone(records).sort((left, right) =>
        left.sequence - right.sequence
      );
    },
    async add(record) {
      if (records.some(({ sequence }) => sequence === record.sequence)) {
        throw new Error("Audit sequence already exists");
      }
      records.push(structuredClone(record));
    }
  };
}

export async function openAuditStore(indexedDatabase = globalThis.indexedDB) {
  if (!indexedDatabase) return createMemoryAuditStore();
  try {
    const request = indexedDatabase.open("ptai", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.createObjectStore("audit", {
        keyPath: "sequence"
      });
      store.createIndex("byEncounter", "encounterId", { unique: false });
    };
    const database = await requestResult(request);
    return {
      persistent: true,
      async all() {
        const transaction = database.transaction("audit", "readonly");
        return requestResult(transaction.objectStore("audit").getAll());
      },
      async add(record) {
        const transaction = database.transaction("audit", "readwrite");
        transaction.objectStore("audit").add(record);
        await transactionComplete(transaction);
      }
    };
  } catch {
    return createMemoryAuditStore();
  }
}
