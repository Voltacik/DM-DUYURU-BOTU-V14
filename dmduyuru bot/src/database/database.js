import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        try {
            const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database.db');
            this.db = new Database(dbPath);
            
            console.log('✅ Veritabanı bağlantısı başarılı');
            this.createTables();
        } catch (error) {
            console.error('❌ Veritabanı bağlantı hatası:', error);
            throw error;
        }
    }

    createTables() {
        try {
            // Toplu DM log tablosu oluştur
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS toplu_dm_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    gonderen_kullanici_id TEXT NOT NULL,
                    gonderen_kullanici_tag TEXT NOT NULL,
                    mesaj_baslik TEXT NOT NULL,
                    mesaj_icerik TEXT NOT NULL,
                    embed_renk TEXT NOT NULL,
                    hedef_sunucular TEXT NOT NULL,
                    basarili_gonderim INTEGER DEFAULT 0,
                    basarisiz_gonderim INTEGER DEFAULT 0,
                    toplam_hedef INTEGER DEFAULT 0,
                    gonderim_zamani DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            this.db.exec(createTableQuery);
            console.log('✅ Veritabanı tabloları oluşturuldu');
        } catch (error) {
            console.error('❌ Tablo oluşturma hatası:', error);
            throw error;
        }
    }

    // Toplu DM işlemini logla
    logBulkDM(data) {
        try {
            const insertQuery = `
                INSERT INTO toplu_dm_log (
                    gonderen_kullanici_id,
                    gonderen_kullanici_tag,
                    mesaj_baslik,
                    mesaj_icerik,
                    embed_renk,
                    hedef_sunucular,
                    basarili_gonderim,
                    basarisiz_gonderim,
                    toplam_hedef
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const stmt = this.db.prepare(insertQuery);
            const result = stmt.run(
                data.gonderen_kullanici_id,
                data.gonderen_kullanici_tag,
                data.mesaj_baslik,
                data.mesaj_icerik,
                data.embed_renk,
                data.hedef_sunucular,
                data.basarili_gonderim,
                data.basarisiz_gonderim,
                data.toplam_hedef
            );
            
            console.log(`✅ İşlem veritabanına kaydedildi (ID: ${result.lastInsertRowid})`);
            return result.lastInsertRowid;
        } catch (error) {
            console.error('❌ Veritabanı kayıt hatası:', error);
            throw error;
        }
    }

    // Son işlemleri getir
    getRecentLogs(limit = 10) {
        try {
            const query = `
                SELECT * FROM toplu_dm_log 
                ORDER BY gonderim_zamani DESC 
                LIMIT ?
            `;
            const stmt = this.db.prepare(query);
            return stmt.all(limit);
        } catch (error) {
            console.error('❌ Log getirme hatası:', error);
            return [];
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            console.log('✅ Veritabanı bağlantısı kapatıldı');
        }
    }
}

export default new DatabaseManager();