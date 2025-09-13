// IndexedDB를 사용한 미디어 파일 저장 서비스
class MediaStorageService {
    private dbName = 'finalmessage-media';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    async initDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // 미디어 파일 저장소
                if (!db.objectStoreNames.contains('mediaFiles')) {
                    const store = db.createObjectStore('mediaFiles', { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    async storeMediaFile(file: any): Promise<void> {
        const db = await this.initDB();
        const transaction = db.transaction(['mediaFiles'], 'readwrite');
        const store = transaction.objectStore('mediaFiles');
        
        await new Promise<void>((resolve, reject) => {
            const request = store.put(file);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getMediaFile(id: string): Promise<any | null> {
        const db = await this.initDB();
        const transaction = db.transaction(['mediaFiles'], 'readonly');
        const store = transaction.objectStore('mediaFiles');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllMediaFiles(): Promise<any[]> {
        const db = await this.initDB();
        const transaction = db.transaction(['mediaFiles'], 'readonly');
        const store = transaction.objectStore('mediaFiles');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMediaFile(id: string): Promise<void> {
        const db = await this.initDB();
        const transaction = db.transaction(['mediaFiles'], 'readwrite');
        const store = transaction.objectStore('mediaFiles');
        
        await new Promise<void>((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearAllMediaFiles(): Promise<void> {
        const db = await this.initDB();
        const transaction = db.transaction(['mediaFiles'], 'readwrite');
        const store = transaction.objectStore('mediaFiles');
        
        await new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 스토리지 크기 추정
    async getStorageSize(): Promise<number> {
        const files = await this.getAllMediaFiles();
        return files.reduce((total, file) => {
            if (file.url && file.url.startsWith('data:')) {
                // Base64 데이터 크기 추정 (실제 크기의 약 1.33배)
                return total + (file.url.length * 0.75);
            }
            return total;
        }, 0);
    }
}

export const mediaStorage = new MediaStorageService();